import type { CSSProperties } from "react";
import { cn } from "@/lib/utils/cn";

export type LimitCounterPillUnit = "words" | "characters";

type Props = {
  current: number;
  max: number;
  /**
   * Tant que `current <= warningAfter` : état neutre.
   * Si `warningAfter < current < max` : rampe d’avertissement (couleur progressive).
   * Si `current >= max` : voir `showDangerAtMax`.
   */
  warningAfter: number;
  unit: LimitCounterPillUnit;
  /**
   * Si `true` (défaut) : `current >= max` → état danger (ex. légende > limite).
   * Si `false` : à `max` on reste en warning fort (ex. champ avec `maxLength`, le plein n’est pas une erreur).
   */
  showDangerAtMax?: boolean;
  className?: string;
  "aria-live"?: "off" | "polite" | "assertive";
};

function warningRampT(current: number, max: number, warningAfter: number): number | null {
  if (current <= warningAfter || current >= max) return null;
  const denom = max - 1 - warningAfter;
  if (denom <= 0) return 1;
  return (current - warningAfter) / denom;
}

function warningMixStyle(t: number): CSSProperties {
  return {
    backgroundColor: `color-mix(in srgb, var(--color-warning) ${10 + t * 22}%, var(--color-panel-alt))`,
    color: `color-mix(in srgb, var(--color-warning) ${38 + t * 52}%, var(--color-muted))`,
    borderColor: `color-mix(in srgb, var(--color-warning) ${18 + t * 42}%, var(--color-border-secondary))`,
  };
}

function ariaLabelFor(current: number, max: number, unit: LimitCounterPillUnit): string {
  if (unit === "words") {
    if (current === 0) return `0 mots sur ${max} maximum`;
    if (current === 1) return `1 mot sur ${max} maximum`;
    return `${current} mots sur ${max} maximum`;
  }
  if (current === 0) return `0 caractères sur ${max} maximum`;
  if (current === 1) return `1 caractère sur ${max} maximum`;
  return `${current} caractères sur ${max} maximum`;
}

/**
 * Pilule « courant / max » pour limites de mots ou de caractères — rampe warning puis danger à `max`.
 * Voir `docs/DESIGN-SYSTEM.md` § Primitives (`components/ui/LimitCounterPill.tsx`).
 */
export function LimitCounterPill({
  current,
  max,
  warningAfter,
  unit,
  showDangerAtMax = true,
  className,
  "aria-live": ariaLive = "polite",
}: Props) {
  const atOrOverMax = current >= max;
  const rampT = atOrOverMax ? null : warningRampT(current, max, warningAfter);
  const inRamp = rampT != null;

  const capAsWarning = atOrOverMax && !showDangerAtMax;
  const pillStyle = capAsWarning
    ? warningMixStyle(1)
    : rampT != null
      ? warningMixStyle(rampT)
      : undefined;

  const pillClassName = cn(
    "inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[12px] font-medium leading-none transition-[background-color,color,border-color] duration-300 ease-out",
    current <= warningAfter &&
      !atOrOverMax &&
      "border-transparent bg-background-secondary text-tertiary",
    inRamp && "border-warning/25",
    capAsWarning && "border-warning/35",
    atOrOverMax &&
      showDangerAtMax &&
      "border-error/35 bg-[color-mix(in_srgb,var(--color-error)_18%,var(--color-panel-alt))] text-error",
    className,
  );

  return (
    <span
      className={pillClassName}
      style={pillStyle}
      aria-label={ariaLabelFor(current, max, unit)}
      aria-live={ariaLive}
    >
      {current} / {max}
    </span>
  );
}
