"use client";

/**
 * Wizard Lab — outil DEV pour visualiser les blocs 3/4/5 par comportement.
 * Route : /dev/wizard-lab — notFound() en production.
 */
import { useCallback, useState } from "react";
import { LabControls } from "@/components/dev/wizard-lab/LabControls";
import { LabMatrix } from "@/components/dev/wizard-lab/LabMatrix";
import { LabBlocViewer } from "@/components/dev/wizard-lab/LabBlocViewer";
import { useOiData } from "@/components/tache/wizard/bloc2/useBloc2Data";
import type { OiEntryJson } from "@/lib/types/oi";

export function WizardLab() {
  const { oiList } = useOiData();

  const [selectedOiId, setSelectedOiId] = useState("");
  const [selectedComportementId, setSelectedComportementId] = useState("");
  const [selectedBloc, setSelectedBloc] = useState<3 | 4 | 5>(3);
  const [showSommaire, setShowSommaire] = useState(false);

  const activeOiList = (oiList ?? []).filter((oi) => oi.status === "active");

  const handleMatrixClick = (comportementId: string) => {
    const oi = activeOiList.find((o) =>
      o.comportements_attendus.some((c) => c.id === comportementId),
    );
    if (oi) {
      setSelectedOiId(oi.id);
      setSelectedComportementId(comportementId);
      setSelectedBloc(3);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-xl font-bold text-deep">Wizard Lab</h1>

      <LabControls
        oiList={activeOiList}
        selectedOiId={selectedOiId}
        selectedComportementId={selectedComportementId}
        selectedBloc={selectedBloc}
        showSommaire={showSommaire}
        onOiChange={(id) => {
          setSelectedOiId(id);
          setSelectedComportementId("");
        }}
        onComportementChange={setSelectedComportementId}
        onBlocChange={setSelectedBloc}
        onToggleSommaire={() => setShowSommaire((v) => !v)}
      />

      <LabMatrix
        oiList={activeOiList}
        selectedComportementId={selectedComportementId}
        onRowClick={handleMatrixClick}
      />

      {selectedComportementId ? (
        <>
          <LabBlocNav
            oiList={activeOiList}
            selectedOiId={selectedOiId}
            selectedComportementId={selectedComportementId}
            selectedBloc={selectedBloc}
            onBlocChange={setSelectedBloc}
          />
          <LabBlocViewer
            comportementId={selectedComportementId}
            bloc={selectedBloc}
            showSommaire={showSommaire}
            oiList={activeOiList}
          />
        </>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Bandeau de navigation entre blocs
// ---------------------------------------------------------------------------

const BLOCS = [3, 4, 5] as const;
const BLOC_LABELS: Record<3 | 4 | 5, string> = {
  3: "Bloc 3 — Consigne",
  4: "Bloc 4 — Documents",
  5: "Bloc 5 — Corrigé",
};

function LabBlocNav({
  oiList,
  selectedOiId,
  selectedComportementId,
  selectedBloc,
  onBlocChange,
}: {
  oiList: OiEntryJson[];
  selectedOiId: string;
  selectedComportementId: string;
  selectedBloc: 3 | 4 | 5;
  onBlocChange: (bloc: 3 | 4 | 5) => void;
}) {
  const oi = oiList.find((o) => o.id === selectedOiId);
  const comp = oi?.comportements_attendus.find((c) => c.id === selectedComportementId);

  const goTo = useCallback(
    (direction: -1 | 1) => {
      const idx = BLOCS.indexOf(selectedBloc);
      const next = BLOCS[idx + direction];
      if (next !== undefined) onBlocChange(next);
    },
    [selectedBloc, onBlocChange],
  );

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-surface px-4 py-3">
      <div className="min-w-0 space-y-0.5">
        <p className="text-xs font-medium text-muted">{oi ? `${oi.id} — ${oi.titre}` : "—"}</p>
        <p className="text-sm font-semibold text-deep">
          {comp ? `${comp.id} — ${comp.enonce}` : "—"}
        </p>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={selectedBloc === 3}
          onClick={() => goTo(-1)}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted hover:bg-panel-alt disabled:cursor-not-allowed disabled:opacity-30"
          aria-label="Bloc précédent"
        >
          <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
            chevron_left
          </span>
        </button>
        {BLOCS.map((b) => (
          <button
            key={b}
            type="button"
            onClick={() => onBlocChange(b)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              b === selectedBloc
                ? "bg-accent text-white"
                : "text-muted hover:bg-panel-alt hover:text-deep"
            }`}
          >
            {BLOC_LABELS[b]}
          </button>
        ))}
        <button
          type="button"
          disabled={selectedBloc === 5}
          onClick={() => goTo(1)}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted hover:bg-panel-alt disabled:cursor-not-allowed disabled:opacity-30"
          aria-label="Bloc suivant"
        >
          <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
            chevron_right
          </span>
        </button>
      </div>
    </div>
  );
}
