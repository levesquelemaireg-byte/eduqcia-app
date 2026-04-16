import { notFound } from "next/navigation";
import { readFile } from "fs/promises";
import path from "path";
import { epreuveVersImprimable } from "@/lib/epreuve/transformation/epreuve-vers-paginee";
import type { DonneesEpreuve } from "@/lib/epreuve/contrats/donnees";
import type { ModeImpression } from "@/lib/epreuve/pagination/types";
import { ApercuImpression } from "@/components/epreuve/impression";

/**
 * Route de test dev-only `/apercu/test/[slug]`.
 *
 * Charge un payload golden depuis `tests/e2e/fixtures/golden-payloads/[slug].json`
 * et rend `ApercuImpression` sans token HMAC ni Vercel KV.
 *
 * Protégée : 404 en production.
 */

type PageProps = {
  params: Promise<{ slug: string }>;
};

type GoldenFixture = {
  epreuve: DonneesEpreuve;
  mode: ModeImpression;
  estCorrige: boolean;
};

/** Mesureur placeholder — hauteurs estimées (même que la route SSR principale). */
function mesureurPlaceholder(): number {
  return 200;
}

/** Slugs autorisés — correspondance 1:1 avec les fichiers fixtures. */
const SLUGS_AUTORISES = ["redactionnel-simple", "ordre-chrono", "sommatif-3-taches"] as const;

export async function generateStaticParams() {
  // Ne pas générer les pages statiques en production
  if (process.env.NODE_ENV === "production") return [];
  return SLUGS_AUTORISES.map((slug) => ({ slug }));
}

export default async function ApercuTestPage({ params }: PageProps) {
  // Guard : 404 en production
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  const { slug } = await params;

  // Valider le slug pour éviter toute traversée de chemin
  if (!SLUGS_AUTORISES.includes(slug as (typeof SLUGS_AUTORISES)[number])) {
    notFound();
  }

  // Charger la fixture JSON
  const fixturePath = path.join(
    process.cwd(),
    "tests",
    "e2e",
    "fixtures",
    "golden-payloads",
    `${slug}.json`,
  );

  let fixture: GoldenFixture;
  try {
    const raw = await readFile(fixturePath, "utf8");
    fixture = JSON.parse(raw) as GoldenFixture;
  } catch {
    notFound();
  }

  // Paginer avec mesureur placeholder
  const rendu = epreuveVersImprimable(
    fixture.epreuve,
    { mode: fixture.mode, estCorrige: fixture.estCorrige },
    mesureurPlaceholder,
  );

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
