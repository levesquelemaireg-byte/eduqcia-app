import { describe, expect, it } from "vitest";
import {
  ready,
  skeleton,
  hidden,
  resolveDocPlaceholders,
  createSelector,
} from "@/lib/fiche/helpers";

describe("SectionState constructors", () => {
  it("ready() wraps data with status 'ready'", () => {
    const result = ready({ html: "<p>test</p>" });
    expect(result).toEqual({ status: "ready", data: { html: "<p>test</p>" } });
  });

  it("skeleton() returns status 'skeleton'", () => {
    const result = skeleton();
    expect(result).toEqual({ status: "skeleton" });
  });

  it("hidden() returns status 'hidden'", () => {
    const result = hidden();
    expect(result).toEqual({ status: "hidden" });
  });
});

describe("resolveDocPlaceholders", () => {
  it("replaces {{doc_A}} with 1", () => {
    expect(resolveDocPlaceholders("Voir {{doc_A}}", 1)).toBe("Voir 1");
  });

  it("replaces multiple placeholders", () => {
    const html = "Comparez {{doc_A}} et {{doc_B}}";
    expect(resolveDocPlaceholders(html, 2)).toBe("Comparez 1 et 2");
  });

  it("replaces up to 4 docs", () => {
    const html = "{{doc_A}} {{doc_B}} {{doc_C}} {{doc_D}}";
    expect(resolveDocPlaceholders(html, 4)).toBe("1 2 3 4");
  });

  it("does not replace placeholders beyond nbDocuments", () => {
    const html = "{{doc_A}} {{doc_B}} {{doc_C}}";
    expect(resolveDocPlaceholders(html, 2)).toBe("1 2 {{doc_C}}");
  });

  it("handles zero documents", () => {
    expect(resolveDocPlaceholders("{{doc_A}}", 0)).toBe("{{doc_A}}");
  });

  it("returns empty string for empty input", () => {
    expect(resolveDocPlaceholders("", 2)).toBe("");
  });

  it("convertit un data-doc-ref legacy (lettre) en numéro", () => {
    const html = '<span data-doc-ref="A">Document A</span>';
    expect(resolveDocPlaceholders(html, 1)).toBe("1");
  });

  it("remplace un data-doc-ref numérique par son numéro", () => {
    const html = '<span data-doc-ref="3">Document 3</span>';
    expect(resolveDocPlaceholders(html, 3)).toBe("3");
  });

  it("is case-insensitive for mustache placeholders", () => {
    expect(resolveDocPlaceholders("{{DOC_A}}", 1)).toBe("1");
  });
});

describe("createSelector", () => {
  it("memoizes: same input returns same result reference", () => {
    const sel = createSelector([(state: { x: number }) => state.x], (x) => ({ doubled: x * 2 }));

    const state = { x: 5 };
    const r1 = sel(state);
    const r2 = sel(state);
    expect(r1).toBe(r2); // same reference
    expect(r1).toEqual({ doubled: 10 });
  });

  it("recomputes when input changes", () => {
    const sel = createSelector([(state: { x: number }) => state.x], (x) => ({ doubled: x * 2 }));

    const r1 = sel({ x: 5 });
    const r2 = sel({ x: 10 });
    expect(r1).toEqual({ doubled: 10 });
    expect(r2).toEqual({ doubled: 20 });
    expect(r1).not.toBe(r2);
  });

  it("supports two input selectors", () => {
    const sel = createSelector(
      [(state: { a: number; b: number }) => state.a, (state: { a: number; b: number }) => state.b],
      (a, b) => a + b,
    );

    expect(sel({ a: 3, b: 7 })).toBe(10);
  });

  it("uses shallow compare — same value object triggers recompute", () => {
    let callCount = 0;
    const sel = createSelector([(state: { arr: number[] }) => state.arr], (arr) => {
      callCount++;
      return arr.length;
    });

    const arr = [1, 2, 3];
    sel({ arr });
    sel({ arr }); // same reference → cached
    sel({ arr: [1, 2, 3] }); // new reference → recompute
    expect(callCount).toBe(2);
  });
});
