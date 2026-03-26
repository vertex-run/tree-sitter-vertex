/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

/**
 * Minimal Vertex grammar for tree-sitter.
 *
 * This is intentionally a tokenizer-level grammar — it identifies the basic
 * lexical units (keywords, types, strings, numbers, comments) without trying
 * to model the full parse structure. The highlights.scm uses text-predicates
 * (#any-of?) to classify identifiers as keywords, built-in types, etc.
 *
 * Expand this grammar incrementally as richer highlighting or outline support
 * is needed (e.g. distinct function_declaration nodes for the outline panel).
 */
module.exports = grammar({
  name: 'vertex',

  extras: $ => [
    $.line_comment,
    /\s/,
  ],

  word: $ => $.identifier,

  rules: {
    source_file: $ => repeat($._token),

    _token: $ => choice(
      $.string_literal,
      $.number_literal,
      $.boolean_literal,
      $.type_identifier,
      $.identifier,
      // Catch-all: operators, brackets, punctuation, etc.
      /[^\s]/,
    ),

    // ─── Comments ────────────────────────────────────────────────────────────
    // Only line comments — Vertex has no block comments.
    line_comment: _ => /\/\/.*/,

    // ─── Strings ─────────────────────────────────────────────────────────────
    // Collapsed into a single token. Interpolations (${...}) are captured as
    // part of the token; they are not yet highlighted as embedded code.
    string_literal: _ => token(seq(
      '"',
      repeat(choice(
        /[^"\\$\n]+/,         // ordinary characters
        /\\["\\\nrt$]/,       // escape sequences
        seq('${', /[^}]*/, '}'), // string interpolation (simplified)
        /\$/,                 // bare $ not followed by {
      )),
      '"',
    )),

    // ─── Numbers ─────────────────────────────────────────────────────────────
    // Order matters for maximal munch: decimal (Nd) before double, long (NL)
    // before int.
    number_literal: _ => token(choice(
      /[0-9]+\.[0-9]+d/,                        // Decimal literal  e.g. 9.99d
      /[0-9]+L/,                                // Long literal     e.g. 100L
      /[0-9]+\.[0-9]+([eE][+-]?[0-9]+)?/,       // Double literal   e.g. 3.14
      /[0-9]+/,                                 // Int literal      e.g. 42
    )),

    // ─── Booleans ────────────────────────────────────────────────────────────
    boolean_literal: _ => choice('true', 'false'),

    // ─── Identifiers ─────────────────────────────────────────────────────────
    // type_identifier: starts with an uppercase letter (types, variants, etc.)
    // identifier:      starts with a lowercase letter or underscore
    type_identifier: _ => /[A-Z][a-zA-Z0-9_]*/,
    identifier: _ => /[a-z_][a-zA-Z0-9_]*/,
  },
});
