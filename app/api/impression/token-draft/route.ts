import "server-only";

import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import { createClient } from "@/lib/supabase/server";
import { signerTokenDraft } from "@/lib/epreuve/impression/token-draft";

const KV_TTL_SECONDS = 10 * 60; // 10 minutes

/**
 * POST /api/impression/token-draft
 *
 * Reçoit un payload DonneesEpreuve en body JSON,
 * le stocke dans Vercel KV avec TTL 10 minutes,
 * retourne un token HMAC signé.
 *
 * Auth vérifiée via Supabase session (route handler — pas de redirect).
 */
export async function POST(request: Request) {
  // 1. Vérifier l'auth
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  // 2. Lire le payload
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Body JSON invalide." }, { status: 400 });
  }

  if (!payload || typeof payload !== "object") {
    return NextResponse.json({ error: "Payload manquant." }, { status: 400 });
  }

  // 3. Stocker dans Vercel KV avec TTL
  const payloadId = crypto.randomUUID();
  await kv.set(`draft:${payloadId}`, JSON.stringify(payload), { ex: KV_TTL_SECONDS });

  // 4. Signer et retourner le token
  const token = signerTokenDraft(payloadId);

  return NextResponse.json({ token });
}
