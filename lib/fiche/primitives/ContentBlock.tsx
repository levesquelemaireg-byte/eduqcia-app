"use client";

import { cn } from "@/lib/utils/cn";
import { TIPTAP_HTML_STYLES } from "@/lib/fiche/primitives/tiptap-html-styles";

type Props = {
  /** HTML déjà sanitisé (dans le selector). Ce composant ne sanitise PAS. */
  html: string;
  className?: string;
  /** Nombre de lignes max (thumbnail). undefined = pas de clamp. */
  clamp?: number;
};

/**
 * Bloc HTML sanitisé avec line-clamp optionnel.
 * Le HTML doit être sanitisé EN AMONT (dans le selector) via DOMPurify.
 */
export function ContentBlock({ html, className, clamp }: Props) {
  return (
    <div
      className={cn(
        `text-base font-medium leading-relaxed ${TIPTAP_HTML_STYLES}`,
        clamp && `line-clamp-${clamp}`,
        className,
      )}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
