/**
 * Transformation pure `epreuveVersImprimable` — print-engine v2.1 §4.4 / D3.
 *
 * Refactorisé pour retourner `RenduImprimable` (type de sortie unifié).
 * Utilise `reglesVisibilite` de la couche 1 partagée.
 *
 * Centralise :
 * - Renumérotation globale des documents
 * - Résolution des placeholders `{{doc_N}}` (et `{{doc_A}}` legacy) dans consignes et guidages
 * - Composition par mode (formatif / sommatif-standard / épreuve-ministérielle)
 * - Application du flag `estCorrige`
 * - Règles de visibilité (guidage et titres de documents)
 */

import type { DonneesTache, Guidage } from "@/lib/tache/contrats/donnees";
import type { DonneesEpreuve } from "@/lib/epreuve/contrats/donnees";
import type {
  ModeImpression,
  TypeFeuillet,
  Bloc,
  BlocMesure,
  Page,
} from "@/lib/epreuve/pagination/types";
import { mesurerBloc, verifierDebordement, paginer } from "@/lib/epreuve/pagination/pager";
import type { Mesureur } from "@/lib/epreuve/pagination/pager";
import { reglesVisibilite } from "@/lib/impression/builders/regles-visibilite";
import { aplatirDocumentsAvecNumeros, resoudreReferencesDocuments } from "./renumerotation";
import type { RenduImprimable } from "@/lib/impression/types";

/* -------------------------------------------------------------------------- */
/*  Types publics                                                             */
/* -------------------------------------------------------------------------- */

export type OptionsRendu = {
  mode: ModeImpression;
  estCorrige: boolean;
};

export type { Mesureur } from "@/lib/epreuve/pagination/pager";

/**
 * Sous-ensemble de `DonneesTache` consommé par la transformation.
 * Défini comme `Pick` local — pas de type nommé séparé (cf. spec §D0).
 */
type TacheImpression = Pick<
  DonneesTache,
  | "id"
  | "titre"
  | "consigne"
  | "guidage"
  | "documents"
  | "espaceProduction"
  | "outilEvaluation"
  | "corrige"
>;

/* -------------------------------------------------------------------------- */
/*  Helpers internes                                                          */
/* -------------------------------------------------------------------------- */

function genererIdBloc(feuillet: TypeFeuillet, index: number, suffixe?: string): string {
  const base = `${feuillet}-${index}`;
  return suffixe ? `${base}-${suffixe}` : base;
}

/** Applique la résolution des refs doc dans la consigne et le guidage d'une tâche. */
function resoudreRefsDansTache(
  tache: TacheImpression,
  toutesLesTaches: Pick<DonneesTache, "documents">[],
): { consigne: string; guidage: Guidage } {
  const consigne = resoudreReferencesDocuments(tache.consigne, tache.documents, toutesLesTaches);

  const guidage: Guidage = tache.guidage
    ? {
        content: resoudreReferencesDocuments(
          tache.guidage.content,
          tache.documents,
          toutesLesTaches,
        ),
      }
    : null;

  return { consigne, guidage };
}

/* -------------------------------------------------------------------------- */
/*  Contenu des blocs (types exportés pour le renderer)                       */
/* -------------------------------------------------------------------------- */

/** Contenu d'un bloc quadruplet (consigne + guidage + espace de production + outil d'évaluation). */
export type ContenuQuadruplet = {
  tacheIndex: number;
  titre: string;
  consigne: string;
  guidage: Guidage;
  espaceProduction: DonneesTache["espaceProduction"];
  outilEvaluation: DonneesTache["outilEvaluation"];
};

/** Contenu d'un bloc corrigé. */
export type ContenuCorrige = {
  tacheIndex: number;
  titre: string;
  corrige: string;
  outilEvaluation: DonneesTache["outilEvaluation"];
};

/* -------------------------------------------------------------------------- */
/*  Construction des blocs par feuillet                                       */
/* -------------------------------------------------------------------------- */

/** Construit les blocs du dossier documentaire (tous les documents, numérotés). */
function construireBlocsDossierDocumentaire(
  taches: TacheImpression[],
  mode: ModeImpression,
): Bloc[] {
  const regles = reglesVisibilite(mode);
  const docsNumerotes = aplatirDocumentsAvecNumeros(taches);
  return docsNumerotes.map((dn, i) => ({
    id: genererIdBloc("dossier-documentaire", i),
    kind: "document" as const,
    content: {
      numeroGlobal: dn.numeroGlobal,
      document: regles.titresDocumentsVisibles ? dn.document : { ...dn.document, titre: "" },
    },
  }));
}

/** Construit les blocs du questionnaire (un quadruplet par tâche, + corrigé si flag actif). */
function construireBlocsQuestionnaire(
  taches: TacheImpression[],
  mode: ModeImpression,
  estCorrige: boolean,
): Bloc[] {
  const regles = reglesVisibilite(mode);
  const blocs: Bloc[] = [];

  taches.forEach((tache, i) => {
    const { consigne, guidage } = resoudreRefsDansTache(tache, taches);

    const contenu: ContenuQuadruplet = {
      tacheIndex: i,
      titre: tache.titre,
      consigne,
      guidage: regles.guidageVisible ? guidage : null,
      espaceProduction: tache.espaceProduction,
      outilEvaluation: tache.outilEvaluation,
    };

    blocs.push({
      id: genererIdBloc("questionnaire", i, "quadruplet"),
      kind: "quadruplet",
      tacheId: tache.id,
      content: contenu,
    });

    if (estCorrige && tache.corrige) {
      const contenuCorrige: ContenuCorrige = {
        tacheIndex: i,
        titre: tache.titre,
        corrige: resoudreReferencesDocuments(tache.corrige, tache.documents, taches),
        outilEvaluation: tache.outilEvaluation,
      };

      blocs.push({
        id: genererIdBloc("questionnaire", i, "corrige"),
        kind: "quadruplet",
        tacheId: tache.id,
        content: contenuCorrige,
      });
    }
  });

  return blocs;
}

/** Construit les blocs du cahier de réponses (espace de production seul, sans consigne). */
function construireBlocsCahierReponses(taches: TacheImpression[]): Bloc[] {
  return taches.map((tache, i) => ({
    id: genererIdBloc("cahier-reponses", i),
    kind: "quadruplet" as const,
    tacheId: tache.id,
    content: {
      tacheIndex: i,
      titre: tache.titre,
      espaceProduction: tache.espaceProduction,
    },
  }));
}

/* -------------------------------------------------------------------------- */
/*  Composition par mode                                                      */
/* -------------------------------------------------------------------------- */

function composerParMode(
  taches: TacheImpression[],
  options: OptionsRendu,
): Record<TypeFeuillet, Bloc[]> {
  const { mode, estCorrige } = options;

  switch (mode) {
    case "formatif":
      return {
        "dossier-documentaire": [],
        questionnaire: construireBlocsQuestionnaire(taches, mode, estCorrige),
        "cahier-reponses": [],
      };

    case "sommatif-standard":
      return {
        "dossier-documentaire": construireBlocsDossierDocumentaire(taches, mode),
        questionnaire: construireBlocsQuestionnaire(taches, mode, estCorrige),
        "cahier-reponses": [],
      };

    case "epreuve-ministerielle":
      return {
        "dossier-documentaire": construireBlocsDossierDocumentaire(taches, mode),
        questionnaire: construireBlocsQuestionnaire(taches, mode, estCorrige),
        "cahier-reponses": construireBlocsCahierReponses(taches),
      };
  }
}

/* -------------------------------------------------------------------------- */
/*  Empreinte                                                                 */
/* -------------------------------------------------------------------------- */

function calculerEmpreinte(epreuve: DonneesEpreuve, options: OptionsRendu): string {
  const payload = JSON.stringify({
    id: epreuve.id,
    taches: epreuve.taches.map((t) => t.id),
    mode: options.mode,
    estCorrige: options.estCorrige,
  });
  let hash = 0x811c9dc5;
  for (let i = 0; i < payload.length; i++) {
    hash ^= payload.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

/* -------------------------------------------------------------------------- */
/*  Ordre de concaténation des feuillets                                      */
/* -------------------------------------------------------------------------- */

const ORDRE_FEUILLETS: TypeFeuillet[] = [
  "dossier-documentaire",
  "questionnaire",
  "cahier-reponses",
];

/* -------------------------------------------------------------------------- */
/*  Fonction principale                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Transforme une `DonneesEpreuve` en `RenduImprimable` prêt pour le rendu.
 *
 * Fonction pure : pas d'effet de bord, pas de DOM, pas d'I/O.
 * Le `mesureur` est injecté pour permettre le test avec des hauteurs mockées
 * et l'utilisation côté client (offscreen DOM) ou serveur (Puppeteer).
 */
export function epreuveVersImprimable(
  epreuve: DonneesEpreuve,
  options: OptionsRendu,
  mesureur: Mesureur,
): RenduImprimable {
  // 1. Composer les blocs par feuillet selon le mode
  const blocsParFeuillet = composerParMode(epreuve.taches, options);

  // 2. Mesurer chaque bloc
  const blocsMesuresParFeuillet: Record<TypeFeuillet, BlocMesure[]> = {
    "dossier-documentaire": blocsParFeuillet["dossier-documentaire"].map((b) =>
      mesurerBloc(b, mesureur),
    ),
    questionnaire: blocsParFeuillet["questionnaire"].map((b) => mesurerBloc(b, mesureur)),
    "cahier-reponses": blocsParFeuillet["cahier-reponses"].map((b) => mesurerBloc(b, mesureur)),
  };

  // 3. Vérifier le débordement
  const tousLesBlocs = [
    ...blocsMesuresParFeuillet["dossier-documentaire"],
    ...blocsMesuresParFeuillet["questionnaire"],
    ...blocsMesuresParFeuillet["cahier-reponses"],
  ];
  const erreur = verifierDebordement(tousLesBlocs);
  if (erreur) {
    return { ok: false, erreur };
  }

  // 4. Paginer chaque feuillet puis aplatir en pages[]
  const pages: Page[] = [];
  for (const feuillet of ORDRE_FEUILLETS) {
    const pagesF = paginer(blocsMesuresParFeuillet[feuillet], feuillet);
    pages.push(...pagesF);
  }

  // 5. Renuméroter globalement les pages
  const totalPages = pages.length;
  pages.forEach((page, i) => {
    page.numeroPage = i + 1;
    page.totalPages = totalPages;
  });

  return {
    ok: true,
    empreinte: calculerEmpreinte(epreuve, options),
    contexte: { type: "epreuve", mode: options.mode, estCorrige: options.estCorrige },
    enTete: epreuve.enTete,
    pages,
  };
}

/**
 * Alias de rétrocompatibilité — les anciens appelants qui utilisent
 * `epreuveVersPaginee` continuent à fonctionner.
 *
 * @deprecated Utiliser `epreuveVersImprimable` directement.
 */
export const epreuveVersPaginee = epreuveVersImprimable;
