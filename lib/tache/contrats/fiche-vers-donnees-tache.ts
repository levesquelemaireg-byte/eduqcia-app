/**
 * Mapper TaeFicheData → DonneesTache.
 *
 * Utilisé pour construire un DonneesEpreuve depuis des tâches publiées
 * (pipeline d'impression épreuve depuis l'éditeur de composition).
 *
 * Fonction pure — les grilles d'évaluation sont passées en paramètre.
 */

import type { TaeFicheData } from "@/lib/types/fiche";
import type { RendererDocument } from "@/lib/types/document-renderer";
import { getVariantSlugForComportementId } from "@/lib/tache/non-redaction/registry";
import { documentFicheVersRenderer } from "@/lib/documents/document-fiche-vers-renderer";
import { resoudreOutilEvaluation, type GrilleEvaluationEntree } from "./etat-wizard-vers-tache";
import type { DonneesTache, EspaceProduction, Guidage } from "./donnees";

/** Déduit l'espace de production depuis les données de la fiche. */
function deduireEspaceProduction(fiche: TaeFicheData): EspaceProduction {
  const slug = getVariantSlugForComportementId(fiche.comportement.id);
  if (slug === "ordre-chronologique") return { type: "cases", options: ["A", "B", "C", "D"] };
  if (slug === "ligne-du-temps" || slug === "avant-apres") return { type: "libre" };
  return { type: "lignes", nbLignes: fiche.nb_lignes };
}

/** Extrait les RendererDocument depuis les DocumentFiche. */
function extraireDocuments(fiche: TaeFicheData): RendererDocument[] {
  return fiche.documents
    .map((d) => d.rendererDocument ?? documentFicheVersRenderer(d))
    .filter((d): d is RendererDocument => d != null);
}

/** Construit le guidage structuré depuis la string legacy. */
function construireGuidage(guidage: string): Guidage {
  const trimmed = guidage.trim();
  return trimmed ? { content: trimmed } : null;
}

/**
 * Convertit une TaeFicheData (format lecture/legacy) en DonneesTache
 * (format structuré pour la chaîne d'impression).
 */
export function ficheTaVersDonneesTache(
  fiche: TaeFicheData,
  grilles: GrilleEvaluationEntree[],
): DonneesTache {
  return {
    id: fiche.id,
    auteur_id: fiche.auteur_id,
    auteurs: fiche.auteurs,

    titre: fiche.comportement.enonce,
    consigne: fiche.consigne,
    guidage: construireGuidage(fiche.guidage),
    documents: extraireDocuments(fiche),
    espaceProduction: deduireEspaceProduction(fiche),
    outilEvaluation: resoudreOutilEvaluation(fiche.outilEvaluation, grilles),
    corrige: fiche.corrige,

    aspects_societe: fiche.aspects_societe,
    nb_lignes: fiche.nb_lignes,
    niveau: fiche.niveau,
    discipline: fiche.discipline,
    oi: fiche.oi,
    comportement: fiche.comportement,
    cd: fiche.cd,
    connaissances: fiche.connaissances,

    version: fiche.version,
    version_updated_at: fiche.version_updated_at,
    is_published: fiche.is_published,
    created_at: fiche.created_at,
    updated_at: fiche.updated_at,
  };
}
