/**
 * Transformation pure `epreuveVersPaginee` — print-engine v2.1 §4.4 / D3.
 *
 * Centralise :
 * - Renumérotation globale des documents
 * - Résolution des placeholders `{{doc_A}}` dans consignes et guidages
 * - Composition par mode (formatif / sommatif-standard / épreuve-ministérielle)
 * - Application du flag `estCorrige`
 * - Règles de visibilité (guidage et titres de documents)
 */

import type { DonneesTache, DocumentReference, Guidage } from "@/lib/tache/contrats/donnees";
import type { DonneesEpreuve } from "@/lib/epreuve/contrats/donnees";
import type {
  ModeImpression,
  TypeFeuillet,
  Bloc,
  BlocMesure,
  Page,
  EpreuvePaginee,
} from "@/lib/epreuve/pagination/types";
import { mesurerBloc, verifierDebordement, paginer } from "@/lib/epreuve/pagination/pager";
import type { Mesureur } from "@/lib/epreuve/pagination/pager";
import { estGuidageVisible, estTitreDocumentVisible } from "./regles-visibilite";
import { aplatirDocumentsAvecNumeros, resoudreReferencesDocuments } from "./renumerotation";

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

/** Applique les règles de visibilité sur un document. */
function appliquerVisibiliteDocument(
  doc: DocumentReference,
  mode: ModeImpression,
): DocumentReference {
  if (estTitreDocumentVisible(mode)) return doc;
  return { ...doc, titre: "" };
}

/** Applique la visibilité du guidage selon le mode. */
function appliquerVisibiliteGuidage(guidage: Guidage, mode: ModeImpression): Guidage {
  if (estGuidageVisible(mode)) return guidage;
  return null;
}

/* -------------------------------------------------------------------------- */
/*  Construction des blocs par feuillet                                       */
/* -------------------------------------------------------------------------- */

/** Construit les blocs du dossier documentaire (tous les documents, numérotés). */
function construireBlocsDossierDocumentaire(
  taches: TacheImpression[],
  mode: ModeImpression,
): Bloc[] {
  const docsNumerotes = aplatirDocumentsAvecNumeros(taches);
  return docsNumerotes.map((dn, i) => ({
    id: genererIdBloc("dossier-documentaire", i),
    kind: "document" as const,
    content: {
      numeroGlobal: dn.numeroGlobal,
      document: appliquerVisibiliteDocument(dn.document, mode),
    },
  }));
}

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

/** Construit les blocs du questionnaire (un quadruplet par tâche, + corrigé si flag actif). */
function construireBlocsQuestionnaire(
  taches: TacheImpression[],
  mode: ModeImpression,
  estCorrige: boolean,
): Bloc[] {
  const blocs: Bloc[] = [];

  taches.forEach((tache, i) => {
    const { consigne, guidage } = resoudreRefsDansTache(tache, taches);
    const guidageVisible = appliquerVisibiliteGuidage(guidage, mode);

    const contenu: ContenuQuadruplet = {
      tacheIndex: i,
      titre: tache.titre,
      consigne,
      guidage: guidageVisible,
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

/**
 * Retourne les feuillets actifs et leurs blocs selon le mode d'impression.
 *
 * - formatif : questionnaire seul (docs inline avec les tâches)
 * - sommatif-standard : dossier-documentaire + questionnaire
 * - épreuve-ministérielle : dossier-documentaire + questionnaire + cahier-reponses
 */
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

/**
 * Calcule une empreinte déterministe du contenu paginé.
 * Utilise un hash simple basé sur JSON.stringify (suffisant au MVP,
 * sha256 sera ajouté avec l'infrastructure D4).
 */
function calculerEmpreinte(epreuve: DonneesEpreuve, options: OptionsRendu): string {
  const payload = JSON.stringify({
    id: epreuve.id,
    taches: epreuve.taches.map((t) => t.id),
    mode: options.mode,
    estCorrige: options.estCorrige,
  });
  // Hash simple FNV-1a 32 bits — suffisant pour la détection de changement
  let hash = 0x811c9dc5;
  for (let i = 0; i < payload.length; i++) {
    hash ^= payload.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

/* -------------------------------------------------------------------------- */
/*  Fonction principale                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Transforme une `DonneesEpreuve` en `EpreuvePaginee` prête pour le rendu.
 *
 * Fonction pure : pas d'effet de bord, pas de DOM, pas d'I/O.
 * Le `mesureur` est injecté pour permettre le test avec des hauteurs mockées
 * et l'utilisation côté client (offscreen DOM) ou serveur (Puppeteer).
 */
export function epreuveVersPaginee(
  epreuve: DonneesEpreuve,
  options: OptionsRendu,
  mesureur: Mesureur,
): EpreuvePaginee {
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

  // 3. Vérifier le débordement (aplatir tous les feuillets)
  const tousLesBlocs = [
    ...blocsMesuresParFeuillet["dossier-documentaire"],
    ...blocsMesuresParFeuillet["questionnaire"],
    ...blocsMesuresParFeuillet["cahier-reponses"],
  ];
  const erreur = verifierDebordement(tousLesBlocs);
  if (erreur) {
    return { ok: false, erreur };
  }

  // 4. Paginer chaque feuillet
  const feuillets: Record<TypeFeuillet, Page[]> = {
    "dossier-documentaire": paginer(
      blocsMesuresParFeuillet["dossier-documentaire"],
      "dossier-documentaire",
    ),
    questionnaire: paginer(blocsMesuresParFeuillet["questionnaire"], "questionnaire"),
    "cahier-reponses": paginer(blocsMesuresParFeuillet["cahier-reponses"], "cahier-reponses"),
  };

  // 5. Calculer l'empreinte
  const empreinte = calculerEmpreinte(epreuve, options);

  return {
    ok: true,
    empreinte,
    enTete: epreuve.enTete,
    feuillets,
  };
}
