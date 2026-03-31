import type { Database } from "@/lib/types/database";
import type { AspectSocieteKey } from "@/lib/tae/redaction-helpers";

type AspectDb = Database["public"]["Enums"]["aspect_societe"];

/** Clés URL (`economique`, …) → littéraux enum PostgreSQL (`aspect_societe`). */
export const ASPECT_KEY_TO_DB: Record<AspectSocieteKey, AspectDb> = {
  economique: "Économique",
  politique: "Politique",
  social: "Social",
  culturel: "Culturel",
  territorial: "Territorial",
};

const DB_TO_KEY: Record<AspectDb, AspectSocieteKey> = {
  Économique: "economique",
  Politique: "politique",
  Social: "social",
  Culturel: "culturel",
  Territorial: "territorial",
};

const ASPECT_KEYS = Object.keys(ASPECT_KEY_TO_DB) as AspectSocieteKey[];

/** Ordre d’affichage (filtres banque, cases à cocher). */
export const ASPECT_SOCIETE_KEYS: readonly AspectSocieteKey[] = [
  "economique",
  "politique",
  "social",
  "culturel",
  "territorial",
];

/** Parse `aspects=economique,politique` depuis les query params. */
export function parseAspectKeysFromParam(raw: string | undefined): AspectSocieteKey[] {
  if (!raw || !raw.trim()) return [];
  const out: AspectSocieteKey[] = [];
  for (const part of raw.split(",")) {
    const k = part.trim().toLowerCase() as AspectSocieteKey;
    if (ASPECT_KEYS.includes(k)) out.push(k);
  }
  return out;
}

/** `aspects` en query string : une valeur, plusieurs clés séparées par des virgules, ou plusieurs paramètres répétés (cases à cocher). */
export function parseAspectKeysFromSearchParam(
  raw: string | string[] | undefined,
): AspectSocieteKey[] {
  if (raw === undefined) return [];
  const merged = Array.isArray(raw) ? raw.join(",") : raw;
  return parseAspectKeysFromParam(merged);
}

export function aspectKeysToDbValues(keys: AspectSocieteKey[]): AspectDb[] {
  return keys.map((k) => ASPECT_KEY_TO_DB[k]);
}

export function dbAspectToKey(value: AspectDb): AspectSocieteKey {
  return DB_TO_KEY[value];
}
