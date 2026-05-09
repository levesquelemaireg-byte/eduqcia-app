/**
 * Seed — Épreuve MEQ « Histoire du Québec et du Canada Ch.1 » (test d'acceptation NR).
 *
 * Crée 6 tâches publiées (1 par parcours non rédactionnel) + 1 épreuve les
 * regroupant. Compte auteur paramétrable via `SEED_AUTHOR_EMAIL` (défaut :
 * `enseignant.b.test@csslaval.gouv.qc.ca`).
 *
 * **Objectif** : valider end-to-end les 6 parcours NR — `ordre-chronologique`,
 * `ligne-du-temps`, `avant-apres`, `carte-historique`, `manifestations`,
 * `causes-consequences`. Pas de reproduction fidèle de l'épreuve MEQ.
 *
 * Source d'inspiration : `docs/imports/EXTRACTION-EVAL-OI-CH1.md` (Q1, Q3,
 * Q4, Q5, Q11, Q12 + 1 avant-après synthétique).
 *
 * Contenus : placeholders text-only (l'objectif est de tester les wizards).
 *
 * Idempotence : le script supprime au début toute épreuve marquée
 * `[seed:meq-ch1]` (tous auteurs confondus) et ses tâches/documents associés
 * avant de re-seeder. Permet de re-router le seed d'un compte à l'autre sans
 * laisser de résidu.
 *
 * Usage :
 *   npm run seed:epreuve-meq-ch1                                    # défaut
 *   SEED_AUTHOR_EMAIL=gllemaire@csslaval.gouv.qc.ca npm run seed:epreuve-meq-ch1
 *
 * Prérequis :
 *  - `.env.local` avec `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.
 *  - Compte cible existant dans `profiles` (status `active` recommandé).
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/lib/types/database";
import {
  buildOrdreChronologiqueConsigneHtml,
  buildOrdreChronologiqueCorrigeHtml,
  buildOrdreChronologiqueGuidageHtml,
  initialOrdreChronologiquePayload,
  type OrdreChronologiquePayload,
} from "@/lib/tache/non-redaction/ordre-chronologique-payload";
import {
  buildLigneDuTempsConsigneHtml,
  buildLigneDuTempsCorrigeHtml,
  buildLigneDuTempsGuidageHtml,
  initialLigneDuTempsPayload,
  type LigneDuTempsPayload,
} from "@/lib/tache/non-redaction/ligne-du-temps-payload";
import {
  buildAvantApresConsigneHtml,
  buildAvantApresCorrigeHtml,
  buildAvantApresGuidageHtml,
  initialAvantApresPayload,
  type AvantApresPayload,
} from "@/lib/tache/non-redaction/avant-apres-payload";
import {
  buildCarteHistoriqueConsigneHtml,
  buildCarteHistoriqueCorrigeHtml,
  initialCarteHistoriquePayload,
  type CarteHistoriquePayload,
} from "@/lib/tache/non-redaction/carte-historique-payload";
import {
  buildManifestationsConsigneHtml,
  buildManifestationsCorrigeHtml,
  initialManifestationsPayload,
  type ManifestationsPayload,
} from "@/lib/tache/non-redaction/manifestations-payload";
import {
  buildCausesConsequencesConsigneHtml,
  buildCausesConsequencesCorrigeHtml,
  initialCausesConsequencesPayload,
  type CausesConsequencesPayload,
} from "@/lib/tache/non-redaction/causes-consequences-payload";

/* -------------------------------------------------------------------------- */
/*  Constantes                                                                 */
/* -------------------------------------------------------------------------- */

const DEFAULT_AUTHOR_EMAIL = "enseignant.b.test@csslaval.gouv.qc.ca";

const NIVEAU_CODE = "sec3";
const DISCIPLINE_CODE = "HQC";

const EVALUATION_TITRE = "MEQ — Histoire du Québec et du Canada — Chapitre 1 (test NR)";
const EVALUATION_DESCRIPTION =
  "Épreuve de test couvrant les 6 parcours non rédactionnels (ordre-chronologique, ligne-du-temps, avant-apres, carte-historique, manifestations, causes-consequences). Inspirée de l'épreuve MEQ HEQ3 Chapitre 1.";
const EVALUATION_TAG = "[seed:meq-ch1]"; // Marqueur d'idempotence

/* -------------------------------------------------------------------------- */
/*  Env                                                                        */
/* -------------------------------------------------------------------------- */

function loadEnvLocal(): void {
  const p = resolve(process.cwd(), ".env.local");
  if (!existsSync(p)) {
    console.warn(
      "⚠ .env.local introuvable — utilisation des variables d'environnement existantes.",
    );
    return;
  }
  for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

loadEnvLocal();

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Variable d'environnement manquante : ${name}`);
  return v;
}

const SUPABASE_URL = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
const SUPABASE_SERVICE_KEY = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
const AUTHOR_EMAIL = process.env.SEED_AUTHOR_EMAIL ?? DEFAULT_AUTHOR_EMAIL;

/* -------------------------------------------------------------------------- */
/*  Client Supabase (service role pour bypass RLS)                             */
/* -------------------------------------------------------------------------- */

type SBClient = SupabaseClient<Database>;

function serviceClient(): SBClient {
  return createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/* -------------------------------------------------------------------------- */
/*  Lookups référentiels                                                       */
/* -------------------------------------------------------------------------- */

type RefIds = {
  auteurId: string;
  niveauId: number;
  disciplineId: number;
  cdId: number;
  connaissanceId: number;
};

async function lookupRefIds(svc: SBClient, auteurEmail: string): Promise<RefIds> {
  const { data: auteur, error: auteurErr } = await svc
    .from("profiles")
    .select("id")
    .eq("email", auteurEmail)
    .maybeSingle();
  if (auteurErr || !auteur)
    throw new Error(`Profil ${auteurEmail} introuvable : ${auteurErr?.message}`);

  const { data: niveau, error: niveauErr } = await svc
    .from("niveaux")
    .select("id")
    .eq("code", NIVEAU_CODE)
    .single();
  if (niveauErr) throw niveauErr;

  const { data: discipline, error: discErr } = await svc
    .from("disciplines")
    .select("id")
    .eq("code", DISCIPLINE_CODE)
    .single();
  if (discErr) throw discErr;

  const { data: cd, error: cdErr } = await svc
    .from("cd")
    .select("id")
    .eq("discipline_id", discipline.id)
    .order("id", { ascending: true })
    .limit(1)
    .single();
  if (cdErr) throw new Error(`Aucune CD trouvée pour ${DISCIPLINE_CODE} : ${cdErr.message}`);

  const { data: conn, error: connErr } = await svc
    .from("connaissances")
    .select("id")
    .eq("discipline_id", discipline.id)
    .order("id", { ascending: true })
    .limit(1)
    .single();
  if (connErr)
    throw new Error(`Aucune connaissance trouvée pour ${DISCIPLINE_CODE} : ${connErr.message}`);

  return {
    auteurId: auteur.id,
    niveauId: niveau.id,
    disciplineId: discipline.id,
    cdId: cd.id,
    connaissanceId: conn.id,
  };
}

/* -------------------------------------------------------------------------- */
/*  Idempotence — purge des seeds précédents                                   */
/* -------------------------------------------------------------------------- */

async function purgePreviousSeed(svc: SBClient): Promise<void> {
  // Purge tous les seeds marqués (tous auteurs confondus) — permet de re-router
  // le seed d'un compte à l'autre sans laisser de résidu.
  const { data: olds } = await svc
    .from("evaluations")
    .select("id")
    .like("description", `%${EVALUATION_TAG}%`);
  const oldIds = (olds ?? []).map((e) => e.id);
  if (oldIds.length === 0) return;

  const { data: oldTaches } = await svc
    .from("evaluation_tache")
    .select("tae_id")
    .in("evaluation_id", oldIds);
  const oldTaeIds = Array.from(new Set((oldTaches ?? []).map((r) => r.tae_id)));

  // Documents liés à ces tâches via tache_documents.
  const { data: docLinks } = await svc
    .from("tache_documents")
    .select("document_id")
    .in("tae_id", oldTaeIds.length > 0 ? oldTaeIds : ["00000000-0000-0000-0000-000000000000"]);
  const oldDocIds = Array.from(new Set((docLinks ?? []).map((r) => r.document_id)));

  await svc.from("evaluation_tache").delete().in("evaluation_id", oldIds);
  await svc.from("evaluations").delete().in("id", oldIds);

  if (oldTaeIds.length > 0) {
    await svc.from("tache_documents").delete().in("tae_id", oldTaeIds);
    await svc.from("tache").delete().in("id", oldTaeIds);
  }

  if (oldDocIds.length > 0) {
    await svc.from("documents").delete().in("id", oldDocIds);
  }

  console.log(
    `✓ Purge : ${oldIds.length} évaluation(s) + ${oldTaeIds.length} tâche(s) + ${oldDocIds.length} document(s) supprimés.`,
  );
}

/* -------------------------------------------------------------------------- */
/*  Builders documents                                                         */
/* -------------------------------------------------------------------------- */

type SeedDocSpec = {
  titre: string;
  contenu: string;
  source: string;
  repereTemporel?: string;
  anneeNormalisee?: number;
};

const PLACEHOLDER_SOURCE = "<p>Source ministérielle MEQ HEQ3 — placeholder seed.</p>";

function placeholderContent(intro: string): string {
  return `<p>${intro}</p><p><em>Contenu placeholder pour test d'acceptation — voir <code>docs/imports/EXTRACTION-EVAL-OI-CH1.md</code>.</em></p>`;
}

/* -------------------------------------------------------------------------- */
/*  Builders tâches NR                                                         */
/* -------------------------------------------------------------------------- */

type SeedTacheSpec = {
  oiId: string;
  comportementId: string;
  outilEvaluation: string;
  nbDocuments: number;
  consigneHtml: string;
  guidageHtml: string;
  corrigeHtml: string;
  nonRedactionData: Json;
  documents: SeedDocSpec[];
  // Slot ids attendus : doc_1 .. doc_N (numéro = index + 1)
};

/** Tâche 1 — OI1.1 ordre-chronologique (4 documents) — Q1 MEQ. */
function buildTacheOrdreChrono(): SeedTacheSpec {
  const payload: OrdreChronologiquePayload = {
    ...initialOrdreChronologiquePayload(),
    consigneTheme:
      "l'établissement de différents groupes humains sur le territoire du Canada actuel",
    optionA: [4, 2, 3, 1],
    optionB: [2, 4, 3, 1],
    optionC: [4, 1, 3, 2],
    optionD: [1, 4, 3, 2],
    correctLetter: "A",
    optionsJustification:
      "La séquence chronologique correcte est 4 (Béringie, ~-30 000) → 2 (lac Mégantic, ~-10 000) → 3 (Inuit, ~-4 000) → 1 (vikings, ~1000).",
  };
  return {
    oiId: "OI1",
    comportementId: "1.1",
    outilEvaluation: "OI1_SO1",
    nbDocuments: 4,
    consigneHtml: buildOrdreChronologiqueConsigneHtml(payload),
    guidageHtml: buildOrdreChronologiqueGuidageHtml(),
    corrigeHtml: buildOrdreChronologiqueCorrigeHtml(payload),
    nonRedactionData: { type: "ordre-chronologique", payload } as unknown as Json,
    documents: [
      {
        titre: "Établissement viking à Terre-Neuve",
        contenu: placeholderContent(
          "Vers l'an 1000, des Vikings provenant du Groenland fondent un établissement temporaire à L'Anse aux Meadows, Terre-Neuve.",
        ),
        source: PLACEHOLDER_SOURCE,
        repereTemporel: "Vers 1000",
        anneeNormalisee: 1000,
      },
      {
        titre: "Arrivée d'un premier groupe humain — région du lac Mégantic",
        contenu: placeholderContent(
          "Vers -10 000, après la fonte des glaciers, des chasseurs-cueilleurs s'établissent dans la région du lac Mégantic pour la chasse au caribou.",
        ),
        source: PLACEHOLDER_SOURCE,
        repereTemporel: "Vers -10 000",
        anneeNormalisee: -10000,
      },
      {
        titre: "Migrations des ancêtres des Inuit",
        contenu: placeholderContent(
          "Les ancêtres des Inuit migrent vers le Nord canadien à partir de l'Alaska, en plusieurs vagues centrées autour de -4 000.",
        ),
        source: PLACEHOLDER_SOURCE,
        repereTemporel: "Vers -4 000",
        anneeNormalisee: -4000,
      },
      {
        titre: "Traversée de la Béringie",
        contenu: placeholderContent(
          "Selon Olive Patricia Dickason, des groupes humains traversent la Béringie il y a environ 30 000 ans.",
        ),
        source: PLACEHOLDER_SOURCE,
        repereTemporel: "Vers -30 000",
        anneeNormalisee: -30000,
      },
    ],
  };
}

/** Tâche 2 — OI1.2 ligne-du-temps (1 document cible) — Q12 MEQ. */
function buildTacheLigneDuTemps(): SeedTacheSpec {
  const payload: LigneDuTempsPayload = {
    ...initialLigneDuTempsPayload(),
    segmentCount: 3,
    boundaries: [-12000, -10000, 1000, 1500],
    correctLetter: "B",
  };
  return {
    oiId: "OI1",
    comportementId: "1.2",
    outilEvaluation: "OI1_SO2",
    nbDocuments: 1,
    consigneHtml: buildLigneDuTempsConsigneHtml(payload),
    guidageHtml: buildLigneDuTempsGuidageHtml(),
    corrigeHtml: buildLigneDuTempsCorrigeHtml(payload),
    nonRedactionData: { type: "ligne-du-temps", payload } as unknown as Json,
    documents: [
      {
        titre: "Premier établissement humain au lac Mégantic",
        contenu: placeholderContent(
          "Trace archéologique d'un campement de chasseurs-cueilleurs dans la région du lac Mégantic, datée d'environ -10 000.",
        ),
        source: PLACEHOLDER_SOURCE,
        repereTemporel: "Vers -10 000",
        anneeNormalisee: -10000,
      },
    ],
  };
}

/** Tâche 3 — OI1.3 avant-apres synthétique (4 documents) — pas dans MEQ Ch.1. */
function buildTacheAvantApres(): SeedTacheSpec {
  const payload: AvantApresPayload = {
    ...initialAvantApresPayload(),
    theme: "le commerce des fourrures dans la vallée du Saint-Laurent",
    repere: "Première rencontre durable entre Européens et Premières Nations",
    anneeRepere: 1500,
    overrides: {},
    optionRows: [
      {
        letter: "A",
        avantSlots: ["doc_1", "doc_2"],
        apresSlots: ["doc_3", "doc_4"],
      },
      {
        letter: "B",
        avantSlots: ["doc_1", "doc_3"],
        apresSlots: ["doc_2", "doc_4"],
      },
      {
        letter: "C",
        avantSlots: ["doc_2", "doc_3"],
        apresSlots: ["doc_1", "doc_4"],
      },
      {
        letter: "D",
        avantSlots: ["doc_1", "doc_4"],
        apresSlots: ["doc_2", "doc_3"],
      },
    ],
    correctLetter: "A",
    justification:
      "Avant 1500 : réseaux d'échange autochtones traditionnels (doc 1 et 2). Après 1500 : intégration des produits européens et postes de traite (doc 3 et 4).",
    generated: true,
  };
  return {
    oiId: "OI1",
    comportementId: "1.3",
    outilEvaluation: "OI1_SO3",
    nbDocuments: 4,
    consigneHtml: buildAvantApresConsigneHtml(payload),
    guidageHtml: buildAvantApresGuidageHtml(),
    corrigeHtml: buildAvantApresCorrigeHtml(payload),
    nonRedactionData: { type: "avant-apres", payload } as unknown as Json,
    documents: [
      {
        titre: "Réseaux d'échange autochtones précolombiens",
        contenu: placeholderContent(
          "Les Premières Nations échangent des biens (cuivre, coquillages, peaux) selon des routes commerciales millénaires.",
        ),
        source: PLACEHOLDER_SOURCE,
        repereTemporel: "Vers -500",
        anneeNormalisee: -500,
      },
      {
        titre: "Tradition orale et alliances entre nations",
        contenu: placeholderContent(
          "Avant l'arrivée des Européens, les alliances entre nations sont scellées par échange de wampums et conseils.",
        ),
        source: PLACEHOLDER_SOURCE,
        repereTemporel: "Vers 1400",
        anneeNormalisee: 1400,
      },
      {
        titre: "Produits européens dans les réseaux autochtones",
        contenu: placeholderContent(
          "Au XVIIe siècle, des objets européens (haches de fer, perles de verre) circulent dans les réseaux d'échange autochtones, modifiant la dynamique commerciale.",
        ),
        source: PLACEHOLDER_SOURCE,
        repereTemporel: "Vers 1620",
        anneeNormalisee: 1620,
      },
      {
        titre: "Poste de traite de Tadoussac",
        contenu: placeholderContent(
          "Le poste de Tadoussac, fondé en 1600, devient un point central du commerce des fourrures entre Français et nations innues.",
        ),
        source: PLACEHOLDER_SOURCE,
        repereTemporel: "Vers 1600",
        anneeNormalisee: 1600,
      },
    ],
  };
}

/** Tâche 4 — OI2.3 carte-historique (1 document) — Q5 MEQ. */
function buildTacheCarteHistorique(): SeedTacheSpec {
  const payload: CarteHistoriquePayload = {
    ...initialCarteHistoriquePayload("2.3"),
    consigneElement1: "au territoire occupé par la famille linguistique algonquienne",
    consigneElement2: "au territoire occupé par la famille linguistique iroquoienne",
    correctLetter1: "A",
    correctLetter2: "C",
  };
  return {
    oiId: "OI2",
    comportementId: "2.3",
    outilEvaluation: "OI2_SO3",
    nbDocuments: 1,
    consigneHtml: buildCarteHistoriqueConsigneHtml(payload),
    guidageHtml: "",
    corrigeHtml: buildCarteHistoriqueCorrigeHtml(payload),
    nonRedactionData: { type: "carte-historique", payload } as unknown as Json,
    documents: [
      {
        titre: "Carte des territoires occupés par familles linguistiques",
        contenu: placeholderContent(
          "Carte schématique des territoires occupés par les familles linguistiques algonquienne et iroquoienne au tournant du XVIe siècle.",
        ),
        source: PLACEHOLDER_SOURCE,
      },
    ],
  };
}

/** Tâche 5 — OI5.2 manifestations 2-categories × 2 docs (4 documents) — Q3 MEQ. */
function buildTacheManifestations(): SeedTacheSpec {
  const payload: ManifestationsPayload = {
    ...initialManifestationsPayload("5.2"),
    consigneSujet: "aux Premières Nations des familles linguistiques algonquienne et iroquoienne",
    organisationCategories: "2-categories",
    categories: ["Famille algonquienne", "Famille iroquoienne"],
    associations: [
      [2, 3], // Algonquienne : doc 2 (wigwam) + doc 3 (vastes territoires)
      [1, 4], // Iroquoienne : doc 1 (trois sœurs) + doc 4 (organisation)
    ],
  };
  return {
    oiId: "OI5",
    comportementId: "5.2",
    outilEvaluation: "OI5_SO2",
    nbDocuments: 4,
    consigneHtml: buildManifestationsConsigneHtml(payload),
    guidageHtml: "",
    corrigeHtml: buildManifestationsCorrigeHtml(payload),
    nonRedactionData: { type: "manifestations", payload } as unknown as Json,
    documents: [
      {
        titre: "La culture des trois sœurs",
        contenu: placeholderContent(
          "Les Premières Nations iroquoiennes cultivent ensemble maïs, haricot et courge — la « triade » nourricière.",
        ),
        source: PLACEHOLDER_SOURCE,
      },
      {
        titre: "Un wigwam mi'gmaq",
        contenu: placeholderContent(
          "Habitation conique démontable couverte d'écorces de bouleau, adaptée aux déplacements des nations algonquiennes.",
        ),
        source: PLACEHOLDER_SOURCE,
      },
      {
        titre: "Exploitation de vastes territoires",
        contenu: placeholderContent(
          "Les nations algonquiennes exploitent saisonnièrement de vastes territoires de chasse et de pêche.",
        ),
        source: PLACEHOLDER_SOURCE,
      },
      {
        titre: "Une organisation sociale (Iroquoiens)",
        contenu: placeholderContent(
          "L'organisation sociale iroquoienne est sédentaire, matrilinéaire et regroupée en villages palissadés.",
        ),
        source: PLACEHOLDER_SOURCE,
      },
    ],
  };
}

/** Tâche 6 — OI4.4 causes-consequences (2 documents) — Q4 MEQ. */
function buildTacheCausesConsequences(): SeedTacheSpec {
  const payload: CausesConsequencesPayload = {
    ...initialCausesConsequencesPayload("4.4"),
    consigneSujet: "du mode de vie nomade des Premières Nations algonquiennes vers 1500",
    associations: [1, 2], // Cause = doc 1, Conséquence = doc 2
  };
  return {
    oiId: "OI4",
    comportementId: "4.4",
    outilEvaluation: "OI4_SO4",
    nbDocuments: 2,
    consigneHtml: buildCausesConsequencesConsigneHtml(payload),
    guidageHtml: "",
    corrigeHtml: buildCausesConsequencesCorrigeHtml(payload),
    nonRedactionData: { type: "causes-consequences", payload } as unknown as Json,
    documents: [
      {
        titre: "Activités économiques des Premières Nations du Bouclier canadien",
        contenu: placeholderContent(
          "Les ressources étant dispersées sur de vastes territoires (gibier, poisson, baies saisonnières), les nations algonquiennes adoptent un mode de vie nomade pour suivre leur cycle de prélèvement.",
        ),
        source: PLACEHOLDER_SOURCE,
      },
      {
        titre: "Une organisation sociale flexible",
        contenu: placeholderContent(
          "Le nomadisme entraîne une organisation sociale en petites bandes mobiles, où les décisions se prennent par consensus et où l'autorité est distribuée selon les compétences plutôt que héritée.",
        ),
        source: PLACEHOLDER_SOURCE,
      },
    ],
  };
}

/* -------------------------------------------------------------------------- */
/*  Création d'une tâche via INSERT direct (bypass RLS via service role)       */
/*                                                                             */
/*  Note : la RPC `publish_tache_transaction` est volontairement contournée    */
/*  car elle référence une colonne `documents.print_impression_scale` droppée  */
/*  par la migration `20260416120000_drop_documents_print_impression_scale.sql`*/
/*  (régression réintroduite par les migrations 20260422185919 / 20260423110000*/
/*  qui ont recréé la RPC avec la ligne fautive). Pour un seed de test,        */
/*  l'INSERT direct est plus simple et n'oblige pas à publier une migration    */
/*  corrective.                                                                */
/* -------------------------------------------------------------------------- */

async function createTache(svc: SBClient, spec: SeedTacheSpec, refs: RefIds): Promise<string> {
  // 1. Insérer les N documents historiques
  const docIds: string[] = [];
  for (const d of spec.documents) {
    const elements = [
      {
        type: "textuel",
        id: `elem-${Math.random().toString(36).slice(2, 10)}`,
        contenu: d.contenu,
        source: d.source,
        sourceType: "primaire",
        categorieTextuelle: "autre",
      },
    ];
    const { data, error } = await svc
      .from("documents")
      .insert({
        auteur_id: refs.auteurId,
        titre: d.titre,
        type: "textuel",
        structure: "simple",
        elements: elements as unknown as Json,
        repere_temporel: d.repereTemporel ?? null,
        annee_normalisee: d.anneeNormalisee ?? null,
        niveaux_ids: [refs.niveauId],
        disciplines_ids: [refs.disciplineId],
        aspects_societe: ["Social"],
        connaissances_ids: [refs.connaissanceId],
        is_published: false,
      })
      .select("id")
      .single();
    if (error || !data) throw new Error(`INSERT document échoué : ${error?.message}`);
    docIds.push(data.id);
  }

  // 2. Insérer la tâche
  const { data: tache, error: tacheErr } = await svc
    .from("tache")
    .insert({
      auteur_id: refs.auteurId,
      conception_mode: "seul",
      oi_id: spec.oiId,
      comportement_id: spec.comportementId,
      cd_id: refs.cdId,
      connaissances_ids: [refs.connaissanceId],
      consigne: spec.consigneHtml,
      guidage: spec.guidageHtml || null,
      corrige: spec.corrigeHtml || null,
      nb_lignes: 0,
      non_redaction_data: spec.nonRedactionData,
      niveau_id: refs.niveauId,
      discipline_id: refs.disciplineId,
      aspects_societe: ["Social"],
      is_published: true,
    })
    .select("id")
    .single();
  if (tacheErr || !tache) throw new Error(`INSERT tache échoué : ${tacheErr?.message}`);

  // 3. Lier les documents à la tâche via tache_documents
  const links = docIds.map((doc_id, i) => ({
    tae_id: tache.id,
    document_id: doc_id,
    slot: `doc_${i + 1}`,
    ordre: i,
  }));
  const { error: linkErr } = await svc.from("tache_documents").insert(links);
  if (linkErr) throw new Error(`INSERT tache_documents échoué : ${linkErr.message}`);

  return tache.id;
}

/* -------------------------------------------------------------------------- */
/*  Création de l'épreuve                                                      */
/* -------------------------------------------------------------------------- */

async function createEvaluation(
  client: SBClient,
  refs: RefIds,
  tacheIds: string[],
): Promise<string> {
  const description = `${EVALUATION_DESCRIPTION}\n\n${EVALUATION_TAG}`;
  const { data: ev, error: evErr } = await client
    .from("evaluations")
    .insert({
      auteur_id: refs.auteurId,
      titre: EVALUATION_TITRE,
      description,
      is_published: true,
    })
    .select("id")
    .single();
  if (evErr || !ev) throw new Error(`Création évaluation échouée : ${evErr?.message}`);

  const rows = tacheIds.map((tae_id, i) => ({
    evaluation_id: ev.id,
    tae_id,
    ordre: i,
  }));
  const { error: linkErr } = await client.from("evaluation_tache").insert(rows);
  if (linkErr) throw new Error(`Liens evaluation_tache échoués : ${linkErr.message}`);

  return ev.id;
}

/* -------------------------------------------------------------------------- */
/*  main                                                                       */
/* -------------------------------------------------------------------------- */

async function main(): Promise<void> {
  console.log("=== Seed épreuve MEQ Ch.1 (test NR) ===\n");

  const svc = serviceClient();
  const refs = await lookupRefIds(svc, AUTHOR_EMAIL);
  console.log(`Auteur : ${AUTHOR_EMAIL} (${refs.auteurId.slice(0, 8)}…)`);
  console.log(
    `Référentiels : niveau=${refs.niveauId} (${NIVEAU_CODE}), discipline=${refs.disciplineId} (${DISCIPLINE_CODE}), cd=${refs.cdId}, conn=${refs.connaissanceId}\n`,
  );

  await purgePreviousSeed(svc);

  const taskBuilders: { name: string; build: () => SeedTacheSpec }[] = [
    { name: "ordre-chronologique (OI1.1)", build: buildTacheOrdreChrono },
    { name: "ligne-du-temps (OI1.2)", build: buildTacheLigneDuTemps },
    { name: "avant-apres (OI1.3)", build: buildTacheAvantApres },
    { name: "carte-historique (OI2.3)", build: buildTacheCarteHistorique },
    { name: "manifestations (OI5.2)", build: buildTacheManifestations },
    { name: "causes-consequences (OI4.4)", build: buildTacheCausesConsequences },
  ];

  const tacheIds: string[] = [];
  for (const { name, build } of taskBuilders) {
    process.stdout.write(`→ ${name}…`);
    const spec = build();
    const id = await createTache(svc, spec, refs);
    tacheIds.push(id);
    console.log(` OK (${id.slice(0, 8)}…)`);
  }

  const evId = await createEvaluation(svc, refs, tacheIds);
  console.log(`\n✓ Épreuve créée : ${evId}`);
  console.log(`  URL fiche  : ${SUPABASE_URL.replace(".supabase.co", "")} (locale)`);
  console.log(`  Pour visualiser : http://localhost:3000/evaluations/${evId}`);
  console.log(`\n6 tâches publiées sous ${AUTHOR_EMAIL} :`);
  taskBuilders.forEach((b, i) => {
    console.log(`  ${i + 1}. ${b.name} — http://localhost:3000/questions/${tacheIds[i]}`);
  });
  console.log("\nTerminé.\n");
}

main().catch((err) => {
  console.error("\n✗ Erreur :", err instanceof Error ? err.message : err);
  process.exit(1);
});
