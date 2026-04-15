import "server-only";

import { NextResponse } from "next/server";
import { z } from "zod";
import { kv } from "@vercel/kv";
import { createClient } from "@/lib/supabase/server";
import { verifierTokenDraft } from "@/lib/epreuve/impression/token-draft";
import { genererPngPages } from "@/lib/epreuve/impression/puppeteer";
import { epreuveVersPaginee } from "@/lib/epreuve/transformation/epreuve-vers-paginee";
import type { DonneesEpreuve } from "@/lib/epreuve/contrats/donnees";
import type { ModeImpression } from "@/lib/epreuve/pagination/types";

/**
 * POST /api/impression/apercu-png — print-engine D5.
 *
 * Reçoit un token draft, génère les PNG pages via Puppeteer,
 * recalcule l'empreinte depuis le payload KV.
 *
 * Retourne { pages: string[], empreinte: string }
 * où pages sont des PNG en base64.
 *
 * Auth vérifiée via Supabase session.
 * Timeout Puppeteer : 30s → 504 Gateway Timeout.
 */

const PUPPETEER_TIMEOUT_MS = 30_000;

const BodySchema = z.object({
  token: z.string().min(1),
});

/** Mesureur placeholder — cohérent avec la route SSR. */
function mesureurPlaceholder(): number {
  return 200;
}

export async function POST(request: Request) {
  // 1. Auth Supabase
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  // 2. Valider le body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body JSON invalide." }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Token manquant." }, { status: 400 });
  }

  const { token } = parsed.data;

  // 3. Vérifier le token HMAC et récupérer le payload depuis KV
  const verification = verifierTokenDraft(token);
  if (!verification.valide || !verification.payloadId) {
    return NextResponse.json({ error: "Token invalide ou expiré." }, { status: 400 });
  }

  const raw = await kv.get<string>(`draft:${verification.payloadId}`);
  if (!raw) {
    return NextResponse.json({ error: "Payload expiré ou introuvable." }, { status: 404 });
  }

  // 4. Extraire payload + options de rendu (rétrocompatibilité ancien format)
  const kvParsed: unknown = typeof raw === "string" ? JSON.parse(raw) : raw;
  let epreuve: DonneesEpreuve;
  let mode: ModeImpression = "formatif";
  let estCorrige = false;

  if (
    kvParsed &&
    typeof kvParsed === "object" &&
    "payload" in kvParsed &&
    "mode" in kvParsed &&
    "estCorrige" in kvParsed
  ) {
    const enrichi = kvParsed as {
      payload: DonneesEpreuve;
      mode: ModeImpression;
      estCorrige: boolean;
    };
    epreuve = enrichi.payload;
    mode = enrichi.mode;
    estCorrige = enrichi.estCorrige;
  } else {
    epreuve = kvParsed as DonneesEpreuve;
  }

  // 5. Calculer l'empreinte via epreuveVersPaginee
  const paginee = epreuveVersPaginee(epreuve, { mode, estCorrige }, mesureurPlaceholder);
  if (!paginee.ok) {
    return NextResponse.json(
      { error: "Erreur de pagination.", detail: paginee.erreur.suggestion },
      { status: 422 },
    );
  }

  const empreinte = paginee.empreinte;

  // 6. Construire l'URL SSR et générer les PNG
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? `http://localhost:3000`;
  const url = `${baseUrl}/apercu/${encodeURIComponent(token)}`;

  try {
    const pngBuffers = await Promise.race([
      genererPngPages(url),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Timeout Puppeteer dépassé.")), PUPPETEER_TIMEOUT_MS),
      ),
    ]);

    const pages = pngBuffers.map((buf) => buf.toString("base64"));

    return NextResponse.json({ pages, empreinte });
  } catch (err) {
    console.error("[POST /api/impression/apercu-png]", err);

    const message = err instanceof Error ? err.message : "Erreur inconnue.";

    if (message.includes("Timeout")) {
      return NextResponse.json(
        { error: "Génération PNG trop longue. Réessayez." },
        { status: 504 },
      );
    }

    return NextResponse.json(
      { error: "Erreur lors de la génération des aperçus PNG." },
      { status: 500 },
    );
  }
}
