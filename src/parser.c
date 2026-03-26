#include "tree_sitter/parser.h"

#if defined(__GNUC__) || defined(__clang__)
#pragma GCC diagnostic ignored "-Wmissing-field-initializers"
#endif

#define LANGUAGE_VERSION 14
#define STATE_COUNT 8
#define LARGE_STATE_COUNT 6
#define SYMBOL_COUNT 17
#define ALIAS_COUNT 0
#define TOKEN_COUNT 12
#define EXTERNAL_TOKEN_COUNT 0
#define FIELD_COUNT 0
#define MAX_ALIAS_SEQUENCE_LENGTH 2
#define PRODUCTION_ID_COUNT 1

enum ts_symbol_identifiers {
  sym_identifier = 1,
  aux_sym__token_token1 = 2,
  sym_line_comment = 3,
  sym_string_literal = 4,
  sym_number_literal = 5,
  anon_sym_true = 6,
  anon_sym_false = 7,
  anon_sym_AT = 8,
  sym_operator = 9,
  sym_punctuation = 10,
  sym_type_identifier = 11,
  sym_source_file = 12,
  sym__token = 13,
  sym_boolean_literal = 14,
  sym_annotation = 15,
  aux_sym_source_file_repeat1 = 16,
};

static const char * const ts_symbol_names[] = {
  [ts_builtin_sym_end] = "end",
  [sym_identifier] = "identifier",
  [aux_sym__token_token1] = "_token_token1",
  [sym_line_comment] = "line_comment",
  [sym_string_literal] = "string_literal",
  [sym_number_literal] = "number_literal",
  [anon_sym_true] = "true",
  [anon_sym_false] = "false",
  [anon_sym_AT] = "@",
  [sym_operator] = "operator",
  [sym_punctuation] = "punctuation",
  [sym_type_identifier] = "type_identifier",
  [sym_source_file] = "source_file",
  [sym__token] = "_token",
  [sym_boolean_literal] = "boolean_literal",
  [sym_annotation] = "annotation",
  [aux_sym_source_file_repeat1] = "source_file_repeat1",
};

static const TSSymbol ts_symbol_map[] = {
  [ts_builtin_sym_end] = ts_builtin_sym_end,
  [sym_identifier] = sym_identifier,
  [aux_sym__token_token1] = aux_sym__token_token1,
  [sym_line_comment] = sym_line_comment,
  [sym_string_literal] = sym_string_literal,
  [sym_number_literal] = sym_number_literal,
  [anon_sym_true] = anon_sym_true,
  [anon_sym_false] = anon_sym_false,
  [anon_sym_AT] = anon_sym_AT,
  [sym_operator] = sym_operator,
  [sym_punctuation] = sym_punctuation,
  [sym_type_identifier] = sym_type_identifier,
  [sym_source_file] = sym_source_file,
  [sym__token] = sym__token,
  [sym_boolean_literal] = sym_boolean_literal,
  [sym_annotation] = sym_annotation,
  [aux_sym_source_file_repeat1] = aux_sym_source_file_repeat1,
};

static const TSSymbolMetadata ts_symbol_metadata[] = {
  [ts_builtin_sym_end] = {
    .visible = false,
    .named = true,
  },
  [sym_identifier] = {
    .visible = true,
    .named = true,
  },
  [aux_sym__token_token1] = {
    .visible = false,
    .named = false,
  },
  [sym_line_comment] = {
    .visible = true,
    .named = true,
  },
  [sym_string_literal] = {
    .visible = true,
    .named = true,
  },
  [sym_number_literal] = {
    .visible = true,
    .named = true,
  },
  [anon_sym_true] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_false] = {
    .visible = true,
    .named = false,
  },
  [anon_sym_AT] = {
    .visible = true,
    .named = false,
  },
  [sym_operator] = {
    .visible = true,
    .named = true,
  },
  [sym_punctuation] = {
    .visible = true,
    .named = true,
  },
  [sym_type_identifier] = {
    .visible = true,
    .named = true,
  },
  [sym_source_file] = {
    .visible = true,
    .named = true,
  },
  [sym__token] = {
    .visible = false,
    .named = true,
  },
  [sym_boolean_literal] = {
    .visible = true,
    .named = true,
  },
  [sym_annotation] = {
    .visible = true,
    .named = true,
  },
  [aux_sym_source_file_repeat1] = {
    .visible = false,
    .named = false,
  },
};

static const TSSymbol ts_alias_sequences[PRODUCTION_ID_COUNT][MAX_ALIAS_SEQUENCE_LENGTH] = {
  [0] = {0},
};

static const uint16_t ts_non_terminal_alias_map[] = {
  0,
};

static const TSStateId ts_primary_state_ids[STATE_COUNT] = {
  [0] = 0,
  [1] = 1,
  [2] = 2,
  [3] = 3,
  [4] = 4,
  [5] = 5,
  [6] = 6,
  [7] = 7,
};

static bool ts_lex(TSLexer *lexer, TSStateId state) {
  START_LEXER();
  eof = lexer->eof(lexer);
  switch (state) {
    case 0:
      if (eof) ADVANCE(13);
      ADVANCE_MAP(
        '!', 20,
        '"', 15,
        '&', 16,
        '-', 21,
        '.', 17,
        '/', 19,
        '<', 20,
        '=', 23,
        '>', 20,
        '@', 33,
        '|', 22,
        '%', 14,
        '*', 14,
        '+', 14,
      );
      if (('\t' <= lookahead && lookahead <= '\r') ||
          lookahead == ' ') SKIP(0);
      if (('(' <= lookahead && lookahead <= ',') ||
          lookahead == ':' ||
          lookahead == ';' ||
          lookahead == '[' ||
          lookahead == ']' ||
          ('{' <= lookahead && lookahead <= '}')) ADVANCE(14);
      if (('0' <= lookahead && lookahead <= '9')) ADVANCE(18);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(24);
      if (lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(25);
      if (lookahead != 0) ADVANCE(14);
      END_STATE();
    case 1:
      if (lookahead == '\n') ADVANCE(8);
      if (lookahead == '"') ADVANCE(28);
      if (lookahead == '$') ADVANCE(1);
      if (lookahead == '\\') ADVANCE(7);
      if (lookahead == '{') ADVANCE(2);
      if (lookahead == '}') ADVANCE(4);
      if (lookahead != 0) ADVANCE(2);
      END_STATE();
    case 2:
      if (lookahead == '\n') ADVANCE(8);
      if (lookahead == '"') ADVANCE(28);
      if (lookahead == '$') ADVANCE(1);
      if (lookahead == '\\') ADVANCE(7);
      if (lookahead == '}') ADVANCE(4);
      if (lookahead != 0) ADVANCE(2);
      END_STATE();
    case 3:
      if (lookahead == '"') ADVANCE(27);
      if (lookahead == '$') ADVANCE(3);
      if (lookahead == '\\') ADVANCE(10);
      if (lookahead == '{') ADVANCE(2);
      if (lookahead != 0 &&
          lookahead != '\n') ADVANCE(4);
      END_STATE();
    case 4:
      if (lookahead == '"') ADVANCE(27);
      if (lookahead == '$') ADVANCE(3);
      if (lookahead == '\\') ADVANCE(10);
      if (lookahead != 0 &&
          lookahead != '\n') ADVANCE(4);
      END_STATE();
    case 5:
      if (lookahead == '/') ADVANCE(26);
      END_STATE();
    case 6:
      if (lookahead == '/') ADVANCE(5);
      if (('\t' <= lookahead && lookahead <= '\r') ||
          lookahead == ' ') SKIP(6);
      if (('A' <= lookahead && lookahead <= 'Z')) ADVANCE(35);
      END_STATE();
    case 7:
      if (lookahead == '}') ADVANCE(4);
      if (lookahead == '\n' ||
          lookahead == '"' ||
          lookahead == '$' ||
          lookahead == '\\' ||
          lookahead == 'r' ||
          lookahead == 't') ADVANCE(2);
      if (lookahead != 0) ADVANCE(8);
      END_STATE();
    case 8:
      if (lookahead == '}') ADVANCE(4);
      if (lookahead != 0) ADVANCE(8);
      END_STATE();
    case 9:
      if (lookahead == '+' ||
          lookahead == '-') ADVANCE(12);
      if (('0' <= lookahead && lookahead <= '9')) ADVANCE(32);
      END_STATE();
    case 10:
      if (lookahead == '\n' ||
          lookahead == '"' ||
          lookahead == '$' ||
          lookahead == '\\' ||
          lookahead == 'r' ||
          lookahead == 't') ADVANCE(4);
      END_STATE();
    case 11:
      if (('0' <= lookahead && lookahead <= '9')) ADVANCE(31);
      END_STATE();
    case 12:
      if (('0' <= lookahead && lookahead <= '9')) ADVANCE(32);
      END_STATE();
    case 13:
      ACCEPT_TOKEN(ts_builtin_sym_end);
      END_STATE();
    case 14:
      ACCEPT_TOKEN(aux_sym__token_token1);
      END_STATE();
    case 15:
      ACCEPT_TOKEN(aux_sym__token_token1);
      if (lookahead == '"') ADVANCE(27);
      if (lookahead == '$') ADVANCE(3);
      if (lookahead == '\\') ADVANCE(10);
      if (lookahead != 0 &&
          lookahead != '\n') ADVANCE(4);
      END_STATE();
    case 16:
      ACCEPT_TOKEN(aux_sym__token_token1);
      if (lookahead == '&') ADVANCE(34);
      END_STATE();
    case 17:
      ACCEPT_TOKEN(aux_sym__token_token1);
      if (lookahead == '.') ADVANCE(34);
      END_STATE();
    case 18:
      ACCEPT_TOKEN(aux_sym__token_token1);
      if (lookahead == '.') ADVANCE(11);
      if (lookahead == 'L') ADVANCE(29);
      if (('0' <= lookahead && lookahead <= '9')) ADVANCE(30);
      END_STATE();
    case 19:
      ACCEPT_TOKEN(aux_sym__token_token1);
      if (lookahead == '/') ADVANCE(26);
      END_STATE();
    case 20:
      ACCEPT_TOKEN(aux_sym__token_token1);
      if (lookahead == '=') ADVANCE(34);
      END_STATE();
    case 21:
      ACCEPT_TOKEN(aux_sym__token_token1);
      if (lookahead == '>') ADVANCE(34);
      END_STATE();
    case 22:
      ACCEPT_TOKEN(aux_sym__token_token1);
      if (lookahead == '>' ||
          lookahead == '|') ADVANCE(34);
      END_STATE();
    case 23:
      ACCEPT_TOKEN(aux_sym__token_token1);
      if (lookahead == '=' ||
          lookahead == '>') ADVANCE(34);
      END_STATE();
    case 24:
      ACCEPT_TOKEN(aux_sym__token_token1);
      if (('0' <= lookahead && lookahead <= '9') ||
          ('A' <= lookahead && lookahead <= 'Z') ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(35);
      END_STATE();
    case 25:
      ACCEPT_TOKEN(aux_sym__token_token1);
      if (('0' <= lookahead && lookahead <= '9') ||
          ('A' <= lookahead && lookahead <= 'Z') ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(36);
      END_STATE();
    case 26:
      ACCEPT_TOKEN(sym_line_comment);
      if (lookahead != 0 &&
          lookahead != '\n') ADVANCE(26);
      END_STATE();
    case 27:
      ACCEPT_TOKEN(sym_string_literal);
      END_STATE();
    case 28:
      ACCEPT_TOKEN(sym_string_literal);
      if (lookahead == '}') ADVANCE(4);
      if (lookahead != 0) ADVANCE(8);
      END_STATE();
    case 29:
      ACCEPT_TOKEN(sym_number_literal);
      END_STATE();
    case 30:
      ACCEPT_TOKEN(sym_number_literal);
      if (lookahead == '.') ADVANCE(11);
      if (lookahead == 'L') ADVANCE(29);
      if (('0' <= lookahead && lookahead <= '9')) ADVANCE(30);
      END_STATE();
    case 31:
      ACCEPT_TOKEN(sym_number_literal);
      if (lookahead == 'd') ADVANCE(29);
      if (lookahead == 'E' ||
          lookahead == 'e') ADVANCE(9);
      if (('0' <= lookahead && lookahead <= '9')) ADVANCE(31);
      END_STATE();
    case 32:
      ACCEPT_TOKEN(sym_number_literal);
      if (('0' <= lookahead && lookahead <= '9')) ADVANCE(32);
      END_STATE();
    case 33:
      ACCEPT_TOKEN(anon_sym_AT);
      END_STATE();
    case 34:
      ACCEPT_TOKEN(sym_operator);
      END_STATE();
    case 35:
      ACCEPT_TOKEN(sym_type_identifier);
      if (('0' <= lookahead && lookahead <= '9') ||
          ('A' <= lookahead && lookahead <= 'Z') ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(35);
      END_STATE();
    case 36:
      ACCEPT_TOKEN(sym_identifier);
      if (('0' <= lookahead && lookahead <= '9') ||
          ('A' <= lookahead && lookahead <= 'Z') ||
          lookahead == '_' ||
          ('a' <= lookahead && lookahead <= 'z')) ADVANCE(36);
      END_STATE();
    default:
      return false;
  }
}

static bool ts_lex_keywords(TSLexer *lexer, TSStateId state) {
  START_LEXER();
  eof = lexer->eof(lexer);
  switch (state) {
    case 0:
      if (lookahead == 'f') ADVANCE(1);
      if (lookahead == 't') ADVANCE(2);
      if (('\t' <= lookahead && lookahead <= '\r') ||
          lookahead == ' ') SKIP(0);
      END_STATE();
    case 1:
      if (lookahead == 'a') ADVANCE(3);
      END_STATE();
    case 2:
      if (lookahead == 'r') ADVANCE(4);
      END_STATE();
    case 3:
      if (lookahead == 'l') ADVANCE(5);
      END_STATE();
    case 4:
      if (lookahead == 'u') ADVANCE(6);
      END_STATE();
    case 5:
      if (lookahead == 's') ADVANCE(7);
      END_STATE();
    case 6:
      if (lookahead == 'e') ADVANCE(8);
      END_STATE();
    case 7:
      if (lookahead == 'e') ADVANCE(9);
      END_STATE();
    case 8:
      ACCEPT_TOKEN(anon_sym_true);
      END_STATE();
    case 9:
      ACCEPT_TOKEN(anon_sym_false);
      END_STATE();
    default:
      return false;
  }
}

static const TSLexMode ts_lex_modes[STATE_COUNT] = {
  [0] = {.lex_state = 0},
  [1] = {.lex_state = 0},
  [2] = {.lex_state = 0},
  [3] = {.lex_state = 0},
  [4] = {.lex_state = 0},
  [5] = {.lex_state = 0},
  [6] = {.lex_state = 6},
  [7] = {.lex_state = 0},
};

static const uint16_t ts_parse_table[LARGE_STATE_COUNT][SYMBOL_COUNT] = {
  [0] = {
    [ts_builtin_sym_end] = ACTIONS(1),
    [sym_identifier] = ACTIONS(1),
    [aux_sym__token_token1] = ACTIONS(1),
    [sym_line_comment] = ACTIONS(3),
    [sym_string_literal] = ACTIONS(1),
    [sym_number_literal] = ACTIONS(1),
    [anon_sym_true] = ACTIONS(1),
    [anon_sym_false] = ACTIONS(1),
    [anon_sym_AT] = ACTIONS(1),
    [sym_operator] = ACTIONS(1),
    [sym_punctuation] = ACTIONS(1),
    [sym_type_identifier] = ACTIONS(1),
  },
  [1] = {
    [sym_source_file] = STATE(7),
    [sym__token] = STATE(2),
    [sym_boolean_literal] = STATE(2),
    [sym_annotation] = STATE(2),
    [aux_sym_source_file_repeat1] = STATE(2),
    [ts_builtin_sym_end] = ACTIONS(5),
    [sym_identifier] = ACTIONS(7),
    [aux_sym__token_token1] = ACTIONS(7),
    [sym_line_comment] = ACTIONS(3),
    [sym_string_literal] = ACTIONS(9),
    [sym_number_literal] = ACTIONS(7),
    [anon_sym_true] = ACTIONS(11),
    [anon_sym_false] = ACTIONS(11),
    [anon_sym_AT] = ACTIONS(13),
    [sym_operator] = ACTIONS(7),
    [sym_punctuation] = ACTIONS(7),
    [sym_type_identifier] = ACTIONS(7),
  },
  [2] = {
    [sym__token] = STATE(3),
    [sym_boolean_literal] = STATE(3),
    [sym_annotation] = STATE(3),
    [aux_sym_source_file_repeat1] = STATE(3),
    [ts_builtin_sym_end] = ACTIONS(15),
    [sym_identifier] = ACTIONS(17),
    [aux_sym__token_token1] = ACTIONS(17),
    [sym_line_comment] = ACTIONS(3),
    [sym_string_literal] = ACTIONS(19),
    [sym_number_literal] = ACTIONS(17),
    [anon_sym_true] = ACTIONS(11),
    [anon_sym_false] = ACTIONS(11),
    [anon_sym_AT] = ACTIONS(13),
    [sym_operator] = ACTIONS(17),
    [sym_punctuation] = ACTIONS(17),
    [sym_type_identifier] = ACTIONS(17),
  },
  [3] = {
    [sym__token] = STATE(3),
    [sym_boolean_literal] = STATE(3),
    [sym_annotation] = STATE(3),
    [aux_sym_source_file_repeat1] = STATE(3),
    [ts_builtin_sym_end] = ACTIONS(21),
    [sym_identifier] = ACTIONS(23),
    [aux_sym__token_token1] = ACTIONS(23),
    [sym_line_comment] = ACTIONS(3),
    [sym_string_literal] = ACTIONS(26),
    [sym_number_literal] = ACTIONS(23),
    [anon_sym_true] = ACTIONS(29),
    [anon_sym_false] = ACTIONS(29),
    [anon_sym_AT] = ACTIONS(32),
    [sym_operator] = ACTIONS(23),
    [sym_punctuation] = ACTIONS(23),
    [sym_type_identifier] = ACTIONS(23),
  },
  [4] = {
    [ts_builtin_sym_end] = ACTIONS(35),
    [sym_identifier] = ACTIONS(37),
    [aux_sym__token_token1] = ACTIONS(37),
    [sym_line_comment] = ACTIONS(3),
    [sym_string_literal] = ACTIONS(35),
    [sym_number_literal] = ACTIONS(37),
    [anon_sym_true] = ACTIONS(37),
    [anon_sym_false] = ACTIONS(37),
    [anon_sym_AT] = ACTIONS(35),
    [sym_operator] = ACTIONS(37),
    [sym_punctuation] = ACTIONS(37),
    [sym_type_identifier] = ACTIONS(37),
  },
  [5] = {
    [ts_builtin_sym_end] = ACTIONS(39),
    [sym_identifier] = ACTIONS(41),
    [aux_sym__token_token1] = ACTIONS(41),
    [sym_line_comment] = ACTIONS(3),
    [sym_string_literal] = ACTIONS(39),
    [sym_number_literal] = ACTIONS(41),
    [anon_sym_true] = ACTIONS(41),
    [anon_sym_false] = ACTIONS(41),
    [anon_sym_AT] = ACTIONS(39),
    [sym_operator] = ACTIONS(41),
    [sym_punctuation] = ACTIONS(41),
    [sym_type_identifier] = ACTIONS(41),
  },
};

static const uint16_t ts_small_parse_table[] = {
  [0] = 2,
    ACTIONS(3), 1,
      sym_line_comment,
    ACTIONS(43), 1,
      sym_type_identifier,
  [7] = 2,
    ACTIONS(3), 1,
      sym_line_comment,
    ACTIONS(45), 1,
      ts_builtin_sym_end,
};

static const uint32_t ts_small_parse_table_map[] = {
  [SMALL_STATE(6)] = 0,
  [SMALL_STATE(7)] = 7,
};

static const TSParseActionEntry ts_parse_actions[] = {
  [0] = {.entry = {.count = 0, .reusable = false}},
  [1] = {.entry = {.count = 1, .reusable = false}}, RECOVER(),
  [3] = {.entry = {.count = 1, .reusable = true}}, SHIFT_EXTRA(),
  [5] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_source_file, 0, 0, 0),
  [7] = {.entry = {.count = 1, .reusable = false}}, SHIFT(2),
  [9] = {.entry = {.count = 1, .reusable = true}}, SHIFT(2),
  [11] = {.entry = {.count = 1, .reusable = false}}, SHIFT(4),
  [13] = {.entry = {.count = 1, .reusable = true}}, SHIFT(6),
  [15] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_source_file, 1, 0, 0),
  [17] = {.entry = {.count = 1, .reusable = false}}, SHIFT(3),
  [19] = {.entry = {.count = 1, .reusable = true}}, SHIFT(3),
  [21] = {.entry = {.count = 1, .reusable = true}}, REDUCE(aux_sym_source_file_repeat1, 2, 0, 0),
  [23] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_source_file_repeat1, 2, 0, 0), SHIFT_REPEAT(3),
  [26] = {.entry = {.count = 2, .reusable = true}}, REDUCE(aux_sym_source_file_repeat1, 2, 0, 0), SHIFT_REPEAT(3),
  [29] = {.entry = {.count = 2, .reusable = false}}, REDUCE(aux_sym_source_file_repeat1, 2, 0, 0), SHIFT_REPEAT(4),
  [32] = {.entry = {.count = 2, .reusable = true}}, REDUCE(aux_sym_source_file_repeat1, 2, 0, 0), SHIFT_REPEAT(6),
  [35] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_boolean_literal, 1, 0, 0),
  [37] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_boolean_literal, 1, 0, 0),
  [39] = {.entry = {.count = 1, .reusable = true}}, REDUCE(sym_annotation, 2, 0, 0),
  [41] = {.entry = {.count = 1, .reusable = false}}, REDUCE(sym_annotation, 2, 0, 0),
  [43] = {.entry = {.count = 1, .reusable = true}}, SHIFT(5),
  [45] = {.entry = {.count = 1, .reusable = true}},  ACCEPT_INPUT(),
};

#ifdef __cplusplus
extern "C" {
#endif
#ifdef TREE_SITTER_HIDE_SYMBOLS
#define TS_PUBLIC
#elif defined(_WIN32)
#define TS_PUBLIC __declspec(dllexport)
#else
#define TS_PUBLIC __attribute__((visibility("default")))
#endif

TS_PUBLIC const TSLanguage *tree_sitter_vertex(void) {
  static const TSLanguage language = {
    .version = LANGUAGE_VERSION,
    .symbol_count = SYMBOL_COUNT,
    .alias_count = ALIAS_COUNT,
    .token_count = TOKEN_COUNT,
    .external_token_count = EXTERNAL_TOKEN_COUNT,
    .state_count = STATE_COUNT,
    .large_state_count = LARGE_STATE_COUNT,
    .production_id_count = PRODUCTION_ID_COUNT,
    .field_count = FIELD_COUNT,
    .max_alias_sequence_length = MAX_ALIAS_SEQUENCE_LENGTH,
    .parse_table = &ts_parse_table[0][0],
    .small_parse_table = ts_small_parse_table,
    .small_parse_table_map = ts_small_parse_table_map,
    .parse_actions = ts_parse_actions,
    .symbol_names = ts_symbol_names,
    .symbol_metadata = ts_symbol_metadata,
    .public_symbol_map = ts_symbol_map,
    .alias_map = ts_non_terminal_alias_map,
    .alias_sequences = &ts_alias_sequences[0][0],
    .lex_modes = ts_lex_modes,
    .lex_fn = ts_lex,
    .keyword_lex_fn = ts_lex_keywords,
    .keyword_capture_token = sym_identifier,
    .primary_state_ids = ts_primary_state_ids,
  };
  return &language;
}
#ifdef __cplusplus
}
#endif
