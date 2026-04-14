/**
 * Seed des tables `css` et `schools` depuis les CSV du MEQ.
 * Sources : public/data/raw/css-quebec.csv, public/data/raw/ecoles-publiques-quebec.csv
 * Encodage : UTF-8 avec BOM.
 *
 * Usage : npm run seed:schools
 */

import { readFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";

// ---------------------------------------------------------------------------
// Env
// ---------------------------------------------------------------------------

function loadEnvLocal(): void {
  const p = resolve(process.cwd(), ".env.local");
  if (!existsSync(p)) {
    console.warn("Avertissement : .env.local introuvable.");
    return;
  }
  for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

loadEnvLocal();

function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requis (voir .env.local).",
    );
  }
  return createClient<Database>(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// ---------------------------------------------------------------------------
// CSV parsing
// ---------------------------------------------------------------------------

function stripBom(text: string): string {
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}

/** Minimal CSV parser — handles quoted fields with commas inside. */
function parseCsv(raw: string): Record<string, string>[] {
  const text = stripBom(raw).replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lines = text.split("\n");
  if (lines.length < 2) return [];

  const headers = parseCsvLine(lines[0]);
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = parseCsvLine(line);
    const row: Record<string, string> = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = (values[j] ?? "").trim();
    }
    rows.push(row);
  }
  return rows;
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        result.push(current);
        current = "";
      } else {
        current += ch;
      }
    }
  }
  result.push(current);
  return result;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type CssType = "Franco" | "Anglo" | "Statut";

interface CssRow {
  gov_id: string;
  nom_officiel: string;
  nom_court: string;
  type_cs: CssType;
}

interface SchoolRow {
  gov_id: string;
  nom_officiel: string;
  css_gov_id: string;
}

interface SeedLog {
  date: string;
  css: { inserted: number; updated: number; deactivated: number };
  schools: { inserted: number; updated: number; deactivated: number; skipped: number };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const supabase = createServiceClient();
  const log: SeedLog = {
    date: new Date().toISOString(),
    css: { inserted: 0, updated: 0, deactivated: 0 },
    schools: { inserted: 0, updated: 0, deactivated: 0, skipped: 0 },
  };

  // --- Parse CSS CSV ---
  const cssPath = resolve(process.cwd(), "public/data/raw/css-quebec.csv");
  const cssRaw = readFileSync(cssPath, "utf8");
  const cssRows = parseCsv(cssRaw);
  console.log(`CSV css-quebec.csv : ${cssRows.length} lignes lues`);

  const cssParsed: CssRow[] = cssRows.map((r) => ({
    gov_id: r["CD_ORGNS"],
    nom_officiel: r["NOM_OFFCL"],
    nom_court: r["NOM_COURT"],
    type_cs: r["TYPE_CS"] as CssType,
  }));

  // --- Upsert CSS ---
  const cssGovIdToUuid = new Map<string, string>();

  // Load existing CSS to detect inserts vs updates
  const { data: existingCss } = await supabase
    .from("css")
    .select("id, gov_id, nom_officiel, nom_court, type_cs, is_active");

  const existingCssMap = new Map((existingCss ?? []).map((c) => [c.gov_id, c]));

  for (const css of cssParsed) {
    if (!css.gov_id || !css.nom_officiel) continue;

    const existing = existingCssMap.get(css.gov_id);

    if (existing) {
      // Check if update needed
      const needsUpdate =
        existing.nom_officiel !== css.nom_officiel ||
        existing.nom_court !== css.nom_court ||
        existing.type_cs !== css.type_cs ||
        !existing.is_active;

      if (needsUpdate) {
        const { error } = await supabase
          .from("css")
          .update({
            nom_officiel: css.nom_officiel,
            nom_court: css.nom_court,
            type_cs: css.type_cs,
            is_active: true,
          })
          .eq("id", existing.id);
        if (error) {
          console.error(`Erreur UPDATE css ${css.gov_id}:`, error.message);
        } else {
          log.css.updated++;
        }
      }
      cssGovIdToUuid.set(css.gov_id, existing.id);
    } else {
      const { data, error } = await supabase
        .from("css")
        .insert({
          gov_id: css.gov_id,
          nom_officiel: css.nom_officiel,
          nom_court: css.nom_court,
          type_cs: css.type_cs,
        })
        .select("id")
        .single();
      if (error) {
        console.error(`Erreur INSERT css ${css.gov_id}:`, error.message);
      } else {
        cssGovIdToUuid.set(css.gov_id, data.id);
        log.css.inserted++;
      }
    }
  }

  // Soft-delete CSS absents du CSV
  const csvCssGovIds = new Set(cssParsed.map((c) => c.gov_id));
  for (const [govId, existing] of existingCssMap) {
    if (!csvCssGovIds.has(govId) && existing.is_active) {
      await supabase.from("css").update({ is_active: false }).eq("id", existing.id);
      log.css.deactivated++;
    }
  }

  console.log(
    `CSS : ${log.css.inserted} insérés, ${log.css.updated} mis à jour, ${log.css.deactivated} désactivés`,
  );

  // --- Parse écoles CSV ---
  const ecolesPath = resolve(process.cwd(), "public/data/raw/ecoles-publiques-quebec.csv");
  const ecolesRaw = readFileSync(ecolesPath, "utf8");
  const ecolesRows = parseCsv(ecolesRaw);
  console.log(`CSV ecoles-publiques-quebec.csv : ${ecolesRows.length} lignes lues`);

  // Filtrer SEC = 1 et dédupliquer par gov_id (le CSV peut contenir des doublons)
  const secRowsMap = new Map<string, SchoolRow>();
  for (const r of ecolesRows) {
    if (r["SEC"] !== "1") continue;
    const govId = r["CD_ORGNS"];
    if (!govId || secRowsMap.has(govId)) continue;
    secRowsMap.set(govId, {
      gov_id: govId,
      nom_officiel: r["NOM_OFFCL_ORGNS"],
      css_gov_id: r["CD_CS"],
    });
  }
  const secRows = Array.from(secRowsMap.values());
  console.log(`Écoles secondaires (SEC=1, dédupliquées) : ${secRows.length} lignes`);

  // --- Upsert schools ---
  const { data: existingSchools } = await supabase
    .from("schools")
    .select("id, gov_id, nom_officiel, css_id, is_active");

  const existingSchoolMap = new Map((existingSchools ?? []).map((s) => [s.gov_id, s]));

  for (const school of secRows) {
    if (!school.gov_id || !school.nom_officiel) continue;

    const cssId = cssGovIdToUuid.get(school.css_gov_id);
    if (!cssId) {
      console.warn(
        `⚠ École ${school.gov_id} (${school.nom_officiel}) : CD_CS="${school.css_gov_id}" ne matche aucun CSS — skipped`,
      );
      log.schools.skipped++;
      continue;
    }

    const existing = existingSchoolMap.get(school.gov_id);

    if (existing) {
      const needsUpdate =
        existing.nom_officiel !== school.nom_officiel ||
        existing.css_id !== cssId ||
        !existing.is_active;

      if (needsUpdate) {
        const { error } = await supabase
          .from("schools")
          .update({
            nom_officiel: school.nom_officiel,
            css_id: cssId,
            is_active: true,
          })
          .eq("id", existing.id);
        if (error) {
          console.error(`Erreur UPDATE school ${school.gov_id}:`, error.message);
        } else {
          log.schools.updated++;
        }
      }
    } else {
      const { error } = await supabase.from("schools").insert({
        gov_id: school.gov_id,
        nom_officiel: school.nom_officiel,
        css_id: cssId,
      });
      if (error) {
        console.error(`Erreur INSERT school ${school.gov_id}:`, error.message);
      } else {
        log.schools.inserted++;
      }
    }
  }

  // Soft-delete écoles absentes du CSV (parmi SEC=1)
  const csvSchoolGovIds = new Set(secRows.map((s) => s.gov_id));
  for (const [govId, existing] of existingSchoolMap) {
    if (!csvSchoolGovIds.has(govId) && existing.is_active) {
      await supabase.from("schools").update({ is_active: false }).eq("id", existing.id);
      log.schools.deactivated++;
    }
  }

  console.log(
    `Écoles : ${log.schools.inserted} insérées, ${log.schools.updated} mises à jour, ${log.schools.deactivated} désactivées, ${log.schools.skipped} skippées`,
  );

  // --- Changelog ---
  const logDir = resolve(process.cwd(), "public/data/seed-logs");
  if (!existsSync(logDir)) mkdirSync(logDir, { recursive: true });
  const logPath = resolve(logDir, `${new Date().toISOString().slice(0, 10)}_css-schools.json`);
  writeFileSync(logPath, JSON.stringify(log, null, 2), "utf8");
  console.log(`Changelog écrit : ${logPath}`);
  console.log("Seed terminé.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
