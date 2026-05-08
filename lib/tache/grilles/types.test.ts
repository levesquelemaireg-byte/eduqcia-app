/**
 * Tests d'invariants sur le référentiel des grilles d'évaluation.
 *
 * Ces invariants garantissent que la chaîne d'impression peut résoudre
 * `comportement_id` → `outil_evaluation` → `GrilleEntry` sans incohérence.
 *
 * Toute défaillance signale un bug d'intégrité dans `public/data/oi.json`
 * ou `public/data/grilles-evaluation.json` à corriger immédiatement.
 */

import { readFileSync } from "fs";
import path from "path";
import { describe, expect, it } from "vitest";
import type { GrilleEntry } from "./types";

type ComportementJson = {
  id: string;
  enonce: string;
  outil_evaluation?: string;
};

type OiJson = {
  id: string;
  status: string;
  comportements_attendus: ComportementJson[];
};

function chargerJson<T>(rel: string): T {
  const raw = readFileSync(path.join(process.cwd(), "public/data", rel), "utf8");
  return JSON.parse(raw) as T;
}

const grilles = chargerJson<GrilleEntry[]>("grilles-evaluation.json");
const oiList = chargerJson<OiJson[]>("oi.json");

describe("Référentiel grilles-evaluation.json", () => {
  it("contient au moins une grille", () => {
    expect(grilles.length).toBeGreaterThan(0);
  });

  it("chaque grille a un id unique", () => {
    const ids = grilles.map((g) => g.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("chaque grille a un bareme.max_points strictement positif", () => {
    for (const g of grilles) {
      expect(g.bareme.max_points, `Grille ${g.id} : max_points doit être > 0`).toBeGreaterThan(0);
    }
  });

  it("bareme.max_points est au moins égal au plus grand échelon (sanity check)", () => {
    // Note : pour les grilles additives (CD1_SCHEMA = 2+3+3=8), max_points est la
    // somme des sections, pas le max d'un seul échelon. L'invariant minimal est
    // que max_points soit ≥ au plus grand échelon individuel.
    for (const g of grilles) {
      const maxEchelon = Math.max(0, ...g.bareme.echelle.map((e) => e.points));
      expect(
        g.bareme.max_points,
        `Grille ${g.id} : max_points (${g.bareme.max_points}) < plus grand échelon (${maxEchelon})`,
      ).toBeGreaterThanOrEqual(maxEchelon);
    }
  });

  it("chaque grille a au moins un échelon dans son barème", () => {
    for (const g of grilles) {
      expect(g.bareme.echelle.length, `Grille ${g.id} : échelle vide`).toBeGreaterThan(0);
    }
  });
});

describe("Invariant intégrité OI ↔ grilles", () => {
  it("chaque comportement actif référence une grille existante", () => {
    const grilleIds = new Set(grilles.map((g) => g.id));
    const orphelins: { comportement: string; outil: string }[] = [];

    for (const oi of oiList) {
      if (oi.status !== "active") continue;
      for (const comp of oi.comportements_attendus) {
        if (!comp.outil_evaluation) continue;
        if (!grilleIds.has(comp.outil_evaluation)) {
          orphelins.push({ comportement: comp.id, outil: comp.outil_evaluation });
        }
      }
    }

    expect(orphelins, `Comportements pointant vers une grille inexistante`).toEqual([]);
  });

  it("chaque comportement actif a un outil_evaluation défini", () => {
    const sansOutil: string[] = [];
    for (const oi of oiList) {
      if (oi.status !== "active") continue;
      for (const comp of oi.comportements_attendus) {
        if (!comp.outil_evaluation) sansOutil.push(comp.id);
      }
    }
    expect(sansOutil, "Comportements actifs sans outil_evaluation").toEqual([]);
  });
});
