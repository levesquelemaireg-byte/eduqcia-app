/**
 * Squelette animé pour une ligne de liste (titre + métadonnées + bouton).
 * Réutilisé par les fichiers loading.tsx des routes liste (documents, évaluations, tâches).
 */
export function ListItemSkeleton() {
  return (
    <div className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 flex-1 animate-pulse">
        <div className="h-5 w-3/5 rounded bg-border" />
        <div className="mt-2 h-3 w-2/5 rounded bg-border" />
        <div className="mt-1.5 h-3 w-24 rounded bg-border" />
      </div>
      <div className="h-11 w-16 shrink-0 animate-pulse rounded-lg bg-border" />
    </div>
  );
}

export function ListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="mt-6 divide-y divide-border rounded-2xl border border-border bg-panel shadow-sm">
      {Array.from({ length: count }, (_, i) => (
        <ListItemSkeleton key={i} />
      ))}
    </div>
  );
}
