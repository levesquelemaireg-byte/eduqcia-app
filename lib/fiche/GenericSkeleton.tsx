"use client";

/**
 * Skeleton générique — 3 barres shimmer animate-pulse.
 * Utilisé quand une section ne définit pas de skeleton custom.
 */
export function GenericSkeleton() {
  return (
    <div className="animate-pulse space-y-2 py-2">
      <div className="h-3.5 w-3/4 rounded bg-border" />
      <div className="h-3.5 w-full rounded bg-border" />
      <div className="h-3.5 w-2/3 rounded bg-border" />
    </div>
  );
}
