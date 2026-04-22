/**
 * Peuple les tables de référence (niveaux, disciplines, cd, connaissances) depuis public/data/*.json.
 * Utilise la clé service role (comme scripts/seed-test-user.ts).
 *
 * Modes :
 * - Par défaut : refus si la table `tae` contient des lignes (réensemencement destructif cd/connaissances).
 * - `--fill-empty` : upsert niveaux/disciplines ; insère cd/connaissances **uniquement** si vides pour HEC/HQC
 *   (sans DELETE) — utile quand des TAÉ existent déjà mais les référentiels n’ont jamais été chargés.
 *
 * Usage :
 *   npm run seed:ref
 *   npm run seed:ref:fill
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

const fillEmpty = process.argv.includes("--fill-empty");

function loadEnvLocal(): void {
  const p = resolve(process.cwd(), ".env.local");
  if (!existsSync(p)) {
    console.warn(
      "Avertissement : .env.local introuvable — utilisez les variables d’environnement déjà définies.",
    );
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

function createServiceClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requis (voir .env.local).",
    );
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

type CdCompetenceJson = {
  id: string;
  titre: string;
  composantes: {
    id: string;
    titre: string;
    criteres: { id: string; texte: string }[];
  }[];
};

function isMetaRow(o: unknown): boolean {
  return (
    typeof o === "object" &&
    o !== null &&
    "TYPE_FICHIER" in o &&
    (o as { TYPE_FICHIER?: string }).TYPE_FICHIER === "METADONNEES"
  );
}

function flattenCdFromFile(raw: unknown[]): Array<{
  competence: string;
  composante: string;
  critere: string;
  code: string | null;
}> {
  const out: Array<{
    competence: string;
    composante: string;
    critere: string;
    code: string | null;
  }> = [];
  for (const row of raw) {
    if (!row || typeof row !== "object" || isMetaRow(row)) continue;
    const cd = row as CdCompetenceJson;
    if (!cd.titre || !Array.isArray(cd.composantes)) continue;
    for (const comp of cd.composantes) {
      if (!comp.titre || !Array.isArray(comp.criteres)) continue;
      for (const crit of comp.criteres) {
        out.push({
          competence: cd.titre,
          composante: comp.titre,
          critere: crit.texte,
          code: crit.id ?? null,
        });
      }
    }
  }
  return out;
}

type ConnJsonRow = {
  id?: string;
  TYPE_FICHIER?: string;
  niveau?: string;
  periode?: string;
  realite_sociale?: string;
  section?: string;
  sous_section?: string | null;
  enonce?: string;
};

/** Même convention que `hqcRowToSelection` (DOMAIN §6.4) pour coller au wizard. */
const HQC_RS_SEP = " — ";

function parseConnaissances(
  raw: unknown[],
  disciplineId: number,
  hqcCompositeRealite: boolean,
): Array<{
  discipline_id: number;
  realite_sociale: string;
  section: string;
  sous_section: string | null;
  enonce: string;
}> {
  const out: Array<{
    discipline_id: number;
    realite_sociale: string;
    section: string;
    sous_section: string | null;
    enonce: string;
  }> = [];
  for (const row of raw) {
    if (!row || typeof row !== "object" || isMetaRow(row)) continue;
    const c = row as ConnJsonRow;
    if (
      typeof c.realite_sociale !== "string" ||
      typeof c.section !== "string" ||
      typeof c.enonce !== "string"
    ) {
      continue;
    }
    const sous =
      c.sous_section === undefined || c.sous_section === null ? null : String(c.sous_section);
    const periode = typeof c.periode === "string" ? c.periode.trim() : "";
    const realiteStored =
      hqcCompositeRealite && periode.length > 0
        ? `${periode}${HQC_RS_SEP}${c.realite_sociale}`
        : c.realite_sociale;
    out.push({
      discipline_id: disciplineId,
      realite_sociale: realiteStored,
      section: c.section,
      sous_section: sous,
      enonce: c.enonce,
    });
  }
  return out;
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

async function main(): Promise<void> {
  const supabase = createServiceClient();

  if (!fillEmpty) {
    const { count: tacheCount, error: tacheErr } = await supabase
      .from("tae")
      .select("*", { count: "exact", head: true });
    if (tacheErr) {
      console.error("Erreur lecture tae:", tacheErr);
      process.exitCode = 1;
      return;
    }
    if ((tacheCount ?? 0) > 0) {
      console.error(
        "Refus : la table `tae` contient déjà des lignes. Le réensemencement destructif des cd / connaissances pourrait invalider les références.",
      );
      console.error(
        "Si les tables cd / connaissances sont encore vides, relancez : npm run seed:ref:fill",
      );
      process.exitCode = 1;
      return;
    }
  } else {
    console.log(
      "Mode --fill-empty : pas de DELETE sur cd/connaissances ; insertion seulement si vides.\n",
    );
  }

  const niveauxRows = [
    { code: "sec1", label: "Secondaire 1", cycle: 1, ordre: 1 },
    { code: "sec2", label: "Secondaire 2", cycle: 1, ordre: 2 },
    { code: "sec3", label: "Secondaire 3", cycle: 2, ordre: 3 },
    { code: "sec4", label: "Secondaire 4", cycle: 2, ordre: 4 },
  ];
  const { error: nivErr } = await supabase
    .from("niveaux")
    .upsert(niveauxRows, { onConflict: "code" });
  if (nivErr) {
    console.error("niveaux:", nivErr);
    process.exitCode = 1;
    return;
  }
  console.log("niveaux : OK (upsert)");

  const disciplinesRows = [
    {
      code: "HEC",
      label: "Histoire et éducation à la citoyenneté",
      cd_json_file: "hec-cd.json",
      conn_json_file: "hec-sec1-2.json",
    },
    {
      code: "GEO",
      label: "Géographie et éducation à la citoyenneté",
      cd_json_file: null,
      conn_json_file: null,
    },
    {
      code: "HQC",
      label: "Histoire du Québec et du Canada",
      cd_json_file: "hqc-cd.json",
      conn_json_file: "hqc-sec3-4.json",
    },
  ];
  const { error: discErr } = await supabase
    .from("disciplines")
    .upsert(disciplinesRows, { onConflict: "code" });
  if (discErr) {
    console.error("disciplines:", discErr);
    process.exitCode = 1;
    return;
  }
  console.log("disciplines : OK (upsert)");

  const { data: discRows, error: discSelErr } = await supabase
    .from("disciplines")
    .select("id, code")
    .in("code", ["HEC", "HQC"]);
  if (discSelErr || !discRows?.length) {
    console.error("disciplines select:", discSelErr);
    process.exitCode = 1;
    return;
  }
  const discId = (code: "HEC" | "HQC") =>
    (discRows as { id: number; code: string }[]).find((d) => d.code === code)?.id;

  const idHec = discId("HEC");
  const idHqc = discId("HQC");
  if (idHec == null || idHqc == null) {
    console.error("IDs disciplines HEC/HQC introuvables.");
    process.exitCode = 1;
    return;
  }

  const dataDir = resolve(process.cwd(), "public/data");
  const hecCd = JSON.parse(readFileSync(resolve(dataDir, "hec-cd.json"), "utf8")) as unknown[];
  const hqcCd = JSON.parse(readFileSync(resolve(dataDir, "hqc-cd.json"), "utf8")) as unknown[];

  const cdInserts = [
    ...flattenCdFromFile(hecCd).map((r) => ({ ...r, discipline_id: idHec })),
    ...flattenCdFromFile(hqcCd).map((r) => ({ ...r, discipline_id: idHqc })),
  ];

  const hecConn = JSON.parse(
    readFileSync(resolve(dataDir, "hec-sec1-2.json"), "utf8"),
  ) as unknown[];
  const hqcConn = JSON.parse(
    readFileSync(resolve(dataDir, "hqc-sec3-4.json"), "utf8"),
  ) as unknown[];

  const connInserts = [
    ...parseConnaissances(hecConn, idHec, false),
    ...parseConnaissances(hqcConn, idHqc, true),
  ];

  if (fillEmpty) {
    const { count: cdCount, error: cdCountErr } = await supabase
      .from("cd")
      .select("*", { count: "exact", head: true })
      .in("discipline_id", [idHec, idHqc]);
    if (cdCountErr) {
      console.error("cd count:", cdCountErr);
      process.exitCode = 1;
      return;
    }
    if ((cdCount ?? 0) > 0) {
      console.log(
        `cd : déjà ${cdCount} ligne(s) pour HEC/HQC — aucune insertion (évite les doublons).`,
      );
    } else {
      for (const batch of chunk(cdInserts, 400)) {
        const { error: cdInsErr } = await supabase.from("cd").insert(batch);
        if (cdInsErr) {
          console.error("cd insert:", cdInsErr);
          process.exitCode = 1;
          return;
        }
      }
      console.log(`cd : OK (${cdInserts.length} lignes insérées)`);
    }

    const { count: connCount, error: connCountErr } = await supabase
      .from("connaissances")
      .select("*", { count: "exact", head: true })
      .in("discipline_id", [idHec, idHqc]);
    if (connCountErr) {
      console.error("connaissances count:", connCountErr);
      process.exitCode = 1;
      return;
    }
    if ((connCount ?? 0) > 0) {
      console.log(`connaissances : déjà ${connCount} ligne(s) pour HEC/HQC — aucune insertion.`);
    } else {
      for (const batch of chunk(connInserts, 400)) {
        const { error: connInsErr } = await supabase.from("connaissances").insert(batch);
        if (connInsErr) {
          console.error("connaissances insert:", connInsErr);
          process.exitCode = 1;
          return;
        }
      }
      console.log(`connaissances : OK (${connInserts.length} lignes insérées)`);
    }
  } else {
    const { error: delCdErr } = await supabase
      .from("cd")
      .delete()
      .in("discipline_id", [idHec, idHqc]);
    if (delCdErr) {
      console.error("cd delete:", delCdErr);
      process.exitCode = 1;
      return;
    }

    for (const batch of chunk(cdInserts, 400)) {
      const { error: cdInsErr } = await supabase.from("cd").insert(batch);
      if (cdInsErr) {
        console.error("cd insert:", cdInsErr);
        process.exitCode = 1;
        return;
      }
    }
    console.log(`cd : OK (${cdInserts.length} lignes)`);

    const { error: delConnErr } = await supabase
      .from("connaissances")
      .delete()
      .in("discipline_id", [idHec, idHqc]);
    if (delConnErr) {
      console.error("connaissances delete:", delConnErr);
      process.exitCode = 1;
      return;
    }

    for (const batch of chunk(connInserts, 400)) {
      const { error: connInsErr } = await supabase.from("connaissances").insert(batch);
      if (connInsErr) {
        console.error("connaissances insert:", connInsErr);
        process.exitCode = 1;
        return;
      }
    }
    console.log(`connaissances : OK (${connInserts.length} lignes)`);
  }

  console.log("Terminé.");
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
