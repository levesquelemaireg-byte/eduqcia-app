"use client";

import type { ReactNode } from "react";

type Props = {
  /** Identifiant stable (catalogue + CSS debug). */
  name: string;
  children: ReactNode;
};

/**
 * Enveloppe playground uniquement — `data-fragment` pour le mode debug (aucune modif des composants prod).
 */
export function PlaygroundFragmentWrapper({ name, children }: Props) {
  return (
    <div data-fragment={name} className="playground-fragment-root min-w-0">
      {children}
    </div>
  );
}
