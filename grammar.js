/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

/**
 * Tree-sitter grammar for the Vertex programming language.
 *
 * Strategy: tokenizer-level grammar with text predicates.
 * Keywords are captured as identifier nodes and reclassified in highlights.scm
 * via #any-of? predicates, rather than as distinct grammar rules.
 *
 * Operators, punctuation, and annotations have dedicated named token rules so
 * that highlights.scm can style them without text predicates.
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
      $.annotation,
      $.operator,
      $.punctuation,
      $.type_identifier,
      $.identifier,
      // Catch-all: any remaining character not matched above.
      /[^\s]/,
    ),

    // ─── Comments ────────────────────────────────────────────────────────────
    // Vertex only has line comments — no block comments.
    line_comment: _ => /\/\/.*/,

    // ─── Strings ─────────────────────────────────────────────────────────────
    // Kept as a single terminal token to avoid extras-inside-string issues.
    // String interpolation (${ ... }) is collapsed into the token; it is not
    // yet highlighted as embedded code.
    string_literal: _ => token(seq(
      '"',
      repeat(choice(
        /[^"\\$\n]+/,            // ordinary characters
        /\\["\\\nrt$]/,          // escape sequences
        seq('${', /[^}]*/, '}'), // string interpolation (simplified)
        /\$/,                    // bare $ not followed by {
      )),
      '"',
    )),

    // ─── Numbers ─────────────────────────────────────────────────────────────
    // Order matters for maximal-munch: Decimal (Nd) before Double, Long (NL)
    // before Int.
    number_literal: _ => token(choice(
      /[0-9]+\.[0-9]+d/,                      // Decimal  e.g. 9.99d
      /[0-9]+L/,                              // Long     e.g. 100L
      /[0-9]+\.[0-9]+([eE][+-]?[0-9]+)?/,     // Double   e.g. 3.14
      /[0-9]+/,                               // Int      e.g. 42
    )),

    // ─── Booleans ────────────────────────────────────────────────────────────
    boolean_literal: _ => choice('true', 'false'),

    // ─── Annotations ─────────────────────────────────────────────────────────
    // @TypeIdentifier — e.g. @AuraEnabled, @SObject, @TestVisible, @Future
    annotation: $ => seq('@', $.type_identifier),

    // ─── Operators ───────────────────────────────────────────────────────────
    // Multi-character operators are listed first so that maximal-munch picks
    // them over any prefix single-character alternative.
    operator: _ => token(choice(
      '|>',             // pipe
      '->',             // function return-type arrow / lambda arrow
      '=>',             // match arm fat arrow
      '==', '!=',       // equality
      '<=', '>=',       // ordered comparison
      '&&', '||',       // logical and / or
      '..',             // range / rest pattern
      '+', '-', '*', '/', '%', // arithmetic
      '!',              // logical not / unary negation
      '<', '>',         // comparison / generic angle brackets
      '=',              // assignment / binding
      '|',              // OR-pattern separator in match arms
    )),

    // ─── Punctuation ─────────────────────────────────────────────────────────
    // Structural characters: brackets, delimiters, and separators.
    // Note: '|' is in operator above so that it and '|>' can be styled uniformly.
    punctuation: _ => /[(){}\[\],:;.]/,

    // ─── Identifiers ─────────────────────────────────────────────────────────
    // type_identifier: starts with an uppercase letter (types, variants, etc.)
    // identifier:      starts with a lowercase letter or underscore
    type_identifier: _ => /[A-Z][a-zA-Z0-9_]*/,
    identifier: _ => /[a-z_][a-zA-Z0-9_]*/,
  },
});
