import { notFound } from "next/navigation";
import { kv } from "@vercel/kv";
import { verifierTokenDraft } from "@/lib/epreuve/impression/token-draft";
import { epreuveVersPaginee } from "@/lib/epreuve/transformation/epreuve-vers-paginee";
import type { DonneesEpreuve } from "@/lib/epreuve/contrats/donnees";
import type { ModeImpression } from "@/lib/epreuve/pagination/types";
import { ApercuImpression } from "@/components/epreuve/impression";

/**
 * Route SSR `/apercu/[token]` — print-engine D1.
 *
 * Vérifie le token HMAC, fetch le payload depuis Vercel KV (draft),
 * appelle `epreuveVersPaginee`, rend `ApercuImpression`.
 *
 * Le KV stocke `{ payload, mode, estCorrige }` (format PDF-9+).
 * Rétrocompatibilité : si la valeur KV est un ancien format (payload brut),
 * fallback sur mode "formatif" et estCorrige false.
 */

type PageProps = {
  params: Promise<{ token: string }>;
};

/** Format KV enrichi (PDF-9+). */
type DraftKvValue = {
  payload: DonneesEpreuve;
  mode: ModeImpression;
  estCorrige: boolean;
};

/** Mesureur placeholder — hauteurs estimées en attendant la mesure DOM (D2). */
function mesureurPlaceholder(): number {
  return 200;
}

/**
 * Extrait le payload et les options de rendu depuis la valeur KV.
 * Gère la rétrocompatibilité avec l'ancien format (payload brut).
 */
function extraireDonneesKv(raw: unknown): {
  epreuve: DonneesEpreuve;
  mode: ModeImpression;
  estCorrige: boolean;
} {
  const parsed: unknown = typeof raw === "string" ? JSON.parse(raw) : raw;

  // Format enrichi PDF-9+ : { payload, mode, estCorrige }
  if (
    parsed &&
    typeof parsed === "object" &&
    "payload" in parsed &&
    "mode" in parsed &&
    "estCorrige" in parsed
  ) {
    const kv = parsed as DraftKvValue;
    return { epreuve: kv.payload, mode: kv.mode, estCorrige: kv.estCorrige };
  }

  // Rétrocompatibilité : ancien format (payload brut)
  return { epreuve: parsed as DonneesEpreuve, mode: "formatif", estCorrige: false };
}

export default async function ApercuPage({ params }: PageProps) {
  const { token } = await params;

  // 1. Vérifier le token HMAC
  const verification = verifierTokenDraft(token);
  if (!verification.valide || !verification.payloadId) {
    notFound();
  }

  // 2. Fetch le payload depuis Vercel KV
  const raw = await kv.get<string>(`draft:${verification.payloadId}`);
  if (!raw) {
    notFound();
  }

  const { epreuve, mode, estCorrige } = extraireDonneesKv(raw);

  // 3. Paginer (mesureur placeholder pour D1)
  const paginee = epreuveVersPaginee(epreuve, { mode, estCorrige }, mesureurPlaceholder);

  if (!paginee.ok) {
    return (
      <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif", color: "#c00" }}>
        <h1>Erreur de pagination</h1>
        <p>{paginee.erreur.suggestion}</p>
      </div>
    );
  }

  return <ApercuImpression paginee={paginee} />;
}
