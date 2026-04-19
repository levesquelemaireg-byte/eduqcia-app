import { cn } from "@/lib/utils/cn";

type Props = {
  /** Largeur en pourcentage (ex. "95%"). */
  width?: string;
  className?: string;
};

/**
 * Ligne pulsante grise — zone de contenu non encore renseignée.
 * Styles dans `globals.css` (`.doc-sommaire-skeleton-line`).
 * Spec : SPEC-SOMMAIRE-DOCUMENT §2.10.5.
 */
export function SkeletonLine({ width = "100%", className }: Props) {
  return (
    <span
      aria-hidden="true"
      className={cn("doc-sommaire-skeleton-line", className)}
      style={{ width }}
    />
  );
}

/** Rectangle pulsant — placeholder image iconographique avant upload. */
export function SkeletonRect({ className }: { className?: string }) {
  return <span aria-hidden="true" className={cn("doc-sommaire-skeleton-rect", className)} />;
}
