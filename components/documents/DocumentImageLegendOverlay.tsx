import type { DocumentLegendPosition } from "@/lib/tache/document-helpers";
import { cn } from "@/lib/utils/cn";
import styles from "@/components/documents/document-image-legend-overlay.module.css";

const POSITION_CLASS: Record<DocumentLegendPosition, string> = {
  haut_gauche: styles.posHautGauche,
  haut_droite: styles.posHautDroite,
  bas_gauche: styles.posBasGauche,
  bas_droite: styles.posBasDroite,
};

type Props = {
  text: string;
  position: DocumentLegendPosition;
  className?: string;
  /** Vignette sommaire (DocumentCard) — bandeau plus petit. */
  compact?: boolean;
};

/** Superposition légende sur figure iconographique — DECISIONS § Étape 4 / FEATURES §5.6. */
export function DocumentImageLegendOverlay({ text, position, className, compact }: Props) {
  return (
    <div
      role="note"
      className={cn(
        styles.overlay,
        compact && styles.overlayCompact,
        POSITION_CLASS[position],
        className,
      )}
    >
      {text}
    </div>
  );
}
