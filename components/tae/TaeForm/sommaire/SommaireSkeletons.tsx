/** docs/WORKFLOWS.md §14 — barres skeleton réutilisables. */

export function SkeletonConsigne() {
  return (
    <div className="space-y-2">
      <div className="h-5 w-3/4 rounded bg-border animate-pulse" />
      <div className="h-5 w-full rounded bg-border animate-pulse" />
      <div className="h-5 w-2/3 rounded bg-border animate-pulse" />
    </div>
  );
}

export function SkeletonAspectPills() {
  return (
    <div className="mt-2 flex gap-2">
      <div className="h-5 w-20 rounded-full bg-border animate-pulse" />
      <div className="h-5 w-16 rounded-full bg-border animate-pulse" />
    </div>
  );
}

export function SkeletonCorrigeGuidage() {
  return (
    <div className="mt-2 space-y-1.5">
      <div className="h-3.5 w-full rounded bg-border animate-pulse" />
      <div className="h-3.5 w-4/5 rounded bg-border animate-pulse" />
    </div>
  );
}

export function SkeletonGuidageNarrow() {
  return (
    <div className="mt-2 space-y-1.5">
      <div className="h-3.5 w-full rounded bg-border animate-pulse" />
      <div className="h-3.5 w-3/5 rounded bg-border animate-pulse" />
    </div>
  );
}

/** §14 — documents : 3 barres + image h-16 */
export function SkeletonDocumentsBlock() {
  return (
    <div className="space-y-2">
      <div className="h-3.5 w-full rounded bg-border animate-pulse" />
      <div className="h-3.5 w-5/6 rounded bg-border animate-pulse" />
      <div className="h-3.5 w-4/5 rounded bg-border animate-pulse" />
      <div className="mt-2 h-16 w-full rounded-lg bg-border animate-pulse" />
    </div>
  );
}

export function SkeletonMillerCd() {
  return (
    <div className="ml-2 space-y-2 border-l-2 border-border pl-3">
      <div className="h-3.5 w-full rounded bg-border animate-pulse" />
      <div className="h-3.5 w-[92%] rounded bg-border animate-pulse" />
      <div className="h-3.5 w-4/5 rounded bg-border animate-pulse" />
    </div>
  );
}

export function SkeletonMillerConnaissances() {
  return (
    <div className="ml-2 space-y-2 border-l-2 border-border pl-3">
      <div className="h-3.5 w-full rounded bg-border animate-pulse" />
      <div className="h-3.5 w-full rounded bg-border animate-pulse" />
      <div className="h-3.5 w-[85%] rounded bg-border animate-pulse" />
      <div className="h-3.5 w-3/4 rounded bg-border animate-pulse" />
    </div>
  );
}
