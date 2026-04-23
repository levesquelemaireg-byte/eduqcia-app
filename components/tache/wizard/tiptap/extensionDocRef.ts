import { mergeAttributes, Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { DocRefNodeView } from "@/components/tache/wizard/tiptap/DocRefNodeView";

/**
 * Nœud atomique inline — placeholder document (CONSIGNE-EDITOR.md §4).
 * Le HTML sérialisé utilise `{{doc_N}}` (numéro 1-based) ; le `data-doc-ref`
 * conserve la lettre pour l'affichage dans l'éditeur et la prévisualisation.
 */
export const DocRef = Node.create({
  name: "docRef",
  group: "inline",
  inline: true,
  atom: true,
  selectable: true,

  addAttributes() {
    return {
      letter: {
        default: "A",
        parseHTML: (el) => el.getAttribute("data-doc-ref"),
        renderHTML: (attrs) => {
          if (!attrs.letter) return {};
          return { "data-doc-ref": attrs.letter };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "span[data-doc-ref]",
        getAttrs: (el) => ({
          letter: (el as HTMLElement).getAttribute("data-doc-ref") || "A",
        }),
      },
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(DocRefNodeView);
  },

  renderHTML({ node, HTMLAttributes }) {
    const letter = node.attrs.letter as string;
    const numero = (letter.toUpperCase().charCodeAt(0) - 64) | 0;
    const safe = numero >= 1 ? numero : 1;
    return [
      "span",
      mergeAttributes(HTMLAttributes, {
        class:
          "tiptap-doc-ref inline-flex min-w-[1.25rem] items-center justify-center rounded border border-accent/40 bg-accent/10 px-1 font-semibold text-accent",
        "data-doc-ref": letter,
      }),
      `{{doc_${safe}}}`,
    ];
  },
});
