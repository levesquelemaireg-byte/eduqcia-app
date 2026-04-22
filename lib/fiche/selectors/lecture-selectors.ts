/**
 * Selectors for lecture/published mode — accept TacheFicheData (flat, pre-processed).
 * Much simpler than wizard selectors: data is already resolved, no NR cascade needed.
 */

import { ready, hidden, sanitize, resolveDocPlaceholders } from "@/lib/fiche/helpers";
import { hasFicheContent } from "@/lib/tache/fiche-helpers";
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
import type { TacheFicheData } from "@/lib/types/fiche";

/** Header — always ready, OI + pills from pre-processed data. */
export function selectLectureHeader(
  state: TacheFicheData,
  _refs: SelectorRefs,
): SectionState<HeaderData> {
  return ready({
    oi: state.oi ? { id: state.oi.id, titre: state.oi.titre, icone: state.oi.icone } : null,
    comportement: state.comportement
      ? { id: state.comportement.id, enonce: state.comportement.enonce }
      : null,
    niveau: state.niveau.label,
    discipline: state.discipline.label,
    aspectsSociete: state.aspects_societe,
  });
}

/** Consigne — resolve doc placeholders, sanitize. HTML TipTap contient déjà l'amorce. */
export function selectLectureConsigne(
  state: TacheFicheData,
  _refs: SelectorRefs,
): SectionState<ConsigneData> {
  if (!hasFicheContent(state.consigne)) return hidden();

  const nbDocs = state.documents.length;
  const resolved = resolveDocPlaceholders(state.consigne, nbDocs);

  return ready({ html: sanitize(resolved) });
}

/** Guidage — hidden if empty. */
export function selectLectureGuidage(
  state: TacheFicheData,
  _refs: SelectorRefs,
): SectionState<GuidageData> {
  if (!hasFicheContent(state.guidage)) return hidden();

  return ready({ html: sanitize(state.guidage) });
}

/** Documents — always ready, data already in DocumentFiche format. */
export function selectLectureDocuments(
  state: TacheFicheData,
  _refs: SelectorRefs,
): SectionState<DocumentsData> {
  return ready({ documents: state.documents });
}

/** Corrigé — hidden if empty. */
export function selectLectureCorrige(
  state: TacheFicheData,
  _refs: SelectorRefs,
): SectionState<CorrigeData> {
  if (!hasFicheContent(state.corrige)) return hidden();

  return ready({
    html: sanitize(state.corrige),
    notesCorrecteur: null,
  });
}

/** Grille — hidden if no evaluation tool. Resolve entry from refs. */
export function selectLectureGrille(
  state: TacheFicheData,
  refs: SelectorRefs,
): SectionState<GrilleData> {
  if (!state.outilEvaluation) return hidden();

  const entry = refs.grilles.find((g) => g.id === state.outilEvaluation) ?? null;
  return ready({ entry, outilEvaluationId: state.outilEvaluation });
}

/** Compétence disciplinaire — hidden if not set. */
export function selectLectureCD(
  state: TacheFicheData,
  _refs: SelectorRefs,
): SectionState<CompetenceData> {
  if (!state.cd) return hidden();

  return ready({ cd: state.cd });
}

/** Connaissances — hidden if empty. */
export function selectLectureConnaissances(
  state: TacheFicheData,
  _refs: SelectorRefs,
): SectionState<ConnaissancesData> {
  if (state.connaissances.length === 0) return hidden();

  return ready({ connaissances: state.connaissances });
}

/** Footer — always ready, data pre-processed. */
export function selectLectureFooter(
  state: TacheFicheData,
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
