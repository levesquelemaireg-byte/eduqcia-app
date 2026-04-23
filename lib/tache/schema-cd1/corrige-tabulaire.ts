/**
 * Construction du corrigé tabulaire Section B.
 *
 * Génère les 7 lignes du tableau (1 Objet + 6 mises en relation) à partir du
 * `SchemaCd1Data` et des documents associés. La colonne Documents est dérivée
 * des `casesAssociees` de chaque document — aucun couplage inverse à maintenir.
 *
 * Points fixes (grille ministérielle invariable) :
 *   - Objet : /2
 *   - Élément central : /1
 *   - Élément de précision : /1
 *   - Total : /8
 */

import type { DocumentSlotId } from "@/lib/tache/blueprint-helpers";
import type { DocumentSlotData } from "@/lib/tache/document-helpers";
import { numeroAffiche } from "@/lib/tache/document-helpers";
import { ASPECT_LABEL } from "@/lib/tache/aspect-labels";
import type { AspectSocieteKey } from "@/lib/tache/redaction-helpers";
import {
  obtenirCase,
  TOUTES_LES_CASES,
  type CaseSchemaCd1,
  type CleCase,
  type SchemaCd1Data,
} from "./types";

export type LigneCorrige = {
  cleCase: CleCase;
  titreCase: string;
  libelleComplet: string;
  guidageHtml: string;
  reponse: string;
  points: number;
  documentsNumeros: number[];
};

export type CorrigeTabulaire = {
  lignes: LigneCorrige[];
  total: number;
  leurresNumeros: number[];
};

const POINTS_OBJET = 2;
const POINTS_AUTRE = 1;
export const POINTS_TOTAL_SCHEMA_CD1 = POINTS_OBJET + 6 * POINTS_AUTRE;

function pointsPourCle(cle: CleCase): number {
  return cle === "objet" ? POINTS_OBJET : POINTS_AUTRE;
}

function titreDeBase(cle: CleCase): string {
  switch (cle) {
    case "objet":
      return "Objet de la description";
    case "blocA.pivot":
    case "blocB.pivot":
      return "Élément central";
    case "blocA.precision1":
    case "blocA.precision2":
    case "blocB.precision1":
    case "blocB.precision2":
      return "Élément de précision";
  }
}

function aspectPourCle(
  cle: CleCase,
  aspectA: AspectSocieteKey | null,
  aspectB: AspectSocieteKey | null,
): AspectSocieteKey | null {
  if (cle === "objet") return null;
  return cle.startsWith("blocA.") ? aspectA : aspectB;
}

function libelleComplet(
  cle: CleCase,
  aspectA: AspectSocieteKey | null,
  aspectB: AspectSocieteKey | null,
): string {
  const base = titreDeBase(cle);
  const aspect = aspectPourCle(cle, aspectA, aspectB);
  if (!aspect) return base;
  return `${base} — Aspect ${ASPECT_LABEL[aspect].toLowerCase()}`;
}

type ArgsCorrige = {
  schema: SchemaCd1Data;
  aspectA: AspectSocieteKey | null;
  aspectB: AspectSocieteKey | null;
  documentSlots: { slotId: DocumentSlotId }[];
  documents: Partial<Record<DocumentSlotId, DocumentSlotData>>;
};

export function construireCorrigeTabulaire(args: ArgsCorrige): CorrigeTabulaire {
  const { schema, aspectA, aspectB, documentSlots, documents } = args;

  // Mapping CleCase → numéros de documents qui l'alimentent
  const documentsParCase = new Map<CleCase, number[]>();
  for (const cle of TOUTES_LES_CASES) documentsParCase.set(cle, []);

  const leurresNumeros: number[] = [];

  for (const { slotId } of documentSlots) {
    const doc = documents[slotId];
    if (!doc || doc.mode === "idle") continue;
    const numero = numeroAffiche(slotId);
    if (doc.estLeurre) {
      leurresNumeros.push(numero);
      continue;
    }
    for (const cle of doc.casesAssociees) {
      const existant = documentsParCase.get(cle) ?? [];
      existant.push(numero);
      documentsParCase.set(cle, existant);
    }
  }

  const lignes: LigneCorrige[] = TOUTES_LES_CASES.map((cle) => {
    const c: CaseSchemaCd1 = obtenirCase(schema, cle);
    return {
      cleCase: cle,
      titreCase: titreDeBase(cle),
      libelleComplet: libelleComplet(cle, aspectA, aspectB),
      guidageHtml: c.guidage,
      reponse: c.reponse,
      points: pointsPourCle(cle),
      documentsNumeros: documentsParCase.get(cle) ?? [],
    };
  });

  return {
    lignes,
    total: POINTS_TOTAL_SCHEMA_CD1,
    leurresNumeros,
  };
}
