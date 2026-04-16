import "server-only";

import { NextResponse } from "next/server";
import { z } from "zod";
import { kv } from "@vercel/kv";
import { createClient } from "@/lib/supabase/server";
import { signerTokenDraft } from "@/lib/epreuve/impression/token-draft";

const KV_TTL_SECONDS = 10 * 60; // 10 minutes

/**
 * POST /api/impression/token-draft
 *
 * Reçoit un payload discriminé par `type` (document / tâche / épreuve),
 * le stocke dans Vercel KV avec TTL 10 minutes,
 * retourne un token HMAC signé.
 *
 * Auth vérifiée via Supabase session (route handler — pas de redirect).
 */

const modeSchema = z.enum(["formatif", "sommatif-standard", "epreuve-ministerielle"]);

const BodySchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("document"),
    payload: z.record(z.string(), z.unknown()),
  }),
  z.object({
    type: z.literal("tache"),
    payload: z.record(z.string(), z.unknown()),
    mode: modeSchema,
    estCorrige: z.boolean(),
  }),
  z.object({
    type: z.literal("epreuve"),
    payload: z.record(z.string(), z.unknown()),
    mode: modeSchema,
    estCorrige: z.boolean(),
  }),
]);

/** Schema legacy (sans champ `type`) — rétrocompatibilité. */
const LegacyBodySchema = z.object({
  payload: z.record(z.string(), z.unknown()),
  mode: modeSchema,
  estCorrige: z.boolean(),
});

export async function POST(request: Request) {
  // 1. Vérifier l'auth
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  // 2. Lire et valider le body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body JSON invalide." }, { status: 400 });
  }

  // Essayer le nouveau format (discriminatedUnion) d'abord
  const parsed = BodySchema.safeParse(body);
  let kvValue: string;

  if (parsed.success) {
    kvValue = JSON.stringify(parsed.data);
  } else {
    // Rétrocompatibilité : ancien format (sans `type`)
    const legacyParsed = LegacyBodySchema.safeParse(body);
    if (!legacyParsed.success) {
      return NextResponse.json(
        { error: "Body invalide : type, payload, mode et estCorrige requis." },
        { status: 400 },
      );
    }
    // Stocker comme épreuve (ancien format)
    kvValue = JSON.stringify({
      type: "epreuve" as const,
      ...legacyParsed.data,
    });
  }

  // 3. Stocker dans Vercel KV avec TTL
  const payloadId = crypto.randomUUID();
  await kv.set(`draft:${payloadId}`, kvValue, { ex: KV_TTL_SECONDS });

  // 4. Signer et retourner le token
  const token = signerTokenDraft(payloadId);

  return NextResponse.json({ token });
}
