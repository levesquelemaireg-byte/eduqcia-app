/**
 * Selectors for lecture/published mode — accept TaeFicheData (flat, pre-processed).
 * Much simpler than wizard selectors: data is already resolved, no NR cascade needed.
 */

import { ready, hidden, sanitize } from "@/lib/fiche/helpers";
import { hasFicheContent } from "@/lib/tae/fiche-helpers";
import { buildAmorceDocumentaire } from "@/lib/tae/consigne-helpers";
import type {
  SectionState,
  HeaderData,
  ConsigneData,
  GuidageData,
  DocumentsData,
  CorrigeData,
  GrilleData,
  CompetenceData,
  ConnaissancesData,
  FooterData,
  SelectorRefs,
} from "@/lib/fiche/types";
import type { TaeFicheData } from "@/lib/types/fiche";

/** Header — always ready, OI + pills from pre-processed data. */
export function selectLectureHeader(
  state: TaeFicheData,
  _refs: SelectorRefs,
): SectionState<HeaderData> {
  return ready({
    oi: state.oi ? { id: state.oi.id, titre: state.oi.titre, icone: state.oi.icone } : null,
    comportement: state.comportement
      ? { id: state.comportement.id, enonce: state.comportement.enonce }
      : null,
    outilEvaluation: state.outilEvaluation,
    niveau: state.niveau.label,
    discipline: state.discipline.label,
    aspectsSociete: state.aspects_societe,
  });
}

/** Consigne — already resolved HTML (placeholders, NR cascade done at publish). */
export function selectLectureConsigne(
  state: TaeFicheData,
  _refs: SelectorRefs,
): SectionState<ConsigneData> {
  if (!hasFicheContent(state.consigne)) return hidden();

  return ready({
    html: sanitize(state.consigne),
    amorce: state.documents.length > 0 ? buildAmorceDocumentaire(state.documents.length) : null,
  });
}

/** Guidage — hidden if empty. */
export function selectLectureGuidage(
  state: TaeFicheData,
  _refs: SelectorRefs,
): SectionState<GuidageData> {
  if (!hasFicheContent(state.guidage)) return hidden();

  return ready({ html: sanitize(state.guidage) });
}

/** Documents — always ready, data already in DocumentFiche format. */
export function selectLectureDocuments(
  state: TaeFicheData,
  _refs: SelectorRefs,
): SectionState<DocumentsData> {
  return ready({ documents: state.documents });
}

/** Corrigé — hidden if empty. */
export function selectLectureCorrige(
  state: TaeFicheData,
  _refs: SelectorRefs,
): SectionState<CorrigeData> {
  if (!hasFicheContent(state.corrige)) return hidden();

  return ready({
    html: sanitize(state.corrige),
    notesCorrecteur: null,
  });
}

/** Grille — hidden if no evaluation tool. */
export function selectLectureGrille(
  state: TaeFicheData,
  _refs: SelectorRefs,
): SectionState<GrilleData> {
  if (!state.outilEvaluation) return hidden();

  return ready({ outilEvaluation: state.outilEvaluation });
}

/** Compétence disciplinaire — hidden if not set. */
export function selectLectureCD(
  state: TaeFicheData,
  _refs: SelectorRefs,
): SectionState<CompetenceData> {
  if (!state.cd) return hidden();

  return ready({ cd: state.cd });
}

/** Connaissances — hidden if empty. */
export function selectLectureConnaissances(
  state: TaeFicheData,
  _refs: SelectorRefs,
): SectionState<ConnaissancesData> {
  if (state.connaissances.length === 0) return hidden();

  return ready({ connaissances: state.connaissances });
}

/** Footer — always ready, data pre-processed. */
export function selectLectureFooter(
  state: TaeFicheData,
  _refs: SelectorRefs,
): SectionState<FooterData> {
  return ready({
    auteurs: state.auteurs,
    createdAt: state.created_at,
    isPublished: state.is_published,
    nbLignes: state.nb_lignes,
    showStudentAnswerLines: state.showStudentAnswerLines !== false,
    version: state.version,
    versionUpdatedAt: state.version_updated_at,
    hideNbLignesSkeleton: false,
  });
}
