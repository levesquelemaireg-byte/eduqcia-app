export const ANNEE_NORMALISEE_MIN = -300_000;

export function anneeNormaliseeMaxAllowed(): number {
  return new Date().getFullYear();
}

export function isAnneeNormaliseeInAllowedRange(value: number): boolean {
  return (
    Number.isInteger(value) && value >= ANNEE_NORMALISEE_MIN && value <= anneeNormaliseeMaxAllowed()
  );
}
