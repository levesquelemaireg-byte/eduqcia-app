/**
 * Tests unitaires — `SectionOutilEvaluation` délègue à `GrilleEvalTable` avec
 * le viewport impression. Garantit qu'aucun rendu de table ad-hoc n'est
 * réintroduit (régression historique avant le 8 mai 2026).
 */

import { describe, expect, it } from "vitest";
import type { ComponentProps, ReactElement } from "react";
import { SectionOutilEvaluation } from "./outil-evaluation";
import { GrilleEvalTable } from "@/components/tache/grilles/GrilleEvalTable";
import type { GrilleEntry } from "@/lib/tache/grilles/types";

type GrilleEvalTableProps = ComponentProps<typeof GrilleEvalTable>;

const GRILLE_FIXTURE: GrilleEntry = {
  id: "OI7_SO1",
  operation: "Établir des liens de causalité",
  comportement_enonce: "Exprimer un enchaînement logique qui existe entre des faits",
  bareme: {
    max_points: 3,
    echelle: [
      { points: 3, label: "3 points", description: "..." },
      { points: 2, label: "2 points", description: "..." },
      { points: 1, label: "1 point", description: "..." },
      { points: 0, label: "0 point", description: "..." },
    ],
  },
};

describe("SectionOutilEvaluation", () => {
  it("retourne null lorsque outilEvaluation est null (bord wizard incomplet)", () => {
    const result = SectionOutilEvaluation({ outilEvaluation: null });
    expect(result).toBeNull();
  });

  it("délègue à GrilleEvalTable avec viewport=compact (impression)", () => {
    const result = SectionOutilEvaluation({
      outilEvaluation: GRILLE_FIXTURE,
    }) as ReactElement<GrilleEvalTableProps>;
    expect(result).not.toBeNull();
    expect(result.type).toBe(GrilleEvalTable);
    expect(result.props).toMatchObject({
      entry: GRILLE_FIXTURE,
      outilEvaluationId: GRILLE_FIXTURE.id,
      viewport: "compact",
    });
  });

  it("propage la GrilleEntry intacte sans transformation", () => {
    const result = SectionOutilEvaluation({
      outilEvaluation: GRILLE_FIXTURE,
    }) as ReactElement<GrilleEvalTableProps>;
    expect(result.props.entry).toBe(GRILLE_FIXTURE);
  });
});
