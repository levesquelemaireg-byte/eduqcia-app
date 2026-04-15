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
 * Reçoit un payload DonneesEpreuve + mode + estCorrige en body JSON,
 * le stocke dans Vercel KV avec TTL 10 minutes,
 * retourne un token HMAC signé.
 *
 * Auth vérifiée via Supabase session (route handler — pas de redirect).
 */

const BodySchema = z.object({
  payload: z.record(z.string(), z.unknown()),
  mode: z.enum(["formatif", "sommatif-standard", "epreuve-ministerielle"]),
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

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Body invalide : payload, mode et estCorrige requis." },
      { status: 400 },
    );
  }

  const { payload, mode, estCorrige } = parsed.data;

  // 3. Stocker dans Vercel KV avec TTL (payload + options de rendu)
  const payloadId = crypto.randomUUID();
  const kvValue = JSON.stringify({ payload, mode, estCorrige });
  await kv.set(`draft:${payloadId}`, kvValue, { ex: KV_TTL_SECONDS });

  // 4. Signer et retourner le token
  const token = signerTokenDraft(payloadId);

  return NextResponse.json({ token });
}
