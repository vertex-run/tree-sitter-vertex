; =============================================================================
; tree-sitter-vertex — highlights.scm (nvim-treesitter capture names)
;
; These queries use the community/nvim-treesitter capture-name vocabulary
; (`@keyword.function`, `@keyword.conditional`, `@variable.builtin`, etc.).
; Zed's editor-facing queries live in zed-vertex/languages/vertex/ and use
; Zed's own slightly different tag set.
; =============================================================================

; ─── Comments ───────────────────────────────────────────────────────────────
(line_comment) @comment @spell

; ─── Literals ───────────────────────────────────────────────────────────────
(boolean_literal) @boolean
(number_literal)  @number

(string_literal)  @string
(string_escape)   @string.escape
(string_dollar)   @string.escape
(string_interpolation "${" @punctuation.special)
(string_interpolation "}"  @punctuation.special)

; ─── Annotations ────────────────────────────────────────────────────────────
(annotation "@" @attribute)
(annotation name: (type_identifier) @attribute)
(bare_module_annotation (annotation "@" @attribute))
(bare_module_annotation (annotation name: (type_identifier) @attribute))

; ─── Keywords ───────────────────────────────────────────────────────────────
[
  "fn"
] @keyword.function

[
  "let"
  "mutable"
  "const"
] @keyword

[
  "pub"
  "global"
  "opaque"
] @keyword.modifier

[
  "type"
  "extern"
  "new"
  "method"
  "field"
  "var"
  "enum"
] @keyword.type

[
  "if"
  "else"
  "match"
] @keyword.conditional

[
  "for"
  "in"
  "return"
] @keyword.repeat

"debug" @keyword.debug

"assert" @keyword.exception

[
  "import"
  "as"
] @keyword.import

; ─── Operators ──────────────────────────────────────────────────────────────
[
  "|>"
  "=>"
  "=="  "!="
  "<="  ">="
  "&&"  "||"
  "..."  ".."
  "+"  "-"  "*"  "/"  "%"
  "!"
  "<"  ">"
  "="
  "|"
  "?"
] @operator

; ─── Punctuation ────────────────────────────────────────────────────────────
["(" ")" "{" "}" "[" "]"] @punctuation.bracket
(type_parameters "<" @punctuation.bracket ">" @punctuation.bracket)
(type_arguments  "<" @punctuation.bracket ">" @punctuation.bracket)
["," ":" "."] @punctuation.delimiter
["#(" "#{"] @punctuation.special

; ─── Built-ins ──────────────────────────────────────────────────────────────
((type_identifier) @type.builtin
  (#any-of? @type.builtin
    "Bool" "Date" "DateFormat" "Datetime" "Decimal" "Double"
    "Id" "Int" "Long" "String" "Void"
    "List" "Map" "Set"
    "Option" "Result"
    "AuraError" "DmlError"
    "ApexException" "Database"))

((type_identifier) @constructor.builtin
  (#any-of? @constructor.builtin "Some" "None" "Ok" "Error" "Void"))

; ─── Declarations ───────────────────────────────────────────────────────────
(type_declaration       name: (type_identifier) @type.definition)
(type_alias_declaration name: (type_identifier) @type.definition)

(variant               name: (type_identifier) @constructor)
(extern_enum_variant   name: (type_identifier) @constructor)

(type_identifier) @type

(function_declaration name: (identifier) @function)

(extern_fn_declaration     (extern_fn_name (identifier) @function))
(extern_method_declaration method_name: (identifier) @function.method)
(extern_new_declaration    constructor_name: (identifier) @function)

(extern_field_declaration field_name: (identifier) @property)
(extern_var_declaration   field_name: (identifier) @property)

(const_declaration name: (identifier) @constant)

; ─── Call sites ─────────────────────────────────────────────────────────────
(call_expression
  function: (identifier_expression (identifier) @function.call))

(call_expression
  function: (type_identifier_expression (type_identifier) @constructor))

(call_expression
  function: (field_access_expression
    field: (identifier) @function.method.call))

(call_expression
  function: (field_access_expression
    field: (type_identifier) @function.method.call))

; Pipe right-hand side: `x |> foo` — `foo` is called.
(pipe_expression
  function: (identifier_expression (identifier) @function.call))

; ─── Parameters ─────────────────────────────────────────────────────────────
(parameter                    pattern: (identifier_pattern (identifier) @variable.parameter))
(anonymous_function_parameter pattern: (identifier_pattern (identifier) @variable.parameter))
(closure_parameter            name: (identifier) @variable.parameter)

(named_argument label: (identifier) @variable.parameter)
(named_argument label: (type_identifier) @variable.parameter)

; ─── Fields / properties ────────────────────────────────────────────────────
(field_access_expression field: (identifier) @variable.member)
(field_access_expression field: (type_identifier) @variable.member)

(field_pattern name: (identifier) @variable.member)
(record_update_field name: (identifier) @variable.member)
(variant_field name: (identifier) @variable.member)
(variant_field name: (type_identifier) @variable.member)

(map_entry key: (string_literal) @string)

; ─── Bindings ───────────────────────────────────────────────────────────────
(let_statement pattern: (identifier_pattern (identifier) @variable))
(let_assert_statement pattern: (identifier_pattern (identifier) @variable))
(for_statement pattern: (identifier_pattern (identifier) @variable))
(assignment_statement target: (identifier_expression (identifier) @variable))

; ─── Module qualifiers ──────────────────────────────────────────────────────
(named_type module: (identifier) @module)
(import_declaration path: (import_path (identifier) @module))
(import_declaration alias: (identifier) @module)
(import_selection (identifier) @variable)

; ─── Special identifiers ────────────────────────────────────────────────────
(wildcard_pattern) @variable.builtin
(placeholder_expression) @variable.builtin

; ─── Fallback ───────────────────────────────────────────────────────────────
(identifier) @variable
