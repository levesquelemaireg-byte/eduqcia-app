import { describe, expect, it } from "vitest";
import { buildPublishPayload } from "@/lib/tache/publish-tache-payload";
import type { DocumentSlotData } from "@/lib/tache/document-helpers";
import { emptyDocumentSlot } from "@/lib/tache/document-helpers";
import {
  initialAvantApresPayload,
  runAvantApresGeneration,
} from "@/lib/tache/non-redaction/avant-apres-payload";
import { initialTacheFormState } from "@/lib/tache/tache-form-state-types";
import type { TacheFormState } from "@/lib/tache/tache-form-state-types";

const ctx = {
  niveauId: 10,
  disciplineId: 20,
  cdId: 30 as number | null,
  connIds: [100, 101],
};

function avantApresFourDocSlots(): Record<string, DocumentSlotData> {
  const d = (y: number): DocumentSlotData => ({
    ...emptyDocumentSlot(),
    mode: "create",
    type: "textuel",
    titre: "t",
    contenu: "<p>c</p>",
    source_citation: "s",
    source_type: "secondaire",
    repere_temporel: String(y),
    annee_normalisee: y,
  });
  return {
    doc_1: d(1900),
    doc_2: d(1910),
    doc_3: d(1920),
    doc_4: d(1930),
  };
}

function assertPayload(
  r: ReturnType<typeof buildPublishPayload>,
): asserts r is Exclude<typeof r, { error: string }> {
  expect(r).not.toHaveProperty("error");
}

describe("buildPublishPayload", () => {
  it("sans slots : documents_new et slots vides", () => {
    const state = structuredClone(initialTacheFormState) as TacheFormState;
    state.bloc2.documentSlots = [];
    const r = buildPublishPayload("auteur-uuid", state, ctx);
    assertPayload(r);
    expect(r.documents_new).toEqual([]);
    expect(r.slots).toEqual([]);
    expect(r.auteur_id).toBe("auteur-uuid");
    expect(r.tache.niveau_id).toBe(10);
    expect(r.tache.discipline_id).toBe(20);
    expect(r.tache.cd_id).toBe(30);
    expect(r.tache.connaissances_ids).toEqual([100, 101]);
    expect(r.collaborateurs_user_ids).toEqual([]);
    expect(r.tache).not.toHaveProperty("non_redaction_data");
  });

  it("slot idle → validation", () => {
    const state = structuredClone(initialTacheFormState) as TacheFormState;
    state.bloc2.documentSlots = [{ slotId: "doc_1" }];
    const r = buildPublishPayload("u", state, ctx);
    expect(r).toEqual({ error: "validation" });
  });

  it("reuse sans document_id → validation", () => {
    const state = structuredClone(initialTacheFormState) as TacheFormState;
    state.bloc2.documentSlots = [{ slotId: "doc_1" }];
    const slot: DocumentSlotData = {
      ...emptyDocumentSlot(),
      mode: "reuse",
      source_document_id: null,
    };
    state.bloc4.documents = { doc_1: slot };
    const r = buildPublishPayload("u", state, ctx);
    expect(r).toEqual({ error: "validation" });
  });

  it("reuse avec document_id", () => {
    const state = structuredClone(initialTacheFormState) as TacheFormState;
    state.bloc2.documentSlots = [{ slotId: "doc_2" }];
    state.bloc4.documents = {
      doc_2: {
        ...emptyDocumentSlot(),
        mode: "reuse",
        source_document_id: "doc-existing-uuid",
      },
    };
    const r = buildPublishPayload("u", state, ctx);
    assertPayload(r);
    expect(r.documents_new).toEqual([]);
    expect(r.slots).toEqual([
      {
        slot: "doc_2",
        ordre: 0,
        mode: "reuse",
        document_id: "doc-existing-uuid",
      },
    ]);
  });

  it("create textuel : trim titre et source_citation", () => {
    const state = structuredClone(initialTacheFormState) as TacheFormState;
    const auteurId = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
    const collabId = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb";
    state.bloc2.oiId = "oi1";
    state.bloc2.comportementId = "c1";
    state.bloc2.nbLignes = 5;
    state.bloc1.modeConception = "equipe";
    state.bloc1.collaborateurs = [{ id: collabId, displayName: "Collègue test" }];
    state.bloc3.consigne = "<p>C</p>";
    state.bloc3.guidage = "g";
    state.bloc5.corrige = "<p>K</p>";
    state.bloc7.aspects.economique = true;
    state.bloc2.documentSlots = [{ slotId: "doc_1" }];
    state.bloc4.documents = {
      doc_1: {
        ...emptyDocumentSlot(),
        mode: "create",
        type: "textuel",
        titre: "  Titre  ",
        contenu: "<p>Corps</p>",
        source_citation: "  Source  ",
      },
    };
    const r = buildPublishPayload(auteurId, state, ctx);
    assertPayload(r);
    expect(r.tache.conception_mode).toBe("equipe");
    expect(r.collaborateurs_user_ids).toEqual([collabId]);
    expect(r.tache.aspects_societe).toEqual(["Économique"]);
    expect(r.documents_new[0]).toMatchObject({
      titre: "Titre",
      type: "textuel",
      niveaux_ids: [10],
      disciplines_ids: [20],
      connaissances_ids: [100, 101],
      repere_temporel: null,
      annee_normalisee: null,
    });
    expect(r.documents_new[0].elements[0]).toMatchObject({
      contenu: "<p>Corps</p>",
      source_citation: "Source",
      source_type: "secondaire",
    });
    expect(r.slots[0]).toMatchObject({
      slot: "doc_1",
      ordre: 0,
      mode: "create",
      newIndex: 0,
    });
  });

  it("équipe sans collaborateur profil → validation", () => {
    const state = structuredClone(initialTacheFormState) as TacheFormState;
    state.bloc1.modeConception = "equipe";
    state.bloc1.collaborateurs = [];
    state.bloc2.documentSlots = [{ slotId: "doc_1" }];
    state.bloc4.documents = {
      doc_1: {
        ...emptyDocumentSlot(),
        mode: "create",
        type: "textuel",
        titre: "T",
        contenu: "<p>x</p>",
        source_citation: "S",
      },
    };
    const r = buildPublishPayload("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", state, ctx);
    expect(r).toEqual({ error: "validation" });
  });

  it("iconographique : URL non http(s) → document_image", () => {
    const state = structuredClone(initialTacheFormState) as TacheFormState;
    state.bloc2.documentSlots = [{ slotId: "doc_1" }];
    state.bloc4.documents = {
      doc_1: {
        ...emptyDocumentSlot(),
        mode: "create",
        type: "iconographique",
        titre: "T",
        source_citation: "S",
        imageUrl: "blob:http://local/x",
      },
    };
    const r = buildPublishPayload("u", state, ctx);
    expect(r).toEqual({ error: "document_image" });
  });

  it("iconographique : https accepté", () => {
    const state = structuredClone(initialTacheFormState) as TacheFormState;
    state.bloc2.documentSlots = [{ slotId: "doc_1" }];
    state.bloc4.documents = {
      doc_1: {
        ...emptyDocumentSlot(),
        mode: "create",
        type: "iconographique",
        titre: "T",
        source_citation: "S",
        imageUrl: "https://example.com/x.png",
      },
    };
    const r = buildPublishPayload("u", state, ctx);
    assertPayload(r);
    const el = r.documents_new[0].elements[0];
    expect(el.image_url).toBe("https://example.com/x.png");
    expect(el.contenu).toBeNull();
    expect(el.source_type).toBe("secondaire");
  });

  it("create : source primaire et légende dans le payload iconographique", () => {
    const state = structuredClone(initialTacheFormState) as TacheFormState;
    state.bloc2.documentSlots = [{ slotId: "doc_1" }];
    state.bloc4.documents = {
      doc_1: {
        ...emptyDocumentSlot(),
        mode: "create",
        type: "iconographique",
        titre: "Carte",
        source_citation: "Source",
        imageUrl: "https://example.com/map.png",
        source_type: "primaire",
        image_legende: "Légende courte",
        image_legende_position: "bas_droite",
      },
    };
    const r = buildPublishPayload("u", state, ctx);
    assertPayload(r);
    expect(r.documents_new[0].elements[0]).toMatchObject({
      source_type: "primaire",
      image_legende: "Légende courte",
      image_legende_position: "bas_droite",
    });
  });

  it("avant-après sans options générées : non_redaction_data null", () => {
    const state = structuredClone(initialTacheFormState) as TacheFormState;
    state.bloc1.modeConception = "seul";
    state.bloc2.oiId = "OI1";
    state.bloc2.comportementId = "1.3";
    state.bloc2.nbLignes = 0;
    state.bloc2.nbDocuments = 4;
    state.bloc2.documentSlots = [
      { slotId: "doc_1" },
      { slotId: "doc_2" },
      { slotId: "doc_3" },
      { slotId: "doc_4" },
    ];
    state.bloc4.documents = avantApresFourDocSlots();
    state.bloc7.aspects.economique = true;
    state.bloc5.nonRedaction = {
      type: "avant-apres",
      payload: { ...initialAvantApresPayload(), theme: "Thème", repere: "Repère" },
    };
    const r = buildPublishPayload("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", state, ctx);
    assertPayload(r);
    expect(r.tache.non_redaction_data).toBeNull();
  });

  it("avant-après complet : non_redaction_data union typée", () => {
    const state = structuredClone(initialTacheFormState) as TacheFormState;
    state.bloc1.modeConception = "seul";
    state.bloc2.oiId = "OI1";
    state.bloc2.comportementId = "1.3";
    state.bloc2.nbLignes = 0;
    state.bloc2.nbDocuments = 4;
    state.bloc2.documentSlots = [
      { slotId: "doc_1" },
      { slotId: "doc_2" },
      { slotId: "doc_3" },
      { slotId: "doc_4" },
    ];
    state.bloc4.documents = avantApresFourDocSlots();
    state.bloc7.aspects.economique = true;

    const base = {
      ...initialAvantApresPayload(),
      theme: "Thème",
      repere: "Repère",
      anneeRepere: 1915,
    };
    let i = 0;
    const seq = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.11, 0.12, 0.13];
    const rng = () => {
      const v = seq[i] ?? 0.5;
      i += 1;
      return v;
    };
    const gen = runAvantApresGeneration(
      base,
      ["doc_1", "doc_2", "doc_3", "doc_4"],
      state.bloc4.documents,
      rng,
    );
    expect(gen.errorCode).toBeNull();

    state.bloc5.nonRedaction = { type: "avant-apres", payload: gen.payload };

    const r = buildPublishPayload("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", state, ctx);
    assertPayload(r);
    expect(r.tache.non_redaction_data).toEqual(
      expect.objectContaining({
        type: "avant-apres",
        payload: expect.objectContaining({
          theme: "Thème",
          repere: "Repère",
          anneeRepere: 1915,
          generated: true,
        }),
      }),
    );
  });
});
