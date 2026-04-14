/**
 * Squelette animé pour les en-têtes de page (titre + sous-titre + CTA).
 * Réutilisé par les fichiers loading.tsx des routes principales.
 */
export function PageHeaderSkeleton({ showSubtitle = true }: { showSubtitle?: boolean }) {
  return (
    <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="animate-pulse">
        <div className="h-8 w-64 rounded bg-border" />
        {showSubtitle && <div className="mt-2 h-4 w-80 rounded bg-border" />}
      </div>
      <div className="h-11 w-40 shrink-0 animate-pulse rounded-lg bg-border" />
    </div>
  );
}
