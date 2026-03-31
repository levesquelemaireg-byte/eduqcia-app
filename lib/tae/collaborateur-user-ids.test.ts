import { describe, expect, it } from "vitest";
import {
  buildCollaborateursUserIdsForPayload,
  isProfileCollaborateurId,
} from "@/lib/tae/collaborateur-user-ids";
import { initialTaeFormState } from "@/lib/tae/tae-form-state-types";
import type { TaeFormState } from "@/lib/tae/tae-form-state-types";

const AUTEUR = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
const C1 = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb";
const C2 = "cccccccc-cccc-cccc-cccc-cccccccccccc";

describe("collaborateur-user-ids", () => {
  it("rejette local-* et accepte UUID", () => {
    expect(isProfileCollaborateurId("local-1")).toBe(false);
    expect(isProfileCollaborateurId(C1)).toBe(true);
  });

  it("mode seul → ids vides", () => {
    const state = structuredClone(initialTaeFormState) as TaeFormState;
    state.bloc1.modeConception = "seul";
    state.bloc1.collaborateurs = [{ id: C1, displayName: "x" }];
    expect(buildCollaborateursUserIdsForPayload(state, AUTEUR)).toEqual({ ok: true, ids: [] });
  });

  it("équipe : déduplique et exclut auteur", () => {
    const state = structuredClone(initialTaeFormState) as TaeFormState;
    state.bloc1.modeConception = "equipe";
    state.bloc1.collaborateurs = [
      { id: C1, displayName: "A" },
      { id: C1, displayName: "A" },
      { id: AUTEUR, displayName: "Moi" },
      { id: C2, displayName: "B" },
    ];
    expect(buildCollaborateursUserIdsForPayload(state, AUTEUR)).toEqual({
      ok: true,
      ids: [C1, C2],
    });
  });

  it("équipe sans UUID valide → échec", () => {
    const state = structuredClone(initialTaeFormState) as TaeFormState;
    state.bloc1.modeConception = "equipe";
    state.bloc1.collaborateurs = [{ id: "local-x", displayName: "x" }];
    expect(buildCollaborateursUserIdsForPayload(state, AUTEUR)).toEqual({ ok: false });
  });
});
