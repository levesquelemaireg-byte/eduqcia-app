import { mergeAttributes, Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { DocRefNodeView } from "@/components/tache/wizard/tiptap/DocRefNodeView";

/**
 * Nœud atomique inline — placeholder document (CONSIGNE-EDITOR.md §4).
 * Le HTML sérialisé utilise `{{doc_N}}` (numéro 1-based) ; le `data-doc-ref`
 * contient le même numéro pour l'affichage dans l'éditeur et la prévisualisation.
 *
 * Rétrocompat : le parseHTML accepte aussi les anciens `data-doc-ref="A"` (legacy
 * alphabétique) et les convertit en numéro au chargement.
 */
export const DocRef = Node.create({
  name: "docRef",
  group: "inline",
  inline: true,
  atom: true,
  selectable: true,

  addAttributes() {
    return {
      numero: {
        default: 1,
        parseHTML: (el) => parseDocRefAttr(el.getAttribute("data-doc-ref")),
        renderHTML: (attrs) => {
          const n = normaliseNumero(attrs.numero);
          return { "data-doc-ref": String(n) };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "span[data-doc-ref]",
        getAttrs: (el) => ({
          numero: parseDocRefAttr((el as HTMLElement).getAttribute("data-doc-ref")),
        }),
      },
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(DocRefNodeView);
  },

  renderHTML({ node, HTMLAttributes }) {
    const n = normaliseNumero(node.attrs.numero);
    return [
      "span",
      mergeAttributes(HTMLAttributes, {
        class:
          "tiptap-doc-ref inline-flex min-w-[1.25rem] items-center justify-center rounded border border-accent/40 bg-accent/10 px-1 font-semibold text-accent",
        "data-doc-ref": String(n),
      }),
      `{{doc_${n}}}`,
    ];
  },
});

/** Chiffre valide (≥ 1) ; sinon 1. */
function normaliseNumero(v: unknown): number {
  const n = typeof v === "number" ? v : parseInt(String(v ?? ""), 10);
  return Number.isFinite(n) && n >= 1 ? Math.trunc(n) : 1;
}

/** Accepte un chiffre ("1"–"99") ou une lettre legacy ("A"–"Z") et retourne un numéro 1-based. */
function parseDocRefAttr(raw: string | null): number {
  if (!raw) return 1;
  const trimmed = raw.trim();
  if (/^\d+$/.test(trimmed)) {
    const n = parseInt(trimmed, 10);
    return Number.isFinite(n) && n >= 1 ? n : 1;
  }
  const code = trimmed.toUpperCase().charCodeAt(0) - 64;
  return code >= 1 ? code : 1;
}
