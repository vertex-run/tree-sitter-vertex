; =============================================================================
; tree-sitter-vertex — tags.scm
;
; Ctags-style tag definitions for code navigation tools (ctag generators,
; GitHub code search, etc.). Definitions are captured with @definition.*
; and references with @reference.*.
; =============================================================================

(function_declaration
  name: (identifier) @name) @definition.function

(type_declaration
  name: (type_identifier) @name) @definition.type

(type_alias_declaration
  name: (type_identifier) @name) @definition.type

(variant
  name: (type_identifier) @name) @definition.constant

(const_declaration
  name: (identifier) @name) @definition.constant

(extern_type_declaration
  name: (qualified_type) @name) @definition.type

(extern_fn_declaration
  name: (extern_fn_name) @name) @definition.function

(extern_new_declaration
  name: (qualified_type) @name) @definition.function

(extern_method_declaration
  method_name: (identifier) @name) @definition.method

(extern_field_declaration
  field_name: (identifier) @name) @definition.field

(extern_var_declaration
  field_name: (identifier) @name) @definition.field

(extern_enum_declaration
  name: (qualified_type) @name) @definition.type

(extern_enum_variant
  name: (type_identifier) @name) @definition.constant

(call_expression
  function: (identifier_expression (identifier) @name)) @reference.call

(call_expression
  function: (field_access_expression field: (identifier) @name)) @reference.call
