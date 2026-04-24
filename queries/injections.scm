; =============================================================================
; tree-sitter-vertex — injections.scm
;
; Inject other grammars into Vertex source:
;  - `comment` language inside line comments (highlights TODO/FIXME/SAFETY).
; =============================================================================

((line_comment) @injection.content
  (#set! injection.language "comment"))
