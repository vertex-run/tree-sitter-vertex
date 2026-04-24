; =============================================================================
; tree-sitter-vertex — locals.scm
;
; Scope / definition / reference tracking so tools like Neovim can
; differentiate local variables from module-qualified identifiers.
; =============================================================================

; ─── Scopes ─────────────────────────────────────────────────────────────────
[
  (source_file)
  (block)
  (function_declaration)
  (anonymous_function)
  (closure_expression)
  (match_arm)
  (for_statement)
  (if_expression)
] @local.scope

; ─── Definitions ────────────────────────────────────────────────────────────
(function_declaration name: (identifier) @local.definition.function)

(parameter                    pattern: (identifier_pattern (identifier) @local.definition.parameter))
(anonymous_function_parameter pattern: (identifier_pattern (identifier) @local.definition.parameter))
(closure_parameter            name: (identifier) @local.definition.parameter)

(let_statement pattern: (identifier_pattern (identifier) @local.definition.var))
(let_assert_statement pattern: (identifier_pattern (identifier) @local.definition.var))
(for_statement pattern: (identifier_pattern (identifier) @local.definition.var))

(import_declaration path: (import_path (identifier) @local.definition.import))
(import_declaration alias: (identifier) @local.definition.import)
(import_selection (identifier) @local.definition.import)

(const_declaration name: (identifier) @local.definition.constant)

; ─── References ─────────────────────────────────────────────────────────────
(identifier_expression (identifier) @local.reference)
