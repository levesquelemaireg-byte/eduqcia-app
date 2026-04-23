type Props = {
  numero: number;
};

export function DocumentSlotLockedCard({ numero }: Props) {
  return (
    <div className="rounded-2xl bg-panel-alt/95 px-4 py-4 shadow-sm ring-1 ring-border/45">
      <div className="flex items-start gap-3">
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-panel text-sm font-bold text-muted ring-1 ring-inset ring-border/60"
          aria-hidden="true"
        >
          {numero}
        </span>
        <div className="min-w-0 flex-1 space-y-1.5">
          <p className="text-sm font-semibold text-deep">Document {numero}</p>
          <p className="icon-text text-sm text-muted">
            <span className="material-symbols-outlined text-[1em]" aria-hidden="true">
              lock
            </span>
            <span>Complétez le document précédent pour continuer.</span>
          </p>
        </div>
      </div>
    </div>
  );
}
