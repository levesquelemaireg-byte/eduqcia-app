"use client";

import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";

/**
 * NodeView React du nœud `docRef` — badge visuel (icône `article` + lettre).
 * Le HTML sérialisé reste `<span data-doc-ref="A">{{doc_A}}</span>` (cf. extensionDocRef.ts) ;
 * seul le rendu DANS l'éditeur change. Atomique : flèches sautent, Backspace supprime entier.
 */
export function DocRefNodeView({ node }: NodeViewProps) {
  const letter = (node.attrs.letter as string) || "A";
  return (
    <NodeViewWrapper
      as="span"
      data-doc-ref={letter}
      className="tiptap-doc-ref inline-flex select-none items-center gap-1 rounded border border-accent/40 bg-accent/10 px-1.5 py-0 align-baseline text-accent"
      style={{ cursor: "default" }}
    >
      <span className="material-symbols-outlined text-[12px] text-accent" aria-hidden="true">
        article
      </span>
      <span className="text-[12px] text-accent">
        document <span className="font-bold">{letter}</span>
      </span>
    </NodeViewWrapper>
  );
}
