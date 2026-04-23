"use client";

import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";

/**
 * NodeView React du nœud `docRef` — badge visuel (icône `article` + numéro).
 * Le HTML sérialisé est `<span data-doc-ref="1">{{doc_1}}</span>` (numéro 1-based) ;
 * seul le rendu DANS l'éditeur change. Atomique : flèches sautent, Backspace
 * supprime entier.
 */
export function DocRefNodeView({ node }: NodeViewProps) {
  const raw = node.attrs.numero;
  const numero = typeof raw === "number" && Number.isFinite(raw) && raw >= 1 ? Math.trunc(raw) : 1;
  return (
    <NodeViewWrapper
      as="span"
      data-doc-ref={String(numero)}
      className="tiptap-doc-ref inline-flex select-none items-center gap-1 rounded border border-accent/40 bg-accent/10 px-1.5 py-0 align-baseline text-accent"
      style={{ cursor: "default" }}
    >
      <span className="material-symbols-outlined text-[12px] text-accent" aria-hidden="true">
        article
      </span>
      <span className="text-[12px] text-accent">
        document <span className="font-bold">{numero}</span>
      </span>
    </NodeViewWrapper>
  );
}
