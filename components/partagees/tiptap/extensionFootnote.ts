import { mergeAttributes, Node } from "@tiptap/core";

/**
 * Node TipTap inline atomique — exposant numéroté de note de bas de page.
 *
 * Inséré APRÈS le mot sélectionné (pas autour). Le mot reste intact,
 * seul le petit chiffre ¹ ² ³ est ajouté. Non-éditable, supprimable
 * par backspace/delete.
 *
 * Les définitions sont stockées dans un state React externe, PAS dans
 * le contenu TipTap. Le node ne stocke que `noteId`.
 */
export const FootnoteNode = Node.create({
  name: "footnoteRef",
  group: "inline",
  inline: true,
  atom: true,
  selectable: true,

  addAttributes() {
    return {
      noteId: {
        default: 1,
        parseHTML: (el) => Number(el.getAttribute("data-footnote")) || 1,
        renderHTML: (attrs) => ({ "data-footnote": String(attrs.noteId) }),
      },
      /** Définition stockée pour persistance HTML. Éditée via React, pas dans TipTap. */
      definition: {
        default: "",
        parseHTML: (el) => el.getAttribute("data-footnote-def") ?? "",
        renderHTML: (attrs) => {
          if (!attrs.definition) return {};
          return { "data-footnote-def": attrs.definition };
        },
      },
    };
  },

  parseHTML() {
    return [{ tag: "sup[data-footnote]" }];
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      "sup",
      mergeAttributes(HTMLAttributes, {
        class: "tiptap-footnote",
        "data-footnote": String(node.attrs.noteId),
      }),
      String(node.attrs.noteId),
    ];
  },
});
