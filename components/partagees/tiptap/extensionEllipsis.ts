import { mergeAttributes, Node } from "@tiptap/core";

/**
 * Node TipTap inline atomique — troncature de citation `[…]`.
 *
 * Non-éditable, supprimable par backspace/delete.
 * En mode éditeur : fond gris léger + border-radius.
 * En mode impression : texte normal sans style.
 */
export const CitationEllipsis = Node.create({
  name: "citationEllipsis",
  group: "inline",
  inline: true,
  atom: true,
  selectable: true,

  parseHTML() {
    return [{ tag: "span[data-citation-ellipsis]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(HTMLAttributes, {
        "data-citation-ellipsis": "",
        class: "tiptap-ellipsis",
      }),
      "[…]",
    ];
  },
});
