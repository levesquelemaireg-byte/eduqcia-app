"use client";

import { useCallback, useEffect, useState } from "react";
import type { OiEntryJson } from "@/lib/types/oi";
import { getWizardBlocConfig } from "@/lib/tae/wizard-bloc-config";
import { getVariantSlugForComportementId } from "@/lib/tae/non-redaction/registry";

const STORAGE_KEY = "wizard-lab-matrix";

type CheckState = Record<string, Record<string, boolean>>;

function resolveLabel(comportementId: string, bloc: 3 | 4 | 5): string {
  const slug = getVariantSlugForComportementId(comportementId);
  if (slug) {
    const labels: Record<string, string> = {
      "ordre-chronologique": "OrdreChronologique",
      "ligne-du-temps": "LigneDuTemps",
      "avant-apres": "AvantApres",
    };
    return labels[slug] ?? slug;
  }

  const config = getWizardBlocConfig(comportementId);
  if (!config) return "Standard";

  if (bloc === 3) {
    switch (config.bloc3.type) {
      case "modele_souple": return "ModeleSouple";
      case "structure": return "Structure";
      case "pur": return `Pur (${config.bloc3.variante})`;
    }
  }
  if (bloc === 4) {
    switch (config.bloc4.type) {
      case "standard": return "Standard";
      case "perspectives": return `Perspectives (${config.bloc4.count})`;
      case "moments": return "Moments";
    }
  }
  if (bloc === 5) {
    if (config.bloc5?.type === "intrus") return "Intrus";
    if (config.bloc5?.type === "redactionnel") return `Rédactionnel (${config.bloc5.templateKey})`;
    return "Rédactionnel";
  }
  return "Standard";
}

type Props = {
  oiList: OiEntryJson[];
  selectedComportementId: string;
  onRowClick: (comportementId: string) => void;
};

export function LabMatrix({ oiList, selectedComportementId, onRowClick }: Props) {
  const [checks, setChecks] = useState<CheckState>(() => {
    if (typeof window === "undefined") return {};
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? (JSON.parse(stored) as CheckState) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(checks));
    } catch {
      /* quota */
    }
  }, [checks]);

  const toggleCheck = useCallback((comportementId: string, bloc: string) => {
    setChecks((prev) => {
      const row = prev[comportementId] ?? {};
      return { ...prev, [comportementId]: { ...row, [bloc]: !row[bloc] } };
    });
  }, []);

  const isChecked = (comportementId: string, bloc: string): boolean =>
    checks[comportementId]?.[bloc] ?? false;

  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border bg-panel-alt">
            <th className="px-3 py-2 text-left font-semibold text-deep">Comportement</th>
            <th className="px-3 py-2 text-left font-semibold text-deep">Bloc 3</th>
            <th className="px-3 py-2 text-left font-semibold text-deep">Bloc 4</th>
            <th className="px-3 py-2 text-left font-semibold text-deep">Bloc 5</th>
          </tr>
        </thead>
        <tbody>
          {oiList.map((oi) =>
            oi.comportements_attendus
              .filter((c) => (c.status ?? "active") === "active" && c.nb_documents != null)
              .map((c) => {
                const isSelected = c.id === selectedComportementId;
                return (
                  <tr
                    key={c.id}
                    onClick={() => onRowClick(c.id)}
                    className={`cursor-pointer border-b border-border transition-colors hover:bg-panel-alt ${
                      isSelected ? "bg-accent/5" : ""
                    }`}
                  >
                    <td className="px-3 py-2 font-medium text-deep">
                      <span className="text-muted">{oi.id}</span>{" "}
                      {c.id} — {c.enonce.slice(0, 50)}{c.enonce.length > 50 ? "…" : ""}
                    </td>
                    {(["bloc3", "bloc4", "bloc5"] as const).map((bloc, i) => {
                      const checked = isChecked(c.id, bloc);
                      const label = resolveLabel(c.id, (i + 3) as 3 | 4 | 5);
                      return (
                        <td
                          key={bloc}
                          className={`px-3 py-2 ${checked ? "bg-success/10 text-success" : "text-muted"}`}
                        >
                          <label className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleCheck(c.id, bloc)}
                              className="accent-success"
                            />
                            {label}
                          </label>
                        </td>
                      );
                    })}
                  </tr>
                );
              }),
          )}
        </tbody>
      </table>
    </div>
  );
}
