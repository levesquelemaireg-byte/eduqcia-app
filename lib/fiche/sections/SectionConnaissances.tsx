"use client";

import type { ConnaissancesData } from "@/lib/fiche/types";
import type { FicheMode } from "@/lib/fiche/types";
import type { ConnaissanceSelection } from "@/lib/types/fiche";
import { ConnaissanceRemoveButton } from "@/components/tae/fiche/ConnaissanceRemoveButton";
import { SectionLabel } from "@/lib/fiche/primitives/SectionLabel";
import { FICHE_SECTION_BODY_INSET } from "@/lib/ui/fiche-layout";

type Props = {
  data: ConnaissancesData;
  mode: FicheMode;
  /** Wizard sommaire : retrait par ligne (rowId présent sur les items brouillon). */
  onRemoveRow?: (rowId: string) => void;
};

/* ─── Helpers internes ──────────────────────────────────────────── */

function rowIdFromConn(conn: ConnaissanceSelection): string | null {
  const r = conn as ConnaissanceSelection & { rowId?: string };
  return typeof r.rowId === "string" && r.rowId.length > 0 ? r.rowId : null;
}

type ConnGroup = {
  key: string;
  realite_sociale: string;
  section: string;
  sous_section: string | null;
  items: ConnaissanceSelection[];
};

function groupConnaissances(list: ConnaissanceSelection[]): ConnGroup[] {
  const map = new Map<string, ConnGroup>();
  for (const c of list) {
    const k = `${c.realite_sociale}\0${c.section}\0${c.sous_section ?? ""}`;
    let g = map.get(k);
    if (!g) {
      g = {
        key: k,
        realite_sociale: c.realite_sociale,
        section: c.section,
        sous_section: c.sous_section,
        items: [],
      };
      map.set(k, g);
    }
    g.items.push(c);
  }
  return [...map.values()];
}

function EnonceBlock({
  conn,
  onRemoveRow,
}: {
  conn: ConnaissanceSelection;
  onRemoveRow?: (rowId: string) => void;
}) {
  const rowId = rowIdFromConn(conn);
  const body = <p className="text-sm font-medium text-deep">{conn.enonce}</p>;

  if (onRemoveRow && rowId) {
    return (
      <div className="relative rounded-md p-3 pr-11 transition-colors has-[.connaissance-remove-trigger:hover]:bg-surface/55 sm:p-3.5 sm:pr-12">
        <div className="absolute right-2 top-2 z-1 sm:right-2.5 sm:top-2.5">
          <ConnaissanceRemoveButton onClick={() => onRemoveRow(rowId)} />
        </div>
        <div className="min-w-0">{body}</div>
      </div>
    );
  }

  return body;
}

/* ─── Composant principal ──────────────────────────────────────── */

/** Connaissances relatives — arbre hiérarchique groupé. */
export function SectionConnaissances({ data, mode: _mode, onRemoveRow }: Props) {
  const groups = groupConnaissances(data.connaissances);

  return (
    <section className="px-5 pt-4 pb-4">
      <SectionLabel icon="lightbulb">Connaissances</SectionLabel>

      <div className={`${FICHE_SECTION_BODY_INSET} space-y-3`}>
        {groups.map((g) => (
          <div key={g.key} className="space-y-0.5">
            <p className="text-sm font-semibold text-deep">{g.realite_sociale}</p>
            <div className="ml-4 border-l border-border pl-3">
              <p className="text-sm text-steel">{g.section}</p>
              {g.sous_section ? (
                <div className="mt-0.5 ml-4 border-l border-border pl-3">
                  <p className="text-sm text-steel">{g.sous_section}</p>
                  <div className="mt-0.5 ml-4 space-y-2 border-l border-border pl-3">
                    {g.items.map((conn, i) => (
                      <EnonceBlock
                        key={rowIdFromConn(conn) ?? `${g.key}-${i}`}
                        conn={conn}
                        onRemoveRow={onRemoveRow}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mt-0.5 ml-4 space-y-2 border-l border-border pl-3">
                  {g.items.map((conn, i) => (
                    <EnonceBlock
                      key={rowIdFromConn(conn) ?? `${g.key}-${i}`}
                      conn={conn}
                      onRemoveRow={onRemoveRow}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
