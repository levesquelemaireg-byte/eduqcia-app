import { notFound } from "next/navigation";
import { kv } from "@vercel/kv";
import { verifierTokenDraft } from "@/lib/epreuve/impression/token-draft";
import { epreuveVersPaginee } from "@/lib/epreuve/transformation/epreuve-vers-paginee";
import type { DonneesEpreuve } from "@/lib/epreuve/contrats/donnees";
import { ApercuImpression } from "@/components/epreuve/impression";

/**
 * Route SSR `/apercu/[token]` — print-engine D1.
 *
 * Vérifie le token HMAC, fetch le payload depuis Vercel KV (draft),
 * appelle `epreuveVersPaginee`, rend `ApercuImpression`.
 *
 * Pour le MVP, seul le chemin draft/KV est implémenté.
 */

type PageProps = {
  params: Promise<{ token: string }>;
};

/** Mesureur placeholder — hauteurs estimées en attendant la mesure DOM (D2). */
function mesureurPlaceholder(): number {
  return 200;
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

  const epreuve: DonneesEpreuve = typeof raw === "string" ? JSON.parse(raw) : raw;

  // 3. Paginer (mesureur placeholder pour D1)
  const paginee = epreuveVersPaginee(
    epreuve,
    { mode: "formatif", estCorrige: false },
    mesureurPlaceholder,
  );

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
