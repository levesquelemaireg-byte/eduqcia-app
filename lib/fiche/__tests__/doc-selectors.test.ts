import { describe, expect, it } from "vitest";
import {
  selectDocHeader,
  selectDocContent,
  selectDocIndexation,
  selectDocFooter,
} from "@/lib/fiche/selectors/doc-selectors";
import type { DocFicheData, SelectorRefs } from "@/lib/fiche/types";
import type { RendererDocument } from "@/lib/types/document-renderer";

const EMPTY_REFS: SelectorRefs = {
  oiList: [],
  grilles: [],
  previewMeta: { authorFullName: "", draftStartedAtIso: "" },
};

function makeTextuelDoc(overrides: Partial<RendererDocument> = {}): RendererDocument {
  return {
    id: "doc-1",
    titre: "Proclamation royale",
    structure: "simple",
    elements: [
      {
        id: "el-1",
        type: "textuel",
        contenu: "<p>Texte du document</p>",
        source: "Archives nationales",
        sourceType: "primaire",
        categorieTextuelle: "documents_officiels",
      },
    ],
    ...overrides,
  };
}

function makeDocFicheData(overrides: Partial<DocFicheData> = {}): DocFicheData {
  return {
    document: makeTextuelDoc(),
    sourceType: "primaire",
    sourceCitation: "<p>Archives nationales</p>",
    niveauLabels: "Secondaire 3",
    disciplineLabels: "Histoire du Québec et du Canada",
    aspectsStr: "Économique, Politique",
    connLabels: "Proclamation royale de 1763",
    authorName: "Jean Tremblay",
    created: "2026-01-15",
    usageCaption: "Utilisé dans 3 tâches publiées",
    isPublished: true,
    ...overrides,
  };
}

describe("selectDocHeader", () => {
  it("returns ready with title and type labels", () => {
    const result = selectDocHeader(makeDocFicheData(), EMPTY_REFS);
    expect(result.status).toBe("ready");
    if (result.status === "ready") {
      expect(result.data.titre).toBe("Proclamation royale");
      expect(result.data.typeLabel).toBe("Textuel");
      expect(result.data.sourceTypeLabel).toBe("Primaire");
    }
  });

  it("detects iconographic type from first element", () => {
    const doc = makeTextuelDoc({
      elements: [
        {
          id: "el-1",
          type: "iconographique",
          imageUrl: "https://example.com/map.png",
          source: "BAnQ",
          sourceType: "secondaire",
          categorieIconographique: "carte",
        },
      ],
    });
    const result = selectDocHeader(makeDocFicheData({ document: doc }), EMPTY_REFS);
    if (result.status === "ready") {
      expect(result.data.typeLabel).toBe("Iconographique");
    }
  });
});

describe("selectDocContent", () => {
  it("returns ready with the full RendererDocument", () => {
    const data = makeDocFicheData();
    const result = selectDocContent(data, EMPTY_REFS);
    expect(result.status).toBe("ready");
    if (result.status === "ready") {
      expect(result.data.document).toBe(data.document);
    }
  });
});

describe("selectDocIndexation", () => {
  it("returns ready with all metadata fields", () => {
    const result = selectDocIndexation(makeDocFicheData(), EMPTY_REFS);
    expect(result.status).toBe("ready");
    if (result.status === "ready") {
      expect(result.data.niveauLabels).toBe("Secondaire 3");
      expect(result.data.disciplineLabels).toBe("Histoire du Québec et du Canada");
      expect(result.data.aspectsStr).toBe("Économique, Politique");
      expect(result.data.connLabels).toBe("Proclamation royale de 1763");
    }
  });

  it("returns null sourceCitationHtml when source is empty", () => {
    const result = selectDocIndexation(makeDocFicheData({ sourceCitation: "" }), EMPTY_REFS);
    if (result.status === "ready") {
      expect(result.data.sourceCitationHtml).toBeNull();
    }
  });

  it("returns sanitized sourceCitationHtml when present", () => {
    const result = selectDocIndexation(makeDocFicheData(), EMPTY_REFS);
    if (result.status === "ready") {
      expect(result.data.sourceCitationHtml).toBeTruthy();
    }
  });
});

describe("selectDocFooter", () => {
  it("returns ready with author, date, usage and published state", () => {
    const result = selectDocFooter(makeDocFicheData(), EMPTY_REFS);
    expect(result.status).toBe("ready");
    if (result.status === "ready") {
      expect(result.data.authorName).toBe("Jean Tremblay");
      expect(result.data.created).toBe("2026-01-15");
      expect(result.data.usageCaption).toBe("Utilisé dans 3 tâches publiées");
      expect(result.data.isPublished).toBe(true);
    }
  });

  it("reflects unpublished state", () => {
    const result = selectDocFooter(makeDocFicheData({ isPublished: false }), EMPTY_REFS);
    if (result.status === "ready") {
      expect(result.data.isPublished).toBe(false);
    }
  });
});
