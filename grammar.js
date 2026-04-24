/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

/**
 * tree-sitter-vertex
 *
 * Grammar for the Vertex programming language — an ML-family language that
 * transpiles to Apex. The grammar is structured after tree-sitter-rust
 * (declaration layout, PREC table, generics disambiguation) and
 * tree-sitter-gleam (labelled arguments, pattern spreads, multi-subject
 * match).
 *
 * Node names follow the compiler's AST where practical so queries remain
 * stable as the language evolves. Named fields are used aggressively — the
 * Zed outline, highlight, and LSP queries all read fields rather than
 * positional children.
 */

const PREC = {
  pipe: 1,           // |>
  or: 2,             // ||
  and: 3,            // &&
  equality: 4,       // ==, !=
  comparison: 5,     // <, <=, >, >=
  additive: 6,       // +, -
  multiplicative: 7, // *, /, %
  unary: 8,          // !expr, -expr

  try: 10,           // expr?
  call: 11,          // foo(args), Type(args), expr.m(args)
  field: 12,         // expr.field, expr[idx]

  generic: 20,       // disambiguate `<` for type args
  closure: -1,       // closures are last resort
};

module.exports = grammar({
  name: 'vertex',

  extras: $ => [/\s/, $.line_comment],

  word: $ => $.identifier,

  supertypes: $ => [
    $._declaration,
    $._statement,
    $._expression,
    $._expression_ending_with_block,
    $._type,
    $._pattern,
    $._literal,
  ],

  conflicts: $ => [
    // In `extern new Foo.Bar.baz(...)`, after parsing `Foo.Bar` the parser
    // cannot tell (with one token lookahead) whether the next `.` extends
    // the qualified type path or begins the constructor-name tail.
    // Same ambiguity applies to extern method / field / var / new paths
    // where the final segment is a lowercase identifier.
    [$.qualified_type],
    // `foo<T>(args)` (generic call) vs `foo < T > (args)` (three-way
    // comparison of expressions). GLR handles the ambiguity, and the
    // precedence on `call_expression`/`type_arguments` favours the generic
    // interpretation where both are legal.
    [$.call_expression, $.binary_expression],
    // Unary `-expr` at the left of `<` could continue as binary comparison
    // or be split into (-x) and (x < y...). Same GLR treatment as above.
    [$.call_expression, $.binary_expression, $.unary_expression],
    // After `<`, the next ident could be the start of a named_type (for
    // type_arguments) or an identifier_expression (for a comparison RHS).
    // GLR tries both; call_expression precedence picks the winner.
    [$.named_type, $.identifier_expression],
    [$.qualified_type, $.type_identifier_expression],
    // After `<fn()`, could be a function_type in type_arguments or an
    // anonymous_function in the binary-expression RHS slot.
    [$.function_type, $.anonymous_function_parameters],
  ],

  rules: {
    // ─── Root ────────────────────────────────────────────────────────────
    // Vertex files consist of zero or more imports followed by a mix of
    // top-level declarations and statements. Annotations always attach to
    // the following declaration via `annotated_declaration`. Module-level
    // annotations (`@WithSharing`, etc. — ADR 071) syntactically look the
    // same as declaration annotations; the checker applies ADR 071 rules
    // based on the annotation name.
    source_file: $ => seq(
      repeat($.import_declaration),
      repeat($._top_level_item),
    ),

    _top_level_item: $ => choice(
      $.annotated_declaration,
      $.bare_module_annotation,
      $._declaration,
      $._statement,
    ),

    // A module-level annotation that attaches to the module (ADR 071).
    // Appears when a file has annotations before top-level statements
    // (no trailing declaration to attach them to). We use a distinct rule
    // so the parser doesn't need to look ahead past the annotation list.
    bare_module_annotation: $ => prec(-1, $.annotation),

    annotated_declaration: $ => seq(
      repeat1($.annotation),
      $._declaration,
    ),

    // ─── Comments ────────────────────────────────────────────────────────
    line_comment: _ => token(seq('//', /[^\n]*/)),

    // ─── Annotations ─────────────────────────────────────────────────────
    // Annotations attach to `fn`, `type`, `const`, `extern`, or the whole
    // module (when they appear before any import/declaration).
    annotation: $ => prec.right(seq(
      '@',
      field('name', $.type_identifier),
      optional($.annotation_arguments),
    )),

    annotation_arguments: $ => seq(
      '(',
      commaSepTrailing($.annotation_argument),
      ')',
    ),

    annotation_argument: $ => choice(
      seq(field('label', $.identifier), ':', field('value', $._annotation_literal)),
      field('value', $._annotation_literal),
    ),

    _annotation_literal: $ => choice(
      $.string_literal,
      $.number_literal,
      $.boolean_literal,
      $.type_identifier,
    ),

    // ─── Imports ─────────────────────────────────────────────────────────
    // import a.b.c
    // import a.b.c as alias
    // import a.b.c.{ x, y }
    import_declaration: $ => seq(
      'import',
      field('path', $.import_path),
      optional(choice(
        seq('as', field('alias', $.identifier)),
        field('selected', $.import_selection),
      )),
    ),

    // Dotted path: `a.b.c`. We use explicit repeat rather than sepBy so the
    // rule doesn't interact with `prec.left` wrappers in other dotted rules.
    import_path: $ => seq(
      $.identifier,
      repeat(seq('.', $.identifier)),
    ),

    // `.{ x, y, z }` — fuse `.` and `{` into a single token so the parser
    // can distinguish `import a.b` (extend path) from `import a.{ b }`
    // (selective import) by a single lookahead.
    import_selection: $ => seq(
      $._dot_lbrace,
      commaSepTrailing($.identifier),
      '}',
    ),

    _dot_lbrace: _ => token(seq('.', /[ \t]*/, '{')),

    // ─── Declarations ────────────────────────────────────────────────────
    _declaration: $ => choice(
      $.function_declaration,
      $.type_declaration,
      $.type_alias_declaration,
      $.const_declaration,
      $.extern_type_declaration,
      $.extern_fn_declaration,
      $.extern_new_declaration,
      $.extern_method_declaration,
      $.extern_field_declaration,
      $.extern_var_declaration,
      $.extern_enum_declaration,
    ),

    access_modifier: _ => choice('pub', 'global'),

    // ─── Function declaration ────────────────────────────────────────────
    // [pub|global] fn name<T,...>(params): ReturnType { body }
    // Private functions may omit return type (ADR 066).
    function_declaration: $ => seq(
      optional($.access_modifier),
      'fn',
      field('name', $.identifier),
      optional(field('type_parameters', $.type_parameters)),
      field('parameters', $.parameter_list),
      optional(seq(':', field('return_type', $._type))),
      field('body', $.block),
    ),

    type_parameters: $ => seq(
      '<',
      commaSepTrailing1($.type_identifier),
      '>',
    ),

    parameter_list: $ => seq('(', commaSepTrailing($.parameter), ')'),

    parameter: $ => seq(
      field('pattern', $._param_pattern),
      ':',
      field('type', $._type),
      optional(seq('=', field('default', $._expression))),
    ),

    _param_pattern: $ => choice(
      $.identifier_pattern,
      $.variant_pattern,
      $.tuple_pattern,
    ),

    // ─── Type declaration (sum type) ─────────────────────────────────────
    // [pub|global] [opaque] type Name<T,...> { V1, V2(f: T), ... }
    type_declaration: $ => seq(
      optional($.access_modifier),
      optional('opaque'),
      'type',
      field('name', $.type_identifier),
      optional(field('type_parameters', $.type_parameters)),
      '{',
      commaSepTrailing1($.variant),
      '}',
    ),

    // Type alias — `type Name<T,...> = SomeType`
    type_alias_declaration: $ => seq(
      optional($.access_modifier),
      'type',
      field('name', $.type_identifier),
      optional(field('type_parameters', $.type_parameters)),
      '=',
      field('aliased', $._type),
    ),

    variant: $ => seq(
      field('name', $.type_identifier),
      optional($.variant_fields),
    ),

    variant_fields: $ => seq(
      '(',
      commaSepTrailing($.variant_field),
      ')',
    ),

    // Variant fields accept both lowercase (`radius`) and PascalCase (`Name`)
    // names — the latter is common for @SObject types where Apex field
    // names are canonically PascalCase.
    variant_field: $ => seq(
      field('name', $._symbol_name),
      ':',
      field('type', $._type),
    ),

    // A symbol name is an identifier *or* a type identifier. The Vertex
    // parser's _consumeSymbolIdent also accepts the `as` keyword in
    // symbol-name position (`.as(...)` as a method call); we alias it
    // here so tree-sitter surfaces it as a normal identifier in queries.
    _symbol_name: $ => choice(
      $.identifier,
      $.type_identifier,
      alias('as', $.identifier),
    ),

    // ─── Const declaration ───────────────────────────────────────────────
    // [pub|global] const name [: type] = literal
    const_declaration: $ => seq(
      optional($.access_modifier),
      'const',
      field('name', $.identifier),
      optional(seq(':', field('type', $._type))),
      '=',
      field('value', $._expression),
    ),

    // ─── Extern declarations ─────────────────────────────────────────────
    extern_type_declaration: $ => seq(
      optional($.access_modifier),
      'extern', 'type',
      field('name', $.qualified_type),
    ),

    extern_fn_declaration: $ => seq(
      optional($.access_modifier),
      'extern', 'fn',
      field('name', $.extern_fn_name),
      field('parameters', $.parameter_list),
      ':',
      field('return_type', $._type),
      optional(seq('=', field('apex_override', $.string_literal))),
    ),

    // An extern-fn name: zero or more TypeIdent segments followed by a
    // lowercase identifier. e.g. `getCpuTime`, `Limits.getCpuTime`,
    // `Messaging.reserveSingleEmailCapacity`.
    extern_fn_name: $ => seq(
      repeat(seq($.type_identifier, '.')),
      $.identifier,
    ),

    extern_new_declaration: $ => seq(
      optional($.access_modifier),
      'extern', 'new',
      field('name', $.qualified_type),
      optional(seq('.', field('constructor_name', $.identifier))),
      field('parameters', $.parameter_list),
      ':',
      field('return_type', $._type),
    ),

    extern_method_declaration: $ => seq(
      optional($.access_modifier),
      'extern', 'method',
      field('receiver', $.qualified_type),
      '.',
      field('method_name', $.identifier),
      field('parameters', $.parameter_list),
      ':',
      field('return_type', $._type),
      optional(seq('=', field('apex_override', $.string_literal))),
    ),

    extern_field_declaration: $ => seq(
      optional($.access_modifier),
      'extern', 'field',
      field('receiver', $.qualified_type),
      '.',
      field('field_name', $.identifier),
      ':',
      field('field_type', $._type),
    ),

    extern_var_declaration: $ => seq(
      optional($.access_modifier),
      'extern', 'var',
      field('receiver', $.qualified_type),
      '.',
      field('field_name', $.identifier),
      ':',
      field('field_type', $._type),
    ),

    extern_enum_declaration: $ => seq(
      optional($.access_modifier),
      'extern', 'enum',
      field('name', $.qualified_type),
      '{',
      commaSepTrailing1($.extern_enum_variant),
      '}',
    ),

    extern_enum_variant: $ => field('name', $.type_identifier),

    // TypeIdent (. TypeIdent)* — e.g. `Messaging.SingleEmailMessage`.
    qualified_type: $ => sepBy1('.', $.type_identifier),

    // ─── Block ───────────────────────────────────────────────────────────
    // Blocks may end in a trailing expression which becomes the block's
    // value (ADR 031).
    block: $ => seq(
      '{',
      repeat($._statement),
      '}',
    ),

    // ─── Statements ──────────────────────────────────────────────────────
    _statement: $ => choice(
      $.let_assert_statement,
      $.let_statement,
      $.assert_statement,
      $.return_statement,
      $.for_statement,
      $.assignment_statement,
      $.expression_statement,
    ),

    // let [mutable] pattern [: type] = expr
    let_statement: $ => seq(
      optional('mutable'),
      'let',
      field('pattern', $._pattern),
      optional(seq(':', field('type', $._type))),
      '=',
      field('value', $._expression),
    ),

    // `let assert` is a dedicated rule so queries and diagnostics can tell
    // it apart from a plain let (ADR — let-assert).
    let_assert_statement: $ => seq(
      'let', 'assert',
      field('pattern', $._pattern),
      '=',
      field('value', $._expression),
    ),

    assert_statement: $ => seq(
      'assert',
      field('condition', $._expression),
    ),

    return_statement: $ => prec.right(seq(
      'return',
      optional(field('value', $._expression)),
    )),

    for_statement: $ => seq(
      'for',
      field('pattern', $._pattern),
      'in',
      field('iterable', $._expression),
      field('body', $.block),
    ),

    // Covers both `x = expr` (mutable binding) and `receiver.field = expr`
    // (extern var field write). The LHS is parsed as any postfix expression
    // and the checker validates that it's an assignable lvalue.
    assignment_statement: $ => prec(1, seq(
      field('target', $._assignment_target),
      '=',
      field('value', $._expression),
    )),

    _assignment_target: $ => choice(
      $.identifier_expression,
      $.field_access_expression,
    ),

    expression_statement: $ => prec(-1, $._expression),

    // ─── Types ───────────────────────────────────────────────────────────
    _type: $ => choice(
      $.named_type,
      $.tuple_type,
      $.function_type,
    ),

    // A named type is either a qualified type (`Messaging.SingleEmailMessage`)
    // or a module-qualified type (`books.Book`). The two differ in the
    // casing of their leading segments.
    named_type: $ => prec.left(choice(
      seq(
        field('name', $.qualified_type),
        optional(field('type_arguments', $.type_arguments)),
      ),
      seq(
        field('module', $.identifier),
        '.',
        field('name', $.qualified_type),
        optional(field('type_arguments', $.type_arguments)),
      ),
    )),

    type_arguments: $ => prec(PREC.generic, seq(
      '<',
      commaSepTrailing1($._type),
      '>',
    )),

    tuple_type: $ => seq(
      '#(',
      commaSepTrailing1($._type),
      ')',
    ),

    function_type: $ => seq(
      'fn',
      '(',
      commaSepTrailing($._type),
      ')',
      ':',
      field('return_type', $._type),
    ),

    // ─── Patterns ────────────────────────────────────────────────────────
    _pattern: $ => choice(
      $.or_pattern,
      $._single_pattern,
    ),

    _single_pattern: $ => choice(
      $.wildcard_pattern,
      $.literal_pattern,
      $.variant_pattern,
      $.tuple_pattern,
      $.list_pattern,
      $.identifier_pattern,
    ),

    wildcard_pattern: _ => '_',

    identifier_pattern: $ => $.identifier,

    literal_pattern: $ => choice(
      $.string_literal,
      $.number_literal,
      $.boolean_literal,
      $.negative_number_literal,
    ),

    negative_number_literal: $ => seq('-', $.number_literal),

    // Pat1 | Pat2 | Pat3  (left-assoc, lowest pattern precedence)
    or_pattern: $ => prec.left(1, seq(
      $._single_pattern,
      repeat1(seq('|', $._single_pattern)),
    )),

    // TypeName or TypeName(args)
    variant_pattern: $ => prec(2, seq(
      field('name', $.qualified_type),
      optional($.variant_pattern_arguments),
    )),

    // Variant pattern arguments accept field-shorthand (`name:`), full
    // destructuring (`name: pat`), positional patterns, and an optional
    // trailing `..` discard (Gleam-style) to ignore remaining fields.
    variant_pattern_arguments: $ => seq(
      '(',
      optional(seq(
        commaSep1($._variant_pattern_argument),
        optional(seq(',', $.variant_discard_rest)),
        optional(','),
      )),
      ')',
    ),

    variant_discard_rest: _ => '..',

    _variant_pattern_argument: $ => choice(
      $.field_pattern,
      $._pattern,
    ),

    // `name: pat` — full destructuring.
    // `name:`     — shorthand; binds the field to a same-name local.
    field_pattern: $ => prec(3, seq(
      field('name', $.identifier),
      ':',
      optional(field('value', $._pattern)),
    )),

    tuple_pattern: $ => seq(
      '#(',
      commaSepTrailing1($._pattern),
      ')',
    ),

    list_pattern: $ => seq(
      '[',
      commaSepTrailing(choice(
        $.list_rest_pattern,
        $._pattern,
      )),
      ']',
    ),

    // `...name` — named rest binding.
    // `..`      — discard rest (Gleam-style trailing).
    list_rest_pattern: $ => choice(
      seq('...', field('binding', $.identifier)),
      '..',
    ),

    // ─── Expressions ─────────────────────────────────────────────────────
    _expression: $ => choice(
      $._expression_ending_with_block,
      $._non_block_expression,
    ),

    _expression_ending_with_block: $ => choice(
      $.if_expression,
      $.match_expression,
      $.block_expression,
    ),

    _non_block_expression: $ => choice(
      $.binary_expression,
      $.unary_expression,
      $.pipe_expression,
      $.try_expression,
      $.debug_expression,
      $.anonymous_function,
      $.closure_expression,
      $.call_expression,
      $.field_access_expression,
      $.index_expression,
      $.record_update_expression,
      $.parenthesized_expression,
      $.tuple_expression,
      $.list_literal,
      $.set_literal,
      $.map_literal,
      $.placeholder_expression,
      $._literal,
      $.type_identifier_expression,
      $.identifier_expression,
    ),

    // `debug expr` — evaluates expr and prints it. Doubles as a statement
    // when used in statement position.
    debug_expression: $ => prec.right(seq(
      'debug',
      field('value', $._expression),
    )),

    _literal: $ => choice(
      $.string_literal,
      $.number_literal,
      $.boolean_literal,
    ),

    // ─── `if` / `if let` ────────────────────────────────────────────────
    if_expression: $ => prec.right(choice(
      seq(
        'if',
        field('condition', $._expression),
        field('consequence', $.block),
        optional(field('alternative', $.else_clause)),
      ),
      seq(
        'if', 'let',
        field('pattern', $._pattern),
        '=',
        field('scrutinee', $._expression),
        field('consequence', $.block),
        optional(field('alternative', $.else_clause)),
      ),
    )),

    else_clause: $ => seq(
      'else',
      choice($.block, $.if_expression),
    ),

    // ─── `match` ────────────────────────────────────────────────────────
    match_expression: $ => seq(
      'match',
      field('subjects', $.match_subjects),
      '{',
      repeat($.match_arm),
      '}',
    ),

    // `match a, b, c { ... }` — Gleam-style multi-subject.
    match_subjects: $ => commaSep1($._expression),

    match_arm: $ => seq(
      field('pattern', $._match_pattern),
      optional(seq('if', field('guard', $._expression))),
      '=>',
      field('body', $._expression),
      optional(','),
    ),

    _match_pattern: $ => choice(
      $.multi_pattern,
      $._pattern,
    ),

    multi_pattern: $ => seq(
      $._pattern,
      repeat1(seq(',', $._pattern)),
    ),

    // ─── Block expression ────────────────────────────────────────────────
    block_expression: $ => $.block,

    // ─── Binary / unary / pipe / try ────────────────────────────────────
    binary_expression: $ => {
      const table = [
        [PREC.or,             '||'],
        [PREC.and,            '&&'],
        [PREC.equality,       choice('==', '!=')],
        [PREC.comparison,     choice('<', '<=', '>', '>=')],
        [PREC.additive,       choice('+', '-')],
        [PREC.multiplicative, choice('*', '/', '%')],
      ];
      return choice(...table.map(([p, op]) =>
        prec.left(p, seq(
          field('left', $._expression),
          field('operator', op),
          field('right', $._expression),
        )),
      ));
    },

    unary_expression: $ => prec(PREC.unary, seq(
      field('operator', choice('!', '-')),
      field('operand', $._expression),
    )),

    pipe_expression: $ => prec.left(PREC.pipe, seq(
      field('value', $._expression),
      '|>',
      field('function', $._expression),
    )),

    try_expression: $ => prec(PREC.try, seq(
      field('value', $._expression),
      '?',
    )),

    // ─── Call / method call / field access / index ─────────────────────
    // One `call_expression` covers `foo()`, `Type(args)`, `obj.m(args)`,
    // and `module.fn(args)`. Optional `<T,...>` type arguments (used for
    // `Apex.Object.as<T>(v)`) disambiguate by token precedence on `<`.
    // The shape of `function` (identifier vs type_identifier vs
    // field_access_expression) is what queries key on to produce
    // per-shape highlighting.
    call_expression: $ => prec(PREC.call, seq(
      field('function', $._expression),
      optional(field('type_arguments', $.type_arguments)),
      field('arguments', $.argument_list),
    )),

    field_access_expression: $ => prec.left(PREC.field, seq(
      field('receiver', $._expression),
      '.',
      field('field', $._symbol_name),
    )),

    index_expression: $ => prec.left(PREC.field, seq(
      field('receiver', $._expression),
      '[',
      field('index', $._expression),
      ']',
    )),

    argument_list: $ => seq(
      '(',
      commaSepTrailing(choice($.named_argument, $.argument)),
      ')',
    ),

    argument: $ => field('value', $._expression),

    named_argument: $ => seq(
      field('label', $._symbol_name),
      ':',
      field('value', $._expression),
    ),

    // ─── Closures / anonymous functions ─────────────────────────────────
    // `fn(params): Ret { body }` — parameter types may be omitted on an
    // anonymous function (the checker infers them). Top-level functions
    // still require types on every parameter.
    anonymous_function: $ => seq(
      'fn',
      field('parameters', $.anonymous_function_parameters),
      optional(seq(':', field('return_type', $._type))),
      field('body', $.block),
    ),

    anonymous_function_parameters: $ => seq(
      '(',
      commaSepTrailing($.anonymous_function_parameter),
      ')',
    ),

    anonymous_function_parameter: $ => seq(
      field('pattern', $._param_pattern),
      optional(seq(':', field('type', $._type))),
      optional(seq('=', field('default', $._expression))),
    ),

    closure_expression: $ => prec(PREC.closure, seq(
      field('parameters', $.closure_parameters),
      field('body', choice($._expression, $.block)),
    )),

    closure_parameters: $ => seq(
      '|',
      commaSepTrailing($.closure_parameter),
      '|',
    ),

    closure_parameter: $ => seq(
      field('name', $.identifier),
      optional(seq(':', field('type', $._type))),
    ),

    // ─── Grouping / tuples / collections ────────────────────────────────
    parenthesized_expression: $ => seq('(', $._expression, ')'),

    tuple_expression: $ => seq(
      '#(',
      commaSepTrailing1($._expression),
      ')',
    ),

    list_literal: $ => seq(
      '[',
      commaSepTrailing(choice($.spread_element, $._expression)),
      ']',
    ),

    spread_element: $ => seq('...', $._expression),

    set_literal: $ => seq(
      '#{',
      commaSepTrailing($._expression),
      '}',
    ),

    // Map literal disambiguated from `block` by content (first element
    // must be `<expr> : <expr>`). GLR handles the ambiguity; see the
    // `conflicts:` entry above.
    map_literal: $ => seq(
      '{',
      commaSep1($.map_entry),
      optional(','),
      '}',
    ),

    map_entry: $ => seq(
      field('key', $._expression),
      ':',
      field('value', $._expression),
    ),

    // Type { base | field: value, ... }
    record_update_expression: $ => prec(PREC.call, seq(
      field('type', $.type_identifier),
      '{',
      field('source', $._expression),
      '|',
      commaSepTrailing1($.record_update_field),
      '}',
    )),

    record_update_field: $ => seq(
      field('name', $.identifier),
      ':',
      field('value', $._expression),
    ),

    // `_` placeholder in pipe arguments: `value |> fn(_, 3)`.
    placeholder_expression: _ => '_',

    // Bare identifier used as an expression (variable reference).
    identifier_expression: $ => $.identifier,

    // Bare type identifier used as an expression (unit variant: `North`,
    // `None`, `Void`). Queries further refine these to @constructor.
    type_identifier_expression: $ => $.type_identifier,

    // ─── Literals ────────────────────────────────────────────────────────
    string_literal: $ => seq(
      '"',
      repeat(choice(
        $.string_content,
        $.string_escape,
        $.string_interpolation,
        $.string_dollar,
      )),
      '"',
    ),

    // Run of plain characters (stops at the meta-characters below).
    string_content: _ => token.immediate(prec(1, /[^"\\$\n]+/)),

    // Recognised escapes (ADR 033): \" \\ \n \r \t \$
    string_escape: _ => token.immediate(/\\["\\nrt$]/),

    // `${...}` opens an interpolation hole.
    string_interpolation: $ => seq(
      '${',
      field('value', $._expression),
      '}',
    ),

    // A bare `$` not followed by `{` is a literal dollar sign (lexer allows
    // `$${amt}` to mean a literal `$` then an interpolation).
    string_dollar: _ => token.immediate('$'),

    number_literal: _ => token(choice(
      /[0-9]+\.[0-9]+d/,                           // Decimal suffix
      /[0-9]+L/,                                   // Long suffix
      /[0-9]+\.[0-9]+([eE][+-]?[0-9]+)?/,          // Double
      /[0-9]+/,                                    // Int
    )),

    boolean_literal: _ => choice('true', 'false'),

    // ─── Identifiers ─────────────────────────────────────────────────────
    identifier: _ => /[a-z_][a-zA-Z0-9_]*/,
    type_identifier: _ => /[A-Z][a-zA-Z0-9_]*/,
  },
});

// ─── Helpers ─────────────────────────────────────────────────────────────
function sepBy1(sep, rule) {
  return seq(rule, repeat(seq(sep, rule)));
}

function commaSep1(rule) {
  return sepBy1(',', rule);
}

function commaSepTrailing1(rule) {
  return seq(commaSep1(rule), optional(','));
}

function commaSepTrailing(rule) {
  return optional(commaSepTrailing1(rule));
}
