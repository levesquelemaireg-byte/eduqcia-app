"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";

type RetourContextuel = {
  chemin: string;
  libelle: string;
};

/**
 * Détermine le libellé et le chemin de retour selon la provenance.
 * Utilise le pathname courant pour deviner le contexte de navigation.
 */
export function useRetourContextuel(fallbackChemin?: string): RetourContextuel {
  const pathname = usePathname();

  return useMemo(() => {
    // Si on est sur /bank/* → retour à la banque
    if (pathname.startsWith("/bank")) {
      return { chemin: "/bank", libelle: "Retour à la banque" };
    }
    // Si on est sur /documents/* → retour à mes documents
    if (pathname.startsWith("/documents")) {
      return { chemin: "/documents", libelle: "Retour à mes documents" };
    }
    // Si on est sur /questions/* → retour à mes tâches
    if (pathname.startsWith("/questions")) {
      return { chemin: "/questions", libelle: "Retour à mes tâches" };
    }
    // Si on est sur /evaluations/* → retour à mes épreuves
    if (pathname.startsWith("/evaluations")) {
      return { chemin: "/evaluations", libelle: "Retour à mes épreuves" };
    }
    // Fallback
    return { chemin: fallbackChemin ?? "/dashboard", libelle: "Retour" };
  }, [pathname, fallbackChemin]);
}
