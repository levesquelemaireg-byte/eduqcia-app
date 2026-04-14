/**
 * Crée un utilisateur de test dans auth.users + public.profiles (service role).
 * Charge les variables depuis .env.local (sans dépendance dotenv).
 *
 * Usage : npm run seed
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";

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

const EMAIL = "gllemaire@csslaval.gouv.qc.ca";
const PASSWORD = "12345678";
const ECOLE = "École de la Croisée";

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

async function findUserIdByEmail(
  admin: ReturnType<typeof createServiceClient>,
  email: string,
): Promise<string | null> {
  const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) {
    console.error("listUsers:", error);
    return null;
  }
  const u = data.users.find((x) => x.email?.toLowerCase() === email.toLowerCase());
  return u?.id ?? null;
}

async function main(): Promise<void> {
  const supabase = createServiceClient();

  // Chercher l'école dans la table schools par nom
  const { data: schoolRow } = await supabase
    .from("schools")
    .select("id")
    .eq("nom_officiel", ECOLE)
    .maybeSingle();
  const schoolId = schoolRow?.id ?? null;
  if (!schoolId) {
    console.warn(`⚠ École "${ECOLE}" introuvable dans schools — school_id sera null`);
  }

  let userId: string;

  const { data: created, error: createErr } = await supabase.auth.admin.createUser({
    email: EMAIL,
    password: PASSWORD,
    email_confirm: true,
  });

  if (createErr) {
    const msg = createErr.message.toLowerCase();
    if (
      msg.includes("already been registered") ||
      msg.includes("already registered") ||
      msg.includes("duplicate") ||
      msg.includes("user already exists")
    ) {
      console.log("Utilisateur déjà présent dans auth, récupération de l’UUID…");
      const existing = await findUserIdByEmail(supabase, EMAIL);
      if (!existing) {
        throw new Error(`Impossible de retrouver l’utilisateur : ${createErr.message}`);
      }
      userId = existing;
    } else {
      throw createErr;
    }
  } else {
    if (!created.user?.id) {
      throw new Error("createUser n’a pas retourné d’utilisateur.");
    }
    userId = created.user.id;
    console.log("auth.users : utilisateur créé, id =", userId);
  }

  const { error: confirmErr } = await supabase.auth.admin.updateUserById(userId, {
    email_confirm: true,
  });
  if (confirmErr) {
    throw confirmErr;
  }
  console.log("auth.users : courriel confirmé (updateUserById)");

  const now = new Date().toISOString();

  const { error: profileErr } = await supabase.from("profiles").upsert(
    {
      id: userId,
      email: EMAIL,
      first_name: "Gabriel",
      last_name: "Lévesque-Lemaire",
      role: "admin",
      status: "active",
      school_id: schoolId,
      activation_token: null,
      activated_at: now,
    },
    { onConflict: "id" },
  );

  if (profileErr) {
    throw profileErr;
  }

  console.log("public.profiles : profil upsert OK pour", EMAIL);
  console.log("Terminé. Vérifiez Authentication → Users dans le dashboard Supabase.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
