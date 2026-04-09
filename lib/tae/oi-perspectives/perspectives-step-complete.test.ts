import { describe, it, expect } from "vitest";
import {
  emptyMoment,
  emptyMoments,
  emptyPerspective,
  emptyPerspectives,
  isMomentsStepComplete,
  isPerspectivesStepComplete,
} from "@/lib/tae/oi-perspectives/perspectives-helpers";
import type { MomentData, PerspectiveData } from "@/lib/tae/oi-perspectives/perspectives-types";

const completePerspective = (acteur: string): PerspectiveData => ({
  acteur,
  contenu: "<p>Extrait significatif.</p>",
  source: "<p>Source bibliographique.</p>",
  type: "textuel",
});

const completeMoment = (): MomentData => ({
  titre: "",
  contenu: "<p>État historique avec indices temporels.</p>",
  source: "<p>Source bibliographique.</p>",
});

describe("isPerspectivesStepComplete", () => {
  it("rejette un titre vide", () => {
    const perspectives = [completePerspective("Acteur A"), completePerspective("Acteur B")];
    expect(isPerspectivesStepComplete(perspectives, 2, "")).toBe(false);
    expect(isPerspectivesStepComplete(perspectives, 2, "   ")).toBe(false);
  });

  it("rejette des perspectives null", () => {
    expect(isPerspectivesStepComplete(null, 2, "Titre")).toBe(false);
  });

  it("rejette si moins de perspectives que le count attendu", () => {
    const perspectives = [completePerspective("A")];
    expect(isPerspectivesStepComplete(perspectives, 2, "Titre")).toBe(false);
  });

  it("rejette si une perspective a un acteur vide", () => {
    const perspectives = [completePerspective(""), completePerspective("B")];
    expect(isPerspectivesStepComplete(perspectives, 2, "Titre")).toBe(false);
  });

  it("rejette si une perspective a un contenu vide", () => {
    const perspectives = emptyPerspectives(2);
    perspectives[0] = { ...completePerspective("A"), contenu: "" };
    perspectives[1] = completePerspective("B");
    expect(isPerspectivesStepComplete(perspectives, 2, "Titre")).toBe(false);
  });

  it("rejette si une perspective a une source vide", () => {
    const perspectives = emptyPerspectives(2);
    perspectives[0] = completePerspective("A");
    perspectives[1] = { ...completePerspective("B"), source: "<p></p>" };
    expect(isPerspectivesStepComplete(perspectives, 2, "Titre")).toBe(false);
  });

  it("accepte 2 perspectives complètes (OI3·3.3 / 3.4)", () => {
    const perspectives = [completePerspective("A"), completePerspective("B")];
    expect(isPerspectivesStepComplete(perspectives, 2, "Titre du document")).toBe(true);
  });

  it("accepte 3 perspectives complètes (OI3·3.5)", () => {
    const perspectives = [
      completePerspective("A"),
      completePerspective("B"),
      completePerspective("C"),
    ];
    expect(isPerspectivesStepComplete(perspectives, 3, "Titre")).toBe(true);
  });

  it("ignore une 4e perspective hypothétique au-delà du count", () => {
    const perspectives = [
      completePerspective("A"),
      completePerspective("B"),
      { ...emptyPerspective(), acteur: "" },
    ];
    expect(isPerspectivesStepComplete(perspectives, 2, "Titre")).toBe(true);
  });
});

describe("isMomentsStepComplete", () => {
  it("rejette un titre vide", () => {
    const moments = [completeMoment(), completeMoment()];
    expect(isMomentsStepComplete(moments, 2, "")).toBe(false);
  });

  it("rejette des moments null", () => {
    expect(isMomentsStepComplete(null, 2, "Titre")).toBe(false);
  });

  it("rejette si moins de moments que le count attendu", () => {
    const moments = [completeMoment()];
    expect(isMomentsStepComplete(moments, 2, "Titre")).toBe(false);
  });

  it("rejette si un moment a un contenu vide", () => {
    const moments = emptyMoments(2);
    moments[0] = { ...completeMoment(), contenu: "" };
    moments[1] = completeMoment();
    expect(isMomentsStepComplete(moments, 2, "Titre")).toBe(false);
  });

  it("rejette si un moment a une source vide", () => {
    const moments = emptyMoments(2);
    moments[0] = completeMoment();
    moments[1] = { ...completeMoment(), source: "" };
    expect(isMomentsStepComplete(moments, 2, "Titre")).toBe(false);
  });

  it("accepte 2 moments complets sans titre interne (OI6·6.x)", () => {
    const moments = [completeMoment(), completeMoment()];
    expect(isMomentsStepComplete(moments, 2, "Titre du document")).toBe(true);
  });

  it("accepte 2 moments complets avec titre interne", () => {
    const moments: MomentData[] = [
      { ...completeMoment(), titre: "Avant Utrecht" },
      { ...completeMoment(), titre: "Après Utrecht" },
    ];
    expect(isMomentsStepComplete(moments, 2, "Titre")).toBe(true);
  });

  it("ne plante pas si emptyMoment() est utilisé", () => {
    const moments = [emptyMoment(), emptyMoment()];
    expect(isMomentsStepComplete(moments, 2, "Titre")).toBe(false);
  });
});
