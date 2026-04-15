"use client";

import type { OiEntryJson } from "@/lib/types/oi";

type Props = {
  oiList: OiEntryJson[];
  selectedOiId: string;
  selectedComportementId: string;
  selectedBloc: 3 | 4 | 5;
  showSommaire: boolean;
  onOiChange: (id: string) => void;
  onComportementChange: (id: string) => void;
  onBlocChange: (bloc: 3 | 4 | 5) => void;
  onToggleSommaire: () => void;
};

export function LabControls({
  oiList,
  selectedOiId,
  selectedComportementId,
  selectedBloc,
  showSommaire,
  onOiChange,
  onComportementChange,
  onBlocChange,
  onToggleSommaire,
}: Props) {
  const selectedOi = oiList.find((o) => o.id === selectedOiId);
  const comportements =
    selectedOi?.comportements_attendus.filter(
      (c) => (c.status ?? "active") === "active" && c.nb_documents != null,
    ) ?? [];

  return (
    <div className="flex flex-wrap items-end gap-4">
      {/* Select 1 — OI */}
      <div className="space-y-1">
        <label htmlFor="lab-oi" className="text-xs font-medium text-muted">
          Opération intellectuelle
        </label>
        <select
          id="lab-oi"
          value={selectedOiId}
          onChange={(e) => onOiChange(e.target.value)}
          className="h-10 rounded-md border border-border bg-surface px-3 text-sm text-deep"
        >
          <option value="">Choisir une opération intellectuelle</option>
          {oiList.map((oi) => (
            <option key={oi.id} value={oi.id}>
              {oi.id} — {oi.titre}
            </option>
          ))}
        </select>
      </div>

      {/* Select 2 — Comportement */}
      <div className="space-y-1">
        <label htmlFor="lab-comp" className="text-xs font-medium text-muted">
          Comportement attendu
        </label>
        <select
          id="lab-comp"
          value={selectedComportementId}
          onChange={(e) => onComportementChange(e.target.value)}
          disabled={!selectedOiId}
          className="h-10 rounded-md border border-border bg-surface px-3 text-sm text-deep disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">Choisir un comportement attendu</option>
          {comportements.map((c) => (
            <option key={c.id} value={c.id}>
              {c.id} — {c.enonce.slice(0, 60)}
              {c.enonce.length > 60 ? "…" : ""}
            </option>
          ))}
        </select>
      </div>

      {/* Select 3 — Bloc */}
      <div className="space-y-1">
        <label htmlFor="lab-bloc" className="text-xs font-medium text-muted">
          Bloc
        </label>
        <select
          id="lab-bloc"
          value={selectedBloc}
          onChange={(e) => onBlocChange(Number(e.target.value) as 3 | 4 | 5)}
          disabled={!selectedComportementId}
          className="h-10 rounded-md border border-border bg-surface px-3 text-sm text-deep disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value={3}>Bloc 3 — Consigne</option>
          <option value={4}>Bloc 4 — Documents</option>
          <option value={5}>Bloc 5 — Corrigé</option>
        </select>
      </div>

      {/* Toggle sommaire */}
      <button
        type="button"
        onClick={onToggleSommaire}
        className={`h-10 rounded-md border px-3 text-sm font-medium transition-colors ${
          showSommaire
            ? "border-accent bg-accent/10 text-accent"
            : "border-border bg-surface text-muted hover:text-deep"
        }`}
      >
        {showSommaire ? "Masquer sommaire" : "Afficher sommaire"}
      </button>
    </div>
  );
}
