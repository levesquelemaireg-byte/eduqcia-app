import { notFound } from "next/navigation";
import { kv } from "@vercel/kv";
import { verifierTokenDraft } from "@/lib/epreuve/impression/token-draft";
import { epreuveVersImprimable } from "@/lib/epreuve/transformation/epreuve-vers-paginee";
import { tacheVersImprimable } from "@/lib/tache/impression/tache-vers-imprimable";
import { documentVersImprimable } from "@/lib/document/impression/document-vers-imprimable";
import type { DonneesEpreuve } from "@/lib/epreuve/contrats/donnees";
import type { DonneesTache, DocumentReference } from "@/lib/tache/contrats/donnees";
import type { ModeImpression } from "@/lib/epreuve/pagination/types";
import type { RenduImprimable } from "@/lib/impression/types";
import { ApercuImpression } from "@/components/epreuve/impression";

/**
 * Route SSR `/apercu/[token]` — print-engine D1.
 *
 * Vérifie le token HMAC, fetch le payload depuis Vercel KV (draft),
 * dispatch vers le pipeline approprié (document / tâche / épreuve),
 * rend `ApercuImpression`.
 */

type PageProps = {
  params: Promise<{ token: string }>;
};

/** Format KV — discriminé par `type`. */
type DraftKvTyped =
  | { type: "document"; payload: DocumentReference }
  | { type: "tache"; payload: DonneesTache; mode: ModeImpression; estCorrige: boolean }
  | { type: "epreuve"; payload: DonneesEpreuve; mode: ModeImpression; estCorrige: boolean };

/** Format KV legacy (pre-discriminatedUnion). */
type DraftKvLegacy = {
  payload: DonneesEpreuve;
  mode: ModeImpression;
  estCorrige: boolean;
};

/** Mesureur placeholder — hauteurs estimées en attendant la mesure DOM (D2). */
function mesureurPlaceholder(): number {
  return 200;
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

/**
 * Extrait les données depuis la valeur KV.
 * Gère la rétrocompatibilité avec l'ancien format (sans champ `type`).
 */
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

export default async function ApercuPage({ params }: PageProps) {
  const { token } = await params;

  const verification = verifierTokenDraft(token);
  if (!verification.valide || !verification.payloadId) {
    notFound();
  }

  const raw = await kv.get<string>(`draft:${verification.payloadId}`);
  if (!raw) {
    notFound();
  }

  const data = extraireDonneesKv(raw);
  const rendu = construireRendu(data);

  if (!rendu.ok) {
    return (
      <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif", color: "#c00" }}>
        <h1>Erreur de pagination</h1>
        <p>{rendu.erreur.suggestion}</p>
      </div>
    );
  }

  return <ApercuImpression rendu={rendu} />;
}
