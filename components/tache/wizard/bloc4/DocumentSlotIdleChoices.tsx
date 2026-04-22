type Props = {
  onPickCreate: () => void;
  onPickBanque: () => void;
};

export function DocumentSlotIdleChoices({ onPickCreate, onPickBanque }: Props) {
  return (
    <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 sm:gap-4 sm:p-5">
      <button
        type="button"
        onClick={onPickCreate}
        className="group flex flex-col items-center gap-3 rounded-xl bg-panel p-5 text-center shadow-sm ring-1 ring-border/50 transition-all hover:bg-accent/4 hover:ring-accent/35 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <span
          className="material-symbols-outlined text-[2em] text-accent transition-transform group-hover:scale-105"
          aria-hidden="true"
        >
          add_circle
        </span>
        <div>
          <p className="text-sm font-semibold text-deep">Créer un nouveau document</p>
          <p className="mt-1 text-xs text-muted">Saisir le contenu directement</p>
        </div>
      </button>
      <button
        type="button"
        onClick={onPickBanque}
        className="group flex flex-col items-center gap-3 rounded-xl bg-panel p-5 text-center shadow-sm ring-1 ring-border/50 transition-all hover:bg-accent/4 hover:ring-accent/35 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <span
          className="material-symbols-outlined text-[2em] text-accent transition-transform group-hover:scale-105"
          aria-hidden="true"
        >
          search
        </span>
        <div>
          <p className="text-sm font-semibold text-deep">Réutiliser depuis la banque</p>
          <p className="mt-1 text-xs text-muted">Choisir un document existant</p>
        </div>
      </button>
    </div>
  );
}
