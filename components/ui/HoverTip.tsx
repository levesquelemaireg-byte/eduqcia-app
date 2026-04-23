"use client";

import type { ReactNode } from "react";
import { Tooltip, type TooltipPlacement } from "@/components/ui/Tooltip";

type Props = {
  /** Texte affiché au hover. Si `null` ou `undefined`, l'enfant est rendu tel quel (sans tooltip). */
  label?: string | null;
  /** Placement préféré — défaut `top`, cohérent avec les boutons de barre d'action. */
  placement?: TooltipPlacement;
  /** Largeur en pixels — défaut 240 (labels courts). */
  width?: number;
  children: ReactNode;
};

/**
 * Raccourci du composant `Tooltip` pour les cas simples (texte court au hover).
 * Remplacement visuel cohérent de l'attribut HTML `title=""` par le tooltip stylé
 * du design system (même apparence que le tooltip « Ancrage temporel »).
 *
 * Si `label` est absent, ne rend aucun tooltip — utile pour branchement conditionnel
 * (`<HoverTip label={disabled ? 'Champs manquants' : null}>`).
 */
export function HoverTip({ label, placement = "top", width = 240, children }: Props) {
  if (!label) return <>{children}</>;
  return (
    <Tooltip content={label} placement={placement} width={width}>
      {children}
    </Tooltip>
  );
}
