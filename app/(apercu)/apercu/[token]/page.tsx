import { notFound } from "next/navigation";
import { kv } from "@vercel/kv";
import { verifierTokenDraft } from "@/lib/epreuve/impression/token-draft";
import { epreuveVersImprimable } from "@/lib/epreuve/transformation/epreuve-vers-paginee";
import { tacheVersImprimable } from "@/lib/tache/impression/tache-vers-imprimable";
import { documentVersImprimable } from "@/lib/document/impression/document-vers-imprimable";
import type { DonneesEpreuve } from "@/lib/epreuve/contrats/donnees";
import type { DonneesTache } from "@/lib/tache/contrats/donnees";
import type { RendererDocument } from "@/lib/types/document-renderer";
import type { ModeImpression } from "@/lib/epreuve/pagination/types";
import type { ModeCorrige, RenduImprimable } from "@/lib/impression/types";
import { mesurerBlocImpression } from "@/lib/impression/mesure-estimation";
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
  | { type: "document"; payload: RendererDocument }
  | { type: "tache"; payload: DonneesTache; mode: ModeImpression; corrige: ModeCorrige }
  | { type: "epreuve"; payload: DonneesEpreuve; mode: ModeImpression; corrige: ModeCorrige };

/** Migre l'ancien `estCorrige: boolean` vers `corrige: ModeCorrige`. */
function migrerCorrige(o: Record<string, unknown>): ModeCorrige {
  if ("corrige" in o) {
    const c = o.corrige;
    if (c === "simple" || c === "detaille" || c === null) return c;
  }
  if ("estCorrige" in o) return o.estCorrige === true ? "simple" : null;
  return null;
}

function construireRendu(data: DraftKvTyped): RenduImprimable {
  switch (data.type) {
    case "document":
      return documentVersImprimable(data.payload, mesurerBlocImpression);

    case "tache":
      return tacheVersImprimable(
        data.payload,
        { mode: data.mode, corrige: data.corrige },
        mesurerBlocImpression,
      );

    case "epreuve":
      return epreuveVersImprimable(
        data.payload,
        { mode: data.mode, corrige: data.corrige },
        mesurerBlocImpression,
      );
  }
}

/**
 * Extrait les données depuis la valeur KV.
 * Gère la rétrocompatibilité avec l'ancien format (sans champ `type`) et
 * l'ancien flag `estCorrige: boolean` (avant ModeCorrige, Phase 5).
 */
function extraireDonneesKv(raw: unknown): DraftKvTyped {
  const parsed: unknown = typeof raw === "string" ? JSON.parse(raw) : raw;

  if (parsed && typeof parsed === "object" && "type" in parsed) {
    const o = parsed as Record<string, unknown> & { type: string };
    if (o.type === "document") return parsed as DraftKvTyped;
    if (o.type === "tache") {
      return {
        type: "tache",
        payload: o.payload as DonneesTache,
        mode: o.mode as ModeImpression,
        corrige: migrerCorrige(o),
      };
    }
    return {
      type: "epreuve",
      payload: o.payload as DonneesEpreuve,
      mode: o.mode as ModeImpression,
      corrige: migrerCorrige(o),
    };
  }

  // Rétrocompatibilité : ancien format épreuve (sans discriminant `type`)
  if (parsed && typeof parsed === "object" && "payload" in parsed && "mode" in parsed) {
    const o = parsed as Record<string, unknown>;
    return {
      type: "epreuve",
      payload: o.payload as DonneesEpreuve,
      mode: o.mode as ModeImpression,
      corrige: migrerCorrige(o),
    };
  }

  // Dernier fallback : payload brut = épreuve
  return {
    type: "epreuve",
    payload: parsed as DonneesEpreuve,
    mode: "formatif",
    corrige: null,
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
