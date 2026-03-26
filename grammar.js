/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

/**
 * Full structural grammar for the Vertex programming language.
 *
 * Moving from a tokenizer-level grammar to a structural one unlocks rich
 * tree-sitter highlights:
 *   - function_declaration name → @function
 *   - call_expression callee   → @function.call / @constructor
 *   - method_call_expression   → @function.method
 *   - parameter name           → @variable.parameter
 *   - field_access name        → @property
 *   - type_variant name        → @constructor
 *   - annotation               → @attribute
 */
module.exports = grammar({
  name: 'vertex',

  extras: $ => [$.line_comment, /\s/],
  word: $ => $.identifier,

  // Declare GLR ambiguities that cannot be resolved by precedence alone.
  conflicts: $ => [
    // fn() — could start a function_type (no body) or anonymous_function (with body).
    [$.function_type, $.anonymous_function],
    // Named argument  label: expr  vs  plain expression starting with identifier.
    [$.argument, $._expression],
    // Variant pattern args: field_pattern  name: pattern  vs a bare binding identifier.
    [$.field_pattern, $._expression],
    // method_call and field_access share the expr.identifier prefix.
    [$.method_call_expression, $.field_access],
    // '| |' could be an empty closure body or part of two separate expressions.
    [$.closure_expression, $._expression],
  ],

  rules: {

    source_file: $ => repeat(
      choice(
        $.import_declaration,
        $.function_declaration,
        $.class_declaration,
        $.type_declaration,
        $.annotated_declaration,
        $._statement,
      )
    ),

    // ─── Comments ─────────────────────────────────────────────────────────
    line_comment: _ => /\/\/.*/,

    // ─── Annotations ──────────────────────────────────────────────────────
    // @TypeIdentifier — e.g. @AuraEnabled, @SObject, @TestVisible
    annotation: $ => seq('@', field('name', $.type_identifier)),

    // One or more annotations preceding a top-level declaration.
    annotated_declaration: $ => seq(
      repeat1($.annotation),
      choice(
        $.function_declaration,
        $.class_declaration,
        $.type_declaration,
      ),
    ),

    // ─── Imports ──────────────────────────────────────────────────────────
    import_declaration: $ => seq(
      'import',
      _dotSep1($.identifier),
      optional(seq('as', field('alias', $.identifier))),
    ),

    // ─── Function declarations ────────────────────────────────────────────
    // (pub)? fn name<T>(params): ReturnType { body }
    function_declaration: $ => seq(
      optional('pub'),
      'fn',
      field('name', $.identifier),
      optional($.type_parameters),
      $.parameter_list,
      optional(seq(':', field('return_type', $._type))),
      field('body', $.block),
    ),

    parameter_list: $ => seq('(', _commaSep($.parameter), ')'),

    parameter: $ => seq(
      field('name', $.identifier),
      ':',
      field('type', $._type),
      optional(seq('=', field('default', $._expression))),
    ),

    type_parameters: $ => seq('<', _commaSep1($.type_identifier), '>'),

    // ─── Class declarations ────────────────────────────────────────────────
    // (pub)? class Name<T>(fields) (implements Iface)? { methods }
    // prec.right: when '(' follows 'class Name', prefer consuming it as
    // class_field_list rather than treating the class as already complete.
    class_declaration: $ => prec.right(seq(
      optional('pub'),
      'class',
      field('name', $.type_identifier),
      optional($.type_parameters),
      optional($.class_field_list),
      optional(seq('implements', _commaSep1($.type_identifier))),
      optional(field('body', $.class_body)),
    )),

    class_field_list: $ => seq('(', _commaSep($.class_field), ')'),

    class_field: $ => seq(
      optional('pub'),
      optional('mutable'),
      field('name', $.identifier),
      ':',
      field('type', $._type),
    ),

    // Class body holds only (annotated) method declarations.
    class_body: $ => seq(
      '{',
      repeat(
        choice(
          seq(repeat1($.annotation), $.function_declaration),
          $.function_declaration,
        )
      ),
      '}',
    ),

    // ─── Type declarations ─────────────────────────────────────────────────
    // Sum type:   (pub)? type Name<T> { Variant, ... }
    // Type alias: (pub)? type Name<T> = OtherType
    type_declaration: $ => choice(
      seq(
        optional('pub'),
        'type',
        field('name', $.type_identifier),
        optional($.type_parameters),
        '{',
        _trailingCommaSep($.type_variant),
        '}',
      ),
      seq(
        optional('pub'),
        'type',
        field('name', $.type_identifier),
        optional($.type_parameters),
        '=',
        field('aliased', $._type),
      ),
    ),

    type_variant: $ => choice(
      // Tuple-style:  Circle(radius: Double, ...)
      seq(field('name', $.type_identifier), '(', _commaSep($.variant_field), ')'),
      // Record-style: Rect { width: Double, height: Double }
      seq(field('name', $.type_identifier), '{', _commaSep($.variant_field), '}'),
      // Unit:         North
      field('name', $.type_identifier),
    ),

    variant_field: $ => seq(
      field('name', $.identifier),
      ':',
      field('type', $._type),
    ),

    // ─── Block ────────────────────────────────────────────────────────────
    block: $ => seq('{', repeat($._statement), '}'),

    // ─── Statements ───────────────────────────────────────────────────────
    _statement: $ => choice(
      $.let_binding,
      $.return_statement,
      $.for_statement,
      $.debug_statement,
      $._expression,
    ),

    // (mutable)? let (assert)? pattern (: type)? = value
    let_binding: $ => seq(
      optional('mutable'),
      'let',
      optional('assert'),
      field('pattern', $._pattern),
      optional(seq(':', field('type', $._type))),
      '=',
      field('value', $._expression),
    ),

    // prec.right: prefer consuming 'fn ...' etc. as the return expression
    // rather than treating 'return' as valueless and 'fn' as a new declaration.
    return_statement: $ => prec.right(seq('return', optional($._expression))),

    for_statement: $ => seq(
      'for',
      field('variable', $.identifier),
      'in',
      field('iterable', $._expression),
      field('body', $.block),
    ),

    debug_statement: $ => seq('debug', $._expression),

    // ─── Types ────────────────────────────────────────────────────────────
    _type: $ => choice(
      $.function_type,
      $.generic_type,
      $.tuple_type,
      $.type_identifier,
    ),

    // fn(TypeA, TypeB): ReturnType — function type in signatures
    function_type: $ => seq(
      'fn',
      optional($.type_parameters),
      '(',
      _commaSep($._type),
      ')',
      optional(seq(':', $._type)),
    ),

    // TypeName<T, U>
    generic_type: $ => seq(
      field('name', $.type_identifier),
      '<',
      _commaSep1($._type),
      '>',
    ),

    // #(T, U) — tuple type (prefix # distinguishes from grouped expression)
    tuple_type: $ => seq('#', '(', _commaSep1($._type), ')'),

    // ─── Patterns ─────────────────────────────────────────────────────────
    _pattern: $ => choice(
      $.or_pattern,
      $.variant_pattern,
      $.tuple_pattern,
      $.list_pattern,
      $.identifier,
      $.string_literal,
      $.number_literal,
      $.boolean_literal,
    ),

    // pattern | pattern | ...  (left-associative, lowest pattern precedence)
    or_pattern: $ => prec.left(1, seq($._pattern, '|', $._pattern)),

    // TypeName or TypeName(args...) — variant / constructor pattern
    variant_pattern: $ => prec(2, seq(
      field('name', $.type_identifier),
      optional(seq('(', _commaSep($._variant_arg), ')')),
    )),

    // Each argument in a variant pattern is EITHER:
    //   - a named field:  fieldName: subPattern
    //   - a positional binding / sub-pattern
    _variant_arg: $ => choice($.field_pattern, $._pattern),

    // fieldName: subPattern — named field destructuring
    field_pattern: $ => prec(3, seq(
      field('name', $.identifier),
      ':',
      field('value', $._pattern),
    )),

    // #(a, b) — tuple pattern
    tuple_pattern: $ => seq('#', '(', _commaSep($._pattern), ')'),

    // [first, ..rest] or [a, b, c]
    list_pattern: $ => seq(
      '[',
      _commaSep(
        choice(
          seq('..', field('rest', $.identifier)),
          $._pattern,
        )
      ),
      ']',
    ),

    // ─── Expressions ──────────────────────────────────────────────────────
    _expression: $ => choice(
      $.if_expression,
      $.match_expression,
      $.block,
      $.binary_expression,
      $.unary_expression,
      $.question_expression,
      $.pipe_expression,
      $.call_expression,
      $.method_call_expression,
      $.field_access,
      $.index_expression,
      $.anonymous_function,
      $.closure_expression,
      $.parenthesized_expression,
      $.tuple_expression,
      $.list_literal,
      $.string_literal,
      $.number_literal,
      $.boolean_literal,
      $.type_identifier,
      $.identifier,
    ),

    // if condition { then } else { other }  /  else if ...
    if_expression: $ => seq(
      'if',
      field('condition', $._expression),
      field('consequence', $.block),
      optional(seq(
        'else',
        field('alternative', choice($.block, $.if_expression)),
      )),
    ),

    // match value { pattern (if guard)? => body, ... }
    match_expression: $ => seq(
      'match',
      field('value', $._expression),
      '{',
      repeat($.match_arm),
      '}',
    ),

    match_arm: $ => seq(
      field('pattern', $._pattern),
      optional(seq('if', field('guard', $._expression))),
      '=>',
      field('body', $._expression),
      optional(','),
    ),

    // Binary operators, lowest → highest precedence
    binary_expression: $ => choice(
      prec.left(1, seq(field('left', $._expression), '||',              field('right', $._expression))),
      prec.left(2, seq(field('left', $._expression), '&&',              field('right', $._expression))),
      prec.left(3, seq(field('left', $._expression), choice('==', '!='), field('right', $._expression))),
      prec.left(4, seq(field('left', $._expression), choice('<', '>', '<=', '>='), field('right', $._expression))),
      prec.left(5, seq(field('left', $._expression), choice('+', '-'),  field('right', $._expression))),
      prec.left(6, seq(field('left', $._expression), choice('*', '/', '%'), field('right', $._expression))),
    ),

    // !expr  /  -expr
    unary_expression: $ => prec(7, seq(
      field('operator', choice('!', '-')),
      field('operand', $._expression),
    )),

    // expr? — Result propagation (early return on Error)
    question_expression: $ => prec(10, seq(
      field('value', $._expression),
      '?',
    )),

    // expr |> expr  — pipe (left-associative, very low precedence)
    pipe_expression: $ => prec.left(0, seq(
      field('value', $._expression),
      '|>',
      field('function', $._expression),
    )),

    // name(args) or TypeName(args) — function / constructor call
    // prec 11: tighter than closure (9) so  |x| foo(x)  has foo(x) as the body.
    call_expression: $ => prec(11, seq(
      field('function', choice($.identifier, $.type_identifier)),
      '(',
      optional(field('arguments', $.argument_list)),
      ')',
    )),

    // expr.method(args) — method call (left-associative, high precedence)
    method_call_expression: $ => prec.left(11, seq(
      field('object', $._expression),
      '.',
      field('method', $.identifier),
      '(',
      optional(field('arguments', $.argument_list)),
      ')',
    )),

    // expr.field — field / property access
    field_access: $ => prec.left(11, seq(
      field('object', $._expression),
      '.',
      field('name', $.identifier),
    )),

    // expr[index] — index / subscript
    index_expression: $ => prec.left(11, seq(
      field('object', $._expression),
      '[',
      field('index', $._expression),
      ']',
    )),

    argument_list: $ => _commaSep1($.argument),

    // Named:     label: value
    // Positional: value
    argument: $ => choice(
      seq(field('label', $.identifier), ':', field('value', $._expression)),
      field('value', $._expression),
    ),

    // fn(param: Type): ReturnType { body } — anonymous function expression
    anonymous_function: $ => seq(
      'fn',
      optional($.type_parameters),
      '(',
      _commaSep($.parameter),
      ')',
      optional(seq(':', field('return_type', $._type))),
      field('body', $.block),
    ),

    // |params| expr  or  |params| { block }
    // prec(9): prefer treating '| | block' as a closure over other interpretations.
    closure_expression: $ => prec(9, seq(
      '|',
      _commaSep($.closure_parameter),
      '|',
      field('body', choice($._expression, $.block)),
    )),

    closure_parameter: $ => seq(
      field('name', $.identifier),
      optional(seq(':', field('type', $._type))),
    ),

    // (expr) — grouping only (NOT a tuple; tuples use #(...))
    parenthesized_expression: $ => seq('(', $._expression, ')'),

    // #(a, b, c) — tuple literal
    tuple_expression: $ => seq('#', '(', _commaSep1($._expression), ')'),

    // [a, b, c]
    list_literal: $ => seq('[', _commaSep($._expression), ']'),

    // ─── Literals ─────────────────────────────────────────────────────────
    string_literal: _ => token(seq(
      '"',
      repeat(choice(
        /[^"\\$\n]+/,
        /\\["\\\nrt$]/,
        seq('${', /[^}]*/, '}'),
        /\$/,
      )),
      '"',
    )),

    number_literal: _ => token(choice(
      /[0-9]+\.[0-9]+d/,
      /[0-9]+L/,
      /[0-9]+\.[0-9]+([eE][+-]?[0-9]+)?/,
      /[0-9]+/,
    )),

    boolean_literal: _ => choice('true', 'false'),

    // ─── Identifiers ──────────────────────────────────────────────────────
    type_identifier: _ => /[A-Z][a-zA-Z0-9_]*/,
    identifier: _ => /[a-z_][a-zA-Z0-9_]*/,
  },
});

// ─── Grammar helpers ──────────────────────────────────────────────────────────

function _sep1(rule, sep) {
  return seq(rule, repeat(seq(sep, rule)));
}

function _dotSep1(rule) {
  return _sep1(rule, '.');
}

function _commaSep(rule) {
  return optional(_commaSep1(rule));
}

function _commaSep1(rule) {
  return _sep1(rule, ',');
}

function _trailingCommaSep(rule) {
  return seq(_commaSep1(rule), optional(','));
}
