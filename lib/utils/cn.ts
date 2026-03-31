import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Fusionne des classes Tailwind sans conflits (dernière classe gagne pour les utilitaires conflictuels).
 * Préférer des littéraux complets pour le scan Tailwind — voir `docs/DESIGN-SYSTEM.md` (Tailwind).
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
