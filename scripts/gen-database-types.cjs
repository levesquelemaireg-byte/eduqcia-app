#!/usr/bin/env node
/**
 * Régénère `lib/types/database.ts` depuis la base Supabase.
 *
 * Méthodes (la première disponible gagne) :
 * 1. `SUPABASE_DB_URL` ou `DATABASE_URL` — connexion Postgres directe (`--db-url`).
 * 2. `SUPABASE_PROJECT_ID` ou sous-domaine de `NEXT_PUBLIC_SUPABASE_URL` — API projet (`--project-id`, nécessite `supabase login` ou token).
 * 3. Dossier lié : si `supabase/config.toml` existe et `supabase link` a été fait (`--linked`).
 *
 * Voir `docs/ARCHITECTURE.md` (schéma, synchronisation) et `docs/BACKLOG.md` (F1).
 */
"use strict";

const { execSync } = require("node:child_process");
const { readFileSync, writeFileSync, existsSync } = require("node:fs");
const { resolve } = require("node:path");

const OUT = resolve(__dirname, "..", "lib", "types", "database.ts");

function parseEnvFile(filePath) {
  if (!existsSync(filePath)) return {};
  const env = {};
  for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq === -1) continue;
    const key = t.slice(0, eq).trim();
    let val = t.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    env[key] = val;
  }
  return env;
}

const root = resolve(__dirname, "..");
const localEnv = parseEnvFile(resolve(root, ".env.local"));
const merged = { ...parseEnvFile(resolve(root, ".env.example")), ...localEnv, ...process.env };

const dbUrl = merged.SUPABASE_DB_URL || merged.DATABASE_URL;
const configToml = resolve(root, "supabase", "config.toml");

function q(s) {
  return JSON.stringify(s);
}

let cmd;
let label;

if (dbUrl && dbUrl.length > 10 && !dbUrl.includes("xxxx")) {
  cmd = `npx supabase gen types typescript --db-url ${q(dbUrl)}`;
  label = "db-url";
} else if (existsSync(configToml)) {
  cmd = "npx supabase gen types typescript --linked";
  label = "linked";
} else {
  let projectId = merged.SUPABASE_PROJECT_ID?.trim();
  if (!projectId && merged.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      const u = new URL(merged.NEXT_PUBLIC_SUPABASE_URL);
      const m = u.hostname.match(/^([a-z0-9]{20})\.supabase\.co$/i);
      if (m) projectId = m[1];
    } catch {
      /* ignore */
    }
  }
  if (!projectId || projectId === "xxxx" || merged.NEXT_PUBLIC_SUPABASE_URL?.includes("xxxx")) {
    console.error(
      "[gen:types] Aucune source : renseigner dans .env.local l’une des options suivantes :\n" +
        "  • SUPABASE_DB_URL ou DATABASE_URL (Session mode ou URI Postgres du projet), ou\n" +
        "  • NEXT_PUBLIC_SUPABASE_URL (https://<ref>.supabase.co) avec un ref réel, ou\n" +
        "  • SUPABASE_PROJECT_ID (20 caractères, Dashboard → Settings → General),\n" +
        "ou exécuter `supabase link` dans le dépôt avec `supabase/config.toml`.\n" +
        "Pour --project-id : `npx supabase login` au préalable.",
    );
    process.exit(1);
  }
  cmd = `npx supabase gen types typescript --project-id ${q(projectId)}`;
  label = `project-id (${projectId.slice(0, 6)}…)`;
}

const types = execSync(cmd, {
  encoding: "utf8",
  maxBuffer: 50 * 1024 * 1024,
  shell: true,
});

writeFileSync(OUT, types, "utf8");
console.info(`[gen:types] OK (${label}) → ${OUT}`);
