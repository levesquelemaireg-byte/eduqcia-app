/**
 * FICHE-TACHE.md §15, §20.2 — barres `animate-pulse`, jamais de placeholder textuel.
 */

/** Barres + pills seules (cercle OI géré par le parent). */
export function SkeletonConsigneBody() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="h-6 w-3/4 rounded bg-border" />
      <div className="h-6 w-full rounded bg-border" />
      <div className="h-6 w-2/3 rounded bg-border" />
      <div className="flex flex-wrap gap-2 pt-1">
        <div className="h-5 w-28 rounded-full bg-border" />
        <div className="h-5 w-20 rounded-full bg-border" />
        <div className="h-5 w-24 rounded-full bg-border" />
        <div className="h-5 w-32 rounded-full bg-border" />
      </div>
    </div>
  );
}

export function SkeletonConsigneZone() {
  return (
    <div className="flex gap-6">
      <div
        className="h-10 w-10 shrink-0 rounded-full border-2 border-dashed border-border animate-pulse"
        aria-hidden="true"
      />
      <div className="min-w-0 flex-1">
        <SkeletonConsigneBody />
      </div>
    </div>
  );
}

export function SkeletonCorrigeBlock() {
  return (
    <div className="mt-3 space-y-1.5 animate-pulse">
      <div className="h-3.5 w-full rounded bg-border" />
      <div className="h-3.5 w-4/5 rounded bg-border" />
      <div className="h-3.5 w-3/5 rounded bg-border" />
    </div>
  );
}

export function SkeletonGuidageBlock() {
  return (
    <div className="mt-3 space-y-1.5 animate-pulse">
      <div className="h-3.5 w-full rounded bg-border" />
      <div className="h-3.5 w-3/5 rounded bg-border" />
    </div>
  );
}

export function SkeletonDocumentCard() {
  return (
    <div className="animate-pulse rounded-lg border border-border bg-panel p-4">
      <div className="h-3.5 w-2/3 rounded bg-border" />
      <div className="mt-2 h-3.5 w-full rounded bg-border" />
      <div className="mt-2 h-3.5 w-4/5 rounded bg-border" />
      <div className="mt-3 h-16 w-full rounded bg-border" />
    </div>
  );
}

export function SkeletonDocumentPair() {
  return (
    <div className="space-y-3">
      <SkeletonDocumentCard />
      <div className="animate-pulse rounded-lg border border-border bg-panel p-4">
        <div className="h-3.5 w-1/2 rounded bg-border" />
        <div className="mt-3 flex gap-4">
          <div className="h-16 w-16 shrink-0 rounded-lg bg-border" />
          <div className="h-3.5 flex-1 rounded bg-border" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonCDTree() {
  return (
    <div className="mt-3 space-y-1.5 animate-pulse">
      <div className="h-3.5 w-2/3 rounded bg-border" />
      <div className="ml-4 h-3.5 w-4/5 rounded bg-border" />
      <div className="ml-8 h-3.5 w-3/5 rounded bg-border" />
    </div>
  );
}

export function SkeletonConnaissancesTree() {
  return (
    <div className="mt-3 space-y-2 animate-pulse">
      <div className="h-3.5 w-3/4 rounded bg-border" />
      <div className="ml-4 h-3.5 w-full rounded bg-border" />
      <div className="ml-8 h-3.5 w-5/6 rounded bg-border" />
      <div className="ml-12 h-3.5 w-2/3 rounded bg-border" />
    </div>
  );
}

export function SkeletonFooterLine() {
  return (
    <div className="flex flex-wrap gap-4 animate-pulse">
      <div className="h-3 w-24 rounded bg-border" />
      <div className="h-3 w-28 rounded bg-border" />
      <div className="h-3 w-16 rounded bg-border" />
    </div>
  );
}

/** Sommaire wizard — à côté de l’icône `format_line_spacing`, sans afficher de chiffre par défaut. */
export function SkeletonFooterNbLignes() {
  return (
    <span className="flex items-center gap-1.5" aria-hidden="true">
      <span className="material-symbols-outlined text-[1em] text-muted" aria-hidden="true">
        format_line_spacing
      </span>
      <span className="inline-block h-3 w-12 animate-pulse rounded bg-border" />
    </span>
  );
}
