package tree_sitter_vertex_test

import (
	"testing"

	tree_sitter "github.com/smacker/go-tree-sitter"
	"github.com/tree-sitter/tree-sitter-vertex"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_vertex.Language())
	if language == nil {
		t.Errorf("Error loading Vertex grammar")
	}
}
