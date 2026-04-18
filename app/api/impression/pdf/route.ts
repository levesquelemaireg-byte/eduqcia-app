import "server-only";

import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { genererPdf } from "@/lib/epreuve/impression/puppeteer";
import { verifierTokenDraft } from "@/lib/epreuve/impression/token-draft";

/**
 * POST /api/impression/pdf — print-engine D4.
 *
 * Reçoit un token draft, construit l'URL SSR, génère le PDF via Puppeteer.
 * Auth vérifiée via Supabase session.
 *
 * Timeout Vercel : 60s (plan Pro). Puppeteer cible < 10s.
 * Si Puppeteer dépasse 30s → 504 Gateway Timeout.
 */

const PUPPETEER_TIMEOUT_MS = 30_000;

const BodySchema = z.object({
  token: z.string().min(1),
});

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

  // 3. Vérifier la signature HMAC avant de lancer Puppeteer
  const verification = verifierTokenDraft(token);
  if (!verification.valide) {
    return NextResponse.json({ error: "Token invalide ou expiré." }, { status: 401 });
  }

  // 4. Construire l'URL SSR
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? `http://localhost:3000`;
  const url = `${baseUrl}/apercu/${encodeURIComponent(token)}`;

  // 5. Générer le PDF avec timeout de sécurité
  try {
    const pdfBuffer = await Promise.race([
      genererPdf(url),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Timeout Puppeteer dépassé.")), PUPPETEER_TIMEOUT_MS),
      ),
    ]);

    return new Response(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=epreuve.pdf",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[POST /api/impression/pdf]", err);

    const message = err instanceof Error ? err.message : "Erreur inconnue.";

    if (message.includes("Timeout")) {
      return NextResponse.json(
        { error: "Génération PDF trop longue. Réessayez." },
        { status: 504 },
      );
    }

    return NextResponse.json({ error: "Erreur lors de la génération du PDF." }, { status: 500 });
  }
}
