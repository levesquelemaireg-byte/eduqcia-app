import { readFile } from "fs/promises";
import path from "path";

/** Objet JSON : clés = noms des CSS, valeurs = tableaux d’écoles secondaires (source unique inscription). */
export type CssEcolesMap = Record<string, string[]>;

let cache: CssEcolesMap | null = null;

/** Charge `public/data/css-ecoles.json` (seul fichier pour les selects CSS + école — pas de `css.json`). */
export async function loadCssEcoles(): Promise<CssEcolesMap> {
  if (cache) return cache;
  const filePath = path.join(process.cwd(), "public/data/css-ecoles.json");
  const raw = await readFile(filePath, "utf8");
  const clean = raw.replace(/^\uFEFF/, "");
  cache = JSON.parse(clean) as CssEcolesMap;
  return cache;
}

export function validateCssAndSchool(map: CssEcolesMap, css: string, school: string): boolean {
  if (!(css in map)) return false;
  const schools = map[css];
  return schools.includes(school);
}
