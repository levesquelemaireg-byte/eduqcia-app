import { describe, expect, it, vi } from "vitest";
import { emptyDocumentSlot } from "@/lib/tache/document-helpers";
import { initialTacheFormState } from "@/lib/tache/tache-form-state-types";
import type { TacheFormState } from "@/lib/tache/tache-form-state-types";
import type { OiEntryJson } from "@/lib/types/oi";
import type { RendererDocument } from "@/lib/types/document-renderer";
import {
  etatWizardVersTache,
  type GrilleEvaluationEntree,
  type MetaApercu,
} from "./etat-wizard-vers-tache";

/* -------------------------------------------------------------------------- */
/*  Fixtures                                                                  */
/* -------------------------------------------------------------------------- */

const OI_FIXTURE: OiEntryJson[] = [
  {
    id: "OI0",
    titre: "Établir des faits",
    icone: "document_search",
    status: "active",
    comportements_attendus: [
      {
        id: "0.1",
        enonce: "Établir un fait à partir d'un document historique",
        nb_documents: 1,
        nb_lignes: 2,
        outil_evaluation: "OI0_SO1",
      },
    ],
  },
  {
    id: "OI1",
    titre: "Situer dans le temps",
    icone: "hourglass",
    status: "active",
    comportements_attendus: [
      {
        id: "1.1",
        enonce: "Ordonner chronologiquement des faits",
        nb_documents: 4,
        nb_lignes: 0,
        outil_evaluation: "OI1_SO1",
        variant_slug: "ordre-chronologique",
      },
      {
        id: "1.2",
        enonce: "Situer des faits sur une ligne du temps",
        nb_documents: 1,
        nb_lignes: 0,
        outil_evaluation: "OI1_SO2",
        variant_slug: "ligne-du-temps",
      },
      {
        id: "1.3",
        enonce: "Classer des faits avant/après un repère",
        nb_documents: 4,
        nb_lignes: 0,
        outil_evaluation: "OI1_SO3",
        variant_slug: "avant-apres",
      },
    ],
  },
];

const GRILLES_FIXTURE: GrilleEvaluationEntree[] = [
  {
    id: "OI0_SO1",
    oi: "OI0",
    comportement_enonce: "Établir un fait à partir d'un document historique",
    bareme: {
      echelle: [
        { points: 2, label: "2 points", description: "Correctement." },
        { points: 1, label: "1 point", description: "Plus ou moins." },
        { points: 0, label: "0 point", description: "Incorrectement." },
      ],
    },
  },
  {
    id: "OI1_SO1",
    oi: "OI1",
    comportement_enonce: "Ordonner chronologiquement des faits",
    bareme: {
      echelle: [
        { points: 2, label: "2 points", description: "Tous les faits." },
        { points: 0, label: "0 point", description: "Pas tous." },
      ],
    },
  },
];

const META_FIXTURE: MetaApercu = {
  authorFullName: "Marie Tremblay",
  draftStartedAtIso: "2026-04-15T10:00:00Z",
};

/** État minimal pour un parcours rédactionnel OI0 comportement 0.1. */
function etatRedactionnel(): TacheFormState {
  return {
    ...initialTacheFormState,
    bloc1: { modeConception: "seul", collaborateurs: [] },
    bloc2: {
      ...initialTacheFormState.bloc2,
      niveau: "sec1",
      discipline: "hec",
      oiId: "OI0",
      comportementId: "0.1",
      nbLignes: 2,
      nbDocuments: 1,
      outilEvaluation: "OI0_SO1",
      documentSlots: [{ slotId: "doc_1" }],
      blueprintLocked: true,
    },
    bloc3: {
      ...initialTacheFormState.bloc3,
      consigne: "<p>Consigne rédactionnelle.</p>",
      guidage: "<p>Guidage complémentaire.</p>",
    },
    bloc5: {
      ...initialTacheFormState.bloc5,
      corrige: "<p>Réponse attendue.</p>",
      nonRedaction: null,
    },
  };
}

/** État minimal pour un parcours NR ordre chronologique OI1 comportement 1.1. */
function etatOrdreChronologique(): TacheFormState {
  return {
    ...initialTacheFormState,
    bloc1: { modeConception: "seul", collaborateurs: [] },
    bloc2: {
      ...initialTacheFormState.bloc2,
      niveau: "sec2",
      discipline: "hec",
      oiId: "OI1",
      comportementId: "1.1",
      nbLignes: 0,
      nbDocuments: 4,
      outilEvaluation: "OI1_SO1",
      documentSlots: [
        { slotId: "doc_1" },
        { slotId: "doc_2" },
        { slotId: "doc_3" },
        { slotId: "doc_4" },
      ],
      blueprintLocked: true,
    },
    bloc5: {
      ...initialTacheFormState.bloc5,
      nonRedaction: {
        type: "ordre-chronologique",
        payload: {
          consigneTheme: "La Conquête",
          optionA: [1, 2, 3, 4] as const,
          optionB: [2, 1, 4, 3] as const,
          optionC: [4, 3, 2, 1] as const,
          optionD: [3, 4, 1, 2] as const,
          correctLetter: "A" as const,
          optionsJustification: "Ordre correct.",
          manualTieBreakSequence: null,
        },
      },
    },
  };
}

/* -------------------------------------------------------------------------- */
/*  Tests                                                                     */
/* -------------------------------------------------------------------------- */

describe("etatWizardVersTache", () => {
  describe("parcours rédactionnel", () => {
    it("produit une consigne, un guidage structuré et un corrigé", () => {
      const result = etatWizardVersTache(
        etatRedactionnel(),
        OI_FIXTURE,
        GRILLES_FIXTURE,
        META_FIXTURE,
      );

      expect(result.consigne).toBe("<p>Consigne rédactionnelle.</p>");
      expect(result.guidage).toEqual({ content: "<p>Guidage complémentaire.</p>" });
      expect(result.corrige).toBe("<p>Réponse attendue.</p>");
    });

    it("retourne guidage null si le champ est vide", () => {
      const etat = etatRedactionnel();
      etat.bloc3.guidage = "";

      const result = etatWizardVersTache(etat, OI_FIXTURE, GRILLES_FIXTURE);
      expect(result.guidage).toBeNull();
    });

    it("retourne guidage null si le champ est whitespace", () => {
      const etat = etatRedactionnel();
      etat.bloc3.guidage = "   ";

      const result = etatWizardVersTache(etat, OI_FIXTURE, GRILLES_FIXTURE);
      expect(result.guidage).toBeNull();
    });

    it("déduit espaceProduction lignes avec nbLignes", () => {
      const result = etatWizardVersTache(etatRedactionnel(), OI_FIXTURE, GRILLES_FIXTURE);
      expect(result.espaceProduction).toEqual({ type: "lignes", nbLignes: 2 });
    });

    it("utilise 5 lignes par défaut si nbLignes est null", () => {
      const etat = etatRedactionnel();
      etat.bloc2.nbLignes = null;

      const result = etatWizardVersTache(etat, OI_FIXTURE, GRILLES_FIXTURE);
      expect(result.espaceProduction).toEqual({ type: "lignes", nbLignes: 5 });
    });
  });

  describe("parcours NR — ordre chronologique", () => {
    it("déduit espaceProduction cases ABCD", () => {
      const result = etatWizardVersTache(etatOrdreChronologique(), OI_FIXTURE, GRILLES_FIXTURE);
      expect(result.espaceProduction).toEqual({
        type: "cases",
        options: ["A", "B", "C", "D"],
      });
    });

    it("la consigne ne contient aucune ancre HTML", () => {
      const result = etatWizardVersTache(etatOrdreChronologique(), OI_FIXTURE, GRILLES_FIXTURE);
      expect(result.consigne).not.toContain("<!--eduqcia:");
    });

    it("le guidage est structuré (non null pour ordre chrono)", () => {
      const result = etatWizardVersTache(etatOrdreChronologique(), OI_FIXTURE, GRILLES_FIXTURE);
      expect(result.guidage).not.toBeNull();
      expect(result.guidage).toHaveProperty("content");
    });
  });

  describe("résolution outilEvaluation", () => {
    it("résout les critères depuis les grilles", () => {
      const result = etatWizardVersTache(etatRedactionnel(), OI_FIXTURE, GRILLES_FIXTURE);
      expect(result.outilEvaluation.oi).toBe("OI0");
      expect(result.outilEvaluation.criteres).toHaveLength(1);
      expect(result.outilEvaluation.criteres[0].descripteurs).toHaveLength(3);
      expect(result.outilEvaluation.criteres[0].descripteurs[0]).toEqual({
        niveau: "2 points",
        description: "Correctement.",
        points: 2,
      });
    });

    it("retourne redactionnel si outilEvaluation est null", () => {
      const etat = etatRedactionnel();
      etat.bloc2.outilEvaluation = null;

      const result = etatWizardVersTache(etat, OI_FIXTURE, GRILLES_FIXTURE);
      expect(result.outilEvaluation.oi).toBe("redactionnel");
      expect(result.outilEvaluation.criteres).toEqual([]);
    });

    it("retourne redactionnel si la grille est introuvable", () => {
      const result = etatWizardVersTache(etatRedactionnel(), OI_FIXTURE, []);
      expect(result.outilEvaluation.oi).toBe("redactionnel");
    });
  });

  describe("métadonnées", () => {
    it("résout le niveau et la discipline", () => {
      const result = etatWizardVersTache(etatRedactionnel(), OI_FIXTURE, GRILLES_FIXTURE);
      expect(result.niveau.label).toBe("Secondaire 1");
      expect(result.discipline.label).toBe("Histoire et éducation à la citoyenneté");
    });

    it("résout OI et comportement depuis le référentiel", () => {
      const result = etatWizardVersTache(etatRedactionnel(), OI_FIXTURE, GRILLES_FIXTURE);
      expect(result.oi).toEqual({
        id: "OI0",
        titre: "Établir des faits",
        icone: "document_search",
      });
      expect(result.comportement).toEqual({
        id: "0.1",
        enonce: "Établir un fait à partir d'un document historique",
      });
    });

    it("le titre correspond à l'énoncé du comportement", () => {
      const result = etatWizardVersTache(etatRedactionnel(), OI_FIXTURE, GRILLES_FIXTURE);
      expect(result.titre).toBe("Établir un fait à partir d'un document historique");
    });

    it("construit les auteurs avec tri par nom de famille", () => {
      const etat = etatRedactionnel();
      etat.bloc1 = {
        modeConception: "equipe",
        collaborateurs: [{ id: "collab-1", displayName: "Alain Dupont" }],
      };

      const result = etatWizardVersTache(etat, OI_FIXTURE, GRILLES_FIXTURE, META_FIXTURE);
      expect(result.auteurs).toHaveLength(2);
      // Dupont avant Tremblay
      expect(result.auteurs[0].last_name).toBe("Dupont");
      expect(result.auteurs[1].last_name).toBe("Tremblay");
    });

    it("utilise les dates de la meta", () => {
      const result = etatWizardVersTache(
        etatRedactionnel(),
        OI_FIXTURE,
        GRILLES_FIXTURE,
        META_FIXTURE,
      );
      expect(result.created_at).toBe("2026-04-15T10:00:00Z");
      expect(result.updated_at).toBe("2026-04-15T10:00:00Z");
    });

    it("id et auteur_id sont draft par défaut", () => {
      const result = etatWizardVersTache(etatRedactionnel(), OI_FIXTURE, GRILLES_FIXTURE);
      expect(result.id).toBe("draft");
      expect(result.auteur_id).toBe("draft-local");
    });
  });

  describe("documents", () => {
    it("mappe les slots document vers RendererDocument", () => {
      const result = etatWizardVersTache(etatRedactionnel(), OI_FIXTURE, GRILLES_FIXTURE);
      expect(result.documents).toHaveLength(1);
      expect(result.documents[0].id).toBe("doc_1");
      expect(result.documents[0].structure).toBe("simple");
      expect(result.documents[0].elements).toHaveLength(1);
      expect(result.documents[0].elements[0].type).toBeDefined();
    });

    it("utilise le rendererDocument canonique du slot quand il est present", () => {
      const etat = etatRedactionnel();

      const rendererDoc: RendererDocument = {
        id: "doc-canonique",
        titre: "Document canonique",
        structure: "simple",
        elements: [
          {
            id: "el-1",
            type: "textuel",
            contenu: "<p>Texte canonique</p>",
            source: "<p>Source canonique</p>",
            sourceType: "primaire",
            categorieTextuelle: "autre",
          },
        ],
      };

      const slot = emptyDocumentSlot();
      slot.mode = "create";
      slot.rendererDocument = rendererDoc;

      etat.bloc4.documents = { doc_1: slot };

      const result = etatWizardVersTache(etat, OI_FIXTURE, GRILLES_FIXTURE);
      expect(result.documents[0]).toEqual(rendererDoc);
    });

    it("reconstruit un document valide en fallback et journalise un avertissement", () => {
      const etat = etatRedactionnel();

      const slot = emptyDocumentSlot();
      slot.mode = "create";
      slot.type = "textuel";
      slot.titre = "Titre fallback";
      slot.contenu = "<p>Contenu fallback</p>";
      slot.source_citation = "<p>Source fallback</p>";
      slot.source_type = "primaire";
      slot.repere_temporel = "1900";
      slot.categorie_textuelle = "autre";

      etat.bloc4.documents = { doc_1: slot };

      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      try {
        const result = etatWizardVersTache(etat, OI_FIXTURE, GRILLES_FIXTURE);

        expect(warnSpy).toHaveBeenCalledTimes(1);
        expect(warnSpy).toHaveBeenCalledWith(
          "[construireDocuments] Slot doc_1 sans rendererDocument - fallback",
        );
        expect(result.documents[0]).toEqual(
          expect.objectContaining({
            id: "doc_1",
            titre: "Titre fallback",
            structure: "simple",
            repereTemporelDocument: "1900",
          }),
        );
        expect(result.documents[0].elements[0]).toEqual(
          expect.objectContaining({
            type: "textuel",
            contenu: "<p>Contenu fallback</p>",
          }),
        );
      } finally {
        warnSpy.mockRestore();
      }
    });
  });
});
