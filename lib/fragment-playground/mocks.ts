/**
 * Mocks `TaeFicheData` par `comportement_id` (`public/data/oi.json`) — **importable uniquement depuis le playground**.
 * HTML NR : généré via les mêmes builders que la publication (`ordre-chronologique-payload`, etc.).
 */

import type { DocumentSlotId } from "@/lib/tae/blueprint-helpers";
import { emptyDocumentSlot, type DocumentSlotData } from "@/lib/tae/document-helpers";
import {
  buildOrdreChronologiqueConsigneHtml,
  buildOrdreChronologiqueCorrigeHtml,
  buildOrdreChronologiqueGuidageHtml,
  type OrdreChronologiquePayload,
} from "@/lib/tae/non-redaction/ordre-chronologique-payload";
import type { OrdrePermutation } from "@/lib/tae/non-redaction/ordre-chronologique-permutations";
import {
  buildLigneDuTempsConsigneHtml,
  buildLigneDuTempsCorrigeHtml,
  buildLigneDuTempsGuidageHtml,
  normalizeLigneDuTempsPayload,
} from "@/lib/tae/non-redaction/ligne-du-temps-payload";
import {
  buildAvantApresConsigneHtml,
  buildAvantApresCorrigeHtml,
  buildAvantApresGuidageHtml,
  initialAvantApresPayload,
  runAvantApresGeneration,
} from "@/lib/tae/non-redaction/avant-apres-payload";
import type { TaeFicheData, DocumentFiche } from "@/lib/types/fiche";

const PLAYGROUND_ISO = "2026-04-01T12:00:00.000Z";

function textDoc(letter: DocumentFiche["letter"]): DocumentFiche {
  return {
    letter,
    titre: `Document ${letter} — titre factice`,
    contenu: `<p>Contenu textuel factif du document ${letter} pour le playground.</p>`,
    source_citation: "Source factice — playground DEV.",
    type: "textuel",
    image_url: null,
    imagePixelWidth: null,
    imagePixelHeight: null,
    printImpressionScale: 1,
    imageLegende: null,
    imageLegendePosition: null,
  };
}

function documentsForCount(n: number): DocumentFiche[] {
  const letters: DocumentFiche["letter"][] = ["A", "B", "C", "D"];
  return letters.slice(0, Math.min(n, 4)).map((L) => textDoc(L));
}

const CD_PLAYGROUND = {
  competence: "CD1 — Construire sa conscience citoyenne",
  composante: "C1 — Comprendre des faits",
  critere: "Critère factice — playground",
} as const;

const CONNAISSANCE_PLAYGROUND = [
  {
    realite_sociale: "Réalité sociale factice",
    section: "Section factice",
    sous_section: null as string | null,
    enonce: "Énoncé de connaissance factice — playground.",
  },
];

function baseRedactionTae(
  input: {
    comportementId: string;
    comportementEnonce: string;
    oiId: string;
    oiTitre: string;
    oiIcone: string;
    outilEvaluation: string;
    nb_documents: number;
    nb_lignes: number;
    consigne: string;
    guidage?: string;
    corrige?: string;
  },
  extra?: Partial<TaeFicheData>,
): TaeFicheData {
  const guidage = input.guidage ?? "<p>Guidage complémentaire factice pour le playground.</p>";
  const corrige = input.corrige ?? "<p>Corrigé type factice — réponse attendue décrite ici.</p>";
  return {
    id: `playground-${input.comportementId}`,
    auteur_id: "playground-user",
    auteurs: [{ id: "playground-user", first_name: "Enseignant·e", last_name: "playground" }],
    consigne: input.consigne,
    guidage,
    corrige,
    aspects_societe: ["Politique"],
    nb_lignes: input.nb_lignes,
    showStudentAnswerLines: true,
    showGuidageOnStudentSheet: true,
    niveau: { label: "Secondaire 4" },
    discipline: { label: "Histoire du Québec et du Canada" },
    oi: { id: input.oiId, titre: input.oiTitre, icone: input.oiIcone },
    comportement: { id: input.comportementId, enonce: input.comportementEnonce },
    outilEvaluation: input.outilEvaluation,
    cd: CD_PLAYGROUND,
    connaissances: CONNAISSANCE_PLAYGROUND,
    documents: documentsForCount(input.nb_documents),
    version: 1,
    version_updated_at: null,
    is_published: true,
    created_at: PLAYGROUND_ISO,
    updated_at: PLAYGROUND_ISO,
    ...extra,
  };
}

function playgroundFourDocs(): Record<DocumentSlotId, DocumentSlotData> {
  const mk = (annee: number): DocumentSlotData => ({
    ...emptyDocumentSlot(),
    mode: "create",
    type: "textuel",
    titre: `Document ${annee}`,
    contenu: "<p>Corps factice.</p>",
    source_citation: "Source secondaire",
    source_type: "secondaire",
    repere_temporel: String(annee),
    annee_normalisee: annee,
  });
  return {
    doc_A: mk(1900),
    doc_B: mk(1910),
    doc_C: mk(1920),
    doc_D: mk(1930),
  };
}

function mockOrdreChronologique(): TaeFicheData {
  const rowA: OrdrePermutation = [1, 2, 3, 4];
  const rowB: OrdrePermutation = [2, 1, 4, 3];
  const rowC: OrdrePermutation = [3, 4, 1, 2];
  const rowD: OrdrePermutation = [4, 3, 2, 1];
  const ordrePayload: OrdreChronologiquePayload = {
    consigneTheme: "Événements liés à la période révolutionnaire",
    optionA: rowA,
    optionB: rowB,
    optionC: rowC,
    optionD: rowD,
    correctLetter: "A",
    optionsJustification:
      "La séquence A respecte l’ordre chronologique croissant des dates portées par les documents.",
    manualTieBreakSequence: null,
  };
  return baseRedactionTae(
    {
      comportementId: "1.1",
      comportementEnonce:
        "Ordonner chronologiquement des faits en tenant compte de repères de temps",
      oiId: "OI1",
      oiTitre: "Situer dans le temps",
      oiIcone: "hourglass",
      outilEvaluation: "OI1_SO1",
      nb_documents: 4,
      nb_lignes: 0,
      consigne: buildOrdreChronologiqueConsigneHtml(ordrePayload),
      guidage: buildOrdreChronologiqueGuidageHtml(),
      corrige: buildOrdreChronologiqueCorrigeHtml(ordrePayload),
    },
    { showStudentAnswerLines: false, nb_lignes: 0 },
  );
}

function mockLigneDuTemps(): TaeFicheData {
  const lignePayload = normalizeLigneDuTempsPayload({
    variant: "ligne-du-temps-v1",
    segmentCount: 3,
    boundaries: [1789, 1815, 1914, 1945],
    correctLetter: "B",
  });
  if (!lignePayload) {
    throw new Error("playground: ligne du temps payload invalide");
  }
  const consigne = buildLigneDuTempsConsigneHtml(lignePayload);
  if (!consigne) {
    throw new Error("playground: consigne ligne du temps vide");
  }
  return baseRedactionTae(
    {
      comportementId: "1.2",
      comportementEnonce: "Situer des faits sur une ligne du temps",
      oiId: "OI1",
      oiTitre: "Situer dans le temps",
      oiIcone: "hourglass",
      outilEvaluation: "OI1_SO2",
      nb_documents: 1,
      nb_lignes: 0,
      consigne,
      guidage: buildLigneDuTempsGuidageHtml(),
      corrige: buildLigneDuTempsCorrigeHtml(lignePayload),
    },
    { showStudentAnswerLines: false, nb_lignes: 0 },
  );
}

function mockAvantApres(): TaeFicheData {
  const gen = runAvantApresGeneration(
    {
      ...initialAvantApresPayload(),
      theme: "Situation politique en Europe",
      repere: "Déclenchement du conflit",
      anneeRepere: 1915,
      overrides: {},
    },
    ["doc_A", "doc_B", "doc_C", "doc_D"],
    playgroundFourDocs(),
    () => 0.42,
  );
  if (gen.errorCode !== null) {
    throw new Error(`playground: avant/après génération — ${gen.errorCode}`);
  }
  const p = gen.payload;
  return baseRedactionTae(
    {
      comportementId: "1.3",
      comportementEnonce:
        "Classer des faits selon qu'ils sont antérieurs ou postérieurs à un repère de temps",
      oiId: "OI1",
      oiTitre: "Situer dans le temps",
      oiIcone: "hourglass",
      outilEvaluation: "OI1_SO3",
      nb_documents: 4,
      nb_lignes: 0,
      consigne: buildAvantApresConsigneHtml(p),
      guidage: buildAvantApresGuidageHtml(),
      corrige: buildAvantApresCorrigeHtml(p),
    },
    { showStudentAnswerLines: false, nb_lignes: 0 },
  );
}

/** Une entrée par `comportement_id` sélectionnable au Bloc 2 (`isComportementSelectable`). */
export const MOCK_TAE_FICHE_BY_COMPORTEMENT_ID: Record<string, TaeFicheData> = {
  "0.1": baseRedactionTae({
    comportementId: "0.1",
    comportementEnonce: "Établir un fait à partir d'un document historique",
    oiId: "OI0",
    oiTitre: "Établir des faits",
    oiIcone: "document_search",
    outilEvaluation: "OI0_SO1",
    nb_documents: 1,
    nb_lignes: 2,
    consigne:
      "<p>À partir du document <strong>{{doc_A}}</strong>, établissez un fait historique pertinent.</p>",
  }),
  "1.1": mockOrdreChronologique(),
  "1.2": mockLigneDuTemps(),
  "1.3": mockAvantApres(),
  "3.1": baseRedactionTae({
    comportementId: "3.1",
    comportementEnonce:
      "Indiquer ce qui est différent par rapport à un ou plusieurs objets de comparaison",
    oiId: "OI3",
    oiTitre: "Dégager des différences et des similitudes",
    oiIcone: "text_compare",
    outilEvaluation: "OI3_SO1",
    nb_documents: 1,
    nb_lignes: 3,
    consigne:
      "<p>Indiquez ce qui différencie les éléments présentés dans <strong>{{doc_A}}</strong> de votre objet de comparaison.</p>",
  }),
  "3.2": baseRedactionTae({
    comportementId: "3.2",
    comportementEnonce:
      "Indiquer ce qui est semblable par rapport à un ou plusieurs objets de comparaison",
    oiId: "OI3",
    oiTitre: "Dégager des différences et des similitudes",
    oiIcone: "text_compare",
    outilEvaluation: "OI3_SO2",
    nb_documents: 1,
    nb_lignes: 3,
    consigne:
      "<p>Indiquez les points communs entre les éléments de <strong>{{doc_A}}</strong> et votre objet de comparaison.</p>",
  }),
  "3.3": baseRedactionTae({
    comportementId: "3.3",
    comportementEnonce:
      "Indiquer le point précis sur lequel des acteurs ou des historiens sont en désaccord (divergence)",
    oiId: "OI3",
    oiTitre: "Dégager des différences et des similitudes",
    oiIcone: "text_compare",
    outilEvaluation: "OI3_SO3",
    nb_documents: 2,
    nb_lignes: 3,
    consigne:
      "<p>À partir de <strong>{{doc_A}}</strong> et <strong>{{doc_B}}</strong>, précisez le sujet de désaccord entre les auteurs.</p>",
  }),
  "3.4": baseRedactionTae({
    comportementId: "3.4",
    comportementEnonce:
      "Indiquer le point précis sur lequel des acteurs ou des historiens sont d'accord (convergence)",
    oiId: "OI3",
    oiTitre: "Dégager des différences et des similitudes",
    oiIcone: "text_compare",
    outilEvaluation: "OI3_SO4",
    nb_documents: 2,
    nb_lignes: 3,
    consigne:
      "<p>À partir de <strong>{{doc_A}}</strong> et <strong>{{doc_B}}</strong>, identifiez un point de convergence entre les points de vue.</p>",
  }),
  "3.5": baseRedactionTae({
    comportementId: "3.5",
    comportementEnonce:
      "Montrer des différences et des similitudes par rapport à des points de vue d'acteurs ou à des interprétations d'historiens",
    oiId: "OI3",
    oiTitre: "Dégager des différences et des similitudes",
    oiIcone: "text_compare",
    outilEvaluation: "OI3_SO5",
    nb_documents: 3,
    nb_lignes: 5,
    consigne:
      "<p>Comparez les interprétations présentées dans les documents <strong>{{doc_A}}</strong>, <strong>{{doc_B}}</strong> et <strong>{{doc_C}}</strong>.</p>",
  }),
  "4.1": baseRedactionTae({
    comportementId: "4.1",
    comportementEnonce:
      "Indiquer un facteur explicatif, c.-à-d. un fait qui explique une réalité historique (réponse écrite)",
    oiId: "OI4",
    oiTitre: "Déterminer des causes et des conséquences",
    oiIcone: "manufacturing",
    outilEvaluation: "OI4_SO1",
    nb_documents: 1,
    nb_lignes: 3,
    consigne:
      "<p>Identifiez un facteur explicatif à partir de <strong>{{doc_A}}</strong> pour la réalité historique étudiée.</p>",
  }),
  "4.2": baseRedactionTae({
    comportementId: "4.2",
    comportementEnonce: "Indiquer un fait qui découle d'une réalité historique (réponse écrite)",
    oiId: "OI4",
    oiTitre: "Déterminer des causes et des conséquences",
    oiIcone: "manufacturing",
    outilEvaluation: "OI4_SO2",
    nb_documents: 1,
    nb_lignes: 3,
    consigne:
      "<p>À partir de <strong>{{doc_A}}</strong>, indiquez une conséquence plausible de la réalité historique décrite.</p>",
  }),
  "6.1": baseRedactionTae({
    comportementId: "6.1",
    comportementEnonce: "Indiquer un fait qui montre qu'une réalité historique se transforme",
    oiId: "OI6",
    oiTitre: "Déterminer des changements et des continuités",
    oiIcone: "alt_route",
    outilEvaluation: "OI6_SO1",
    nb_documents: 2,
    nb_lignes: 3,
    consigne:
      "<p>À partir de <strong>{{doc_A}}</strong> et <strong>{{doc_B}}</strong>, citez un fait illustrant une transformation.</p>",
  }),
  "6.2": baseRedactionTae({
    comportementId: "6.2",
    comportementEnonce: "Indiquer un fait qui montre qu'une réalité historique se maintient",
    oiId: "OI6",
    oiTitre: "Déterminer des changements et des continuités",
    oiIcone: "alt_route",
    outilEvaluation: "OI6_SO2",
    nb_documents: 2,
    nb_lignes: 3,
    consigne:
      "<p>À partir de <strong>{{doc_A}}</strong> et <strong>{{doc_B}}</strong>, citez un fait illustrant une continuité.</p>",
  }),
  "6.3": baseRedactionTae({
    comportementId: "6.3",
    comportementEnonce: "Montrer qu'une réalité historique se transforme ou se maintient",
    oiId: "OI6",
    oiTitre: "Déterminer des changements et des continuités",
    oiIcone: "alt_route",
    outilEvaluation: "OI6_SO3",
    nb_documents: 3,
    nb_lignes: 5,
    consigne:
      "<p>À partir des documents <strong>{{doc_A}}</strong>, <strong>{{doc_B}}</strong> et <strong>{{doc_C}}</strong>, montrez transformation ou maintien.</p>",
  }),
  "7.1": baseRedactionTae({
    comportementId: "7.1",
    comportementEnonce: "Exprimer un enchaînement logique qui existe entre des faits",
    oiId: "OI7",
    oiTitre: "Établir des liens de causalité",
    oiIcone: "list",
    outilEvaluation: "OI7_SO1",
    nb_documents: 3,
    nb_lignes: 10,
    consigne:
      "<p>Établissez un enchaînement causal entre les faits présentés dans les documents <strong>{{doc_A}}</strong>, <strong>{{doc_B}}</strong> et <strong>{{doc_C}}</strong>.</p>",
  }),
};

export function getMockTaeFicheForComportement(comportementId: string): TaeFicheData | null {
  return MOCK_TAE_FICHE_BY_COMPORTEMENT_ID[comportementId] ?? null;
}
