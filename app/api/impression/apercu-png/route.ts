import "server-only";

import { NextResponse } from "next/server";
import { z } from "zod";
import { kv } from "@vercel/kv";
import { createClient } from "@/lib/supabase/server";
import { verifierTokenDraft } from "@/lib/epreuve/impression/token-draft";
import { checkRateLimit } from "@/lib/server/rate-limit";
import { genererPngPages } from "@/lib/epreuve/impression/puppeteer";
import { epreuveVersImprimable } from "@/lib/epreuve/transformation/epreuve-vers-paginee";
import { tacheVersImprimable } from "@/lib/tache/impression/tache-vers-imprimable";
import { documentVersImprimable } from "@/lib/document/impression/document-vers-imprimable";
import type { DonneesEpreuve } from "@/lib/epreuve/contrats/donnees";
import type { DonneesTache } from "@/lib/tache/contrats/donnees";
import type { RendererDocument } from "@/lib/types/document-renderer";
import type { ModeImpression } from "@/lib/epreuve/pagination/types";
import type { RenduImprimable } from "@/lib/impression/types";

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

/* -------------------------------------------------------------------------- */
/*  Extraction KV — aligné sur la route SSR apercu/[token]/page.tsx          */
/* -------------------------------------------------------------------------- */

/** Format KV — discriminé par `type`. */
type DraftKvTyped =
  | { type: "document"; payload: RendererDocument }
  | { type: "tache"; payload: DonneesTache; mode: ModeImpression; estCorrige: boolean }
  | { type: "epreuve"; payload: DonneesEpreuve; mode: ModeImpression; estCorrige: boolean };

/** Format KV legacy (pre-discriminatedUnion). */
type DraftKvLegacy = {
  payload: DonneesEpreuve;
  mode: ModeImpression;
  estCorrige: boolean;
};

function extraireDonneesKv(raw: unknown): DraftKvTyped {
  const parsed: unknown = typeof raw === "string" ? JSON.parse(raw) : raw;

  if (parsed && typeof parsed === "object" && "type" in parsed) {
    return parsed as DraftKvTyped;
  }

  // Rétrocompatibilité : ancien format épreuve (sans discriminant `type`)
  if (
    parsed &&
    typeof parsed === "object" &&
    "payload" in parsed &&
    "mode" in parsed &&
    "estCorrige" in parsed
  ) {
    const legacy = parsed as DraftKvLegacy;
    return {
      type: "epreuve",
      payload: legacy.payload,
      mode: legacy.mode,
      estCorrige: legacy.estCorrige,
    };
  }

  // Dernier fallback : payload brut = épreuve
  return {
    type: "epreuve",
    payload: parsed as DonneesEpreuve,
    mode: "formatif",
    estCorrige: false,
  };
}

function construireRendu(data: DraftKvTyped): RenduImprimable {
  switch (data.type) {
    case "document":
      return documentVersImprimable(data.payload, mesureurPlaceholder);

    case "tache":
      return tacheVersImprimable(
        data.payload,
        { mode: data.mode, estCorrige: data.estCorrige },
        mesureurPlaceholder,
      );

    case "epreuve":
      return epreuveVersImprimable(
        data.payload,
        { mode: data.mode, estCorrige: data.estCorrige },
        mesureurPlaceholder,
      );
  }
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

  if (!checkRateLimit(`png:${user.id}`, 10)) {
    return NextResponse.json(
      { error: "Trop de requêtes. Réessayez dans une minute." },
      { status: 429 },
    );
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

  // 4. Extraire payload et construire le rendu (dispatch par type)
  const data = extraireDonneesKv(raw);
  const rendu = construireRendu(data);

  if (!rendu.ok) {
    return NextResponse.json(
      { error: "Erreur de pagination.", detail: rendu.erreur.suggestion },
      { status: 422 },
    );
  }

  const empreinte = rendu.empreinte;

  // 5. Construire l'URL SSR et générer les PNG
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
