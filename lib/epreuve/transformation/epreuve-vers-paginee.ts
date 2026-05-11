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
 * - Overlay « corrigé simple » sur les fragments NR / lignes vierges
 *   (rédactionnel) + annexe optionnelle quand `corrige === "detaille"`
 *   (cf. spec §3.5, §7.5).
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
import { construireBlocsDossierPages } from "@/lib/impression/builders/blocs-dossier-pages";
import {
  aplatirDocumentsAvecNumeros,
  resoudreReferencesDocuments,
} from "@/lib/impression/renumerotation";
import { extraireFragmentsNR, type FragmentsNR } from "@/lib/impression/extraire-fragments-nr";
import { produireCorrigeSimpleNR } from "@/lib/impression/produire-corrige-simple";
import type { ModeCorrige, RenduImprimable } from "@/lib/impression/types";
import type { ContenuAnnexeCorrige } from "@/components/epreuve/impression/sections/annexe-corrige";

/* -------------------------------------------------------------------------- */
/*  Types publics                                                             */
/* -------------------------------------------------------------------------- */

export type OptionsRendu = {
  mode: ModeImpression;
  /** Mode du corrigé (spec §3.5). `null` = pas de corrigé. */
  corrige: ModeCorrige;
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

/**
 * Applique la résolution des refs doc dans la consigne, le guidage et le
 * corrigé d'une tâche.
 */
function resoudreRefsDansTache(
  tache: TacheImpression,
  toutesLesTaches: Pick<DonneesTache, "documents">[],
): { consigne: string; guidage: Guidage; corrige: string } {
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

  const corrige = resoudreReferencesDocuments(tache.corrige, tache.documents, toutesLesTaches);

  return { consigne, guidage, corrige };
}

/* -------------------------------------------------------------------------- */
/*  Contenu des blocs (types exportés pour le renderer)                       */
/* -------------------------------------------------------------------------- */

/** Contenu d'un bloc quadruplet (consigne + guidage + espace de production + outil d'évaluation). */
export type ContenuQuadruplet = {
  tacheIndex: number;
  titre: string;
  /** String pour les rédactionnels, `FragmentsNR` pour les NR (cf. spec §3.1). */
  consigne: string | FragmentsNR;
  guidage: Guidage;
  /** `null` pour les NR — la zone réponse vit dans `consigne` (FragmentsNR). */
  espaceProduction: DonneesTache["espaceProduction"];
  outilEvaluation: DonneesTache["outilEvaluation"];
  /**
   * Pour les rédactionnels avec corrigé : texte de la réponse attendue
   * positionné en rouge italique sur les lignes vierges. `null` sinon.
   * Les NR n'utilisent pas ce champ — l'overlay est déjà dans les fragments.
   */
  corrigeTexte: string | null;
};

/** Contenu d'un bloc cahier-réponses (espace réponse + grille, sans consigne). */
export type ContenuCahierReponses = {
  tacheIndex: number;
  titre: string;
  espaceProduction: DonneesTache["espaceProduction"];
  outilEvaluation: DonneesTache["outilEvaluation"];
};

/* -------------------------------------------------------------------------- */
/*  Construction des blocs par feuillet                                       */
/* -------------------------------------------------------------------------- */

/**
 * Construit les blocs du dossier documentaire — un bloc dossier-page par
 * page de la grille bicolonnée (placement délégué au layout engine).
 */
function construireBlocsDossierDocumentaire(
  taches: TacheImpression[],
  mode: ModeImpression,
): Bloc[] {
  const regles = reglesVisibilite(mode);
  const docsNumerotes = aplatirDocumentsAvecNumeros(taches);
  return construireBlocsDossierPages(
    docsNumerotes,
    { titresVisibles: regles.titresDocumentsVisibles },
    "dossier-documentaire",
  );
}

/**
 * Construit les blocs du questionnaire — un quadruplet par tâche, suivi
 * (uniquement si `corrige === "detaille"`) des blocs annexe « Notes du
 * correcteur » empilés en fin de feuillet.
 *
 * En mode formatif, chaque quadruplet est précédé des blocs dossier-page
 * de SES documents (numérotation locale 1..N par tâche — Phase 8b
 * correction 2). En sommatif/ministériel, les documents vivent dans
 * un feuillet `dossier-documentaire` séparé avec numérotation globale.
 *
 * Les placeholders `{{doc_X}}` dans les consignes/guidages/corrigés sont
 * résolus avec le bon scope : LOCAL ([tache]) en formatif, GLOBAL (taches) sinon.
 *
 * L'overlay corrigé simple (spec §3.5) est injecté directement dans le
 * `ContenuQuadruplet` (fragments NR modifiés en rouge ou `corrigeTexte`
 * positionné sur les lignes vierges) — aucun bloc corrigé séparé.
 */
function construireBlocsQuestionnaire(
  taches: TacheImpression[],
  mode: ModeImpression,
  corrige: ModeCorrige,
): Bloc[] {
  const regles = reglesVisibilite(mode);
  const blocs: Bloc[] = [];
  const formatif = mode === "formatif";

  const tachesResolues: { tache: TacheImpression; corrigeResolu: string }[] = [];

  taches.forEach((tache, i) => {
    // Scope de numérotation des `{{doc_X}}` : local en formatif, global ailleurs.
    const refsScope = formatif ? [tache] : taches;
    const {
      consigne: consigneResolue,
      guidage,
      corrige: corrigeResolu,
    } = resoudreRefsDansTache(tache, refsScope);

    tachesResolues.push({ tache, corrigeResolu });

    // Pour les NR, on découpe la consigne en fragments (intro/corps/reponse)
    // afin que le renderer puisse insérer le guidage entre intro et corps
    // (spec §3.2). Pour les rédactionnels, on garde le string tel quel.
    const fragments = extraireFragmentsNR(consigneResolue);
    const aCorrige = corrige !== null && corrigeResolu.trim().length > 0;

    let consigne: string | FragmentsNR;
    let corrigeTexte: string | null = null;
    if (fragments) {
      consigne = aCorrige ? produireCorrigeSimpleNR(fragments, corrigeResolu) : fragments;
    } else {
      consigne = consigneResolue;
      corrigeTexte = aCorrige ? corrigeResolu : null;
    }

    // En formatif : insérer les blocs dossier-page de la tâche AVANT son
    // quadruplet (documents intégrés à chaque question).
    if (formatif && tache.documents.length > 0) {
      const docsNumerotes = tache.documents.map((document, idx) => ({
        numeroGlobal: idx + 1,
        document,
      }));
      blocs.push(
        ...construireBlocsDossierPages(
          docsNumerotes,
          { titresVisibles: regles.titresDocumentsVisibles },
          `formatif-tache-${tache.id}-dossier`,
        ),
      );
    }

    const contenu: ContenuQuadruplet = {
      tacheIndex: i,
      titre: tache.titre,
      consigne,
      guidage: regles.guidageVisible ? guidage : null,
      espaceProduction: tache.espaceProduction,
      outilEvaluation: tache.outilEvaluation,
      corrigeTexte,
    };

    blocs.push({
      id: genererIdBloc("questionnaire", i, "quadruplet"),
      kind: "quadruplet",
      tacheId: tache.id,
      content: contenu,
    });
  });

  // Annexe « Notes du correcteur » — uniquement en mode détaillé.
  if (corrige === "detaille") {
    const entreesAvecCorrige = tachesResolues
      .map(({ tache, corrigeResolu }, index) => ({ tache, corrigeResolu, index }))
      .filter(({ corrigeResolu }) => corrigeResolu.trim().length > 0);
    if (entreesAvecCorrige.length > 0) {
      blocs.push({
        id: "questionnaire-annexe-titre",
        kind: "annexe-corrige",
        content: { type: "titre" } satisfies ContenuAnnexeCorrige,
      });
      for (const { tache, corrigeResolu, index } of entreesAvecCorrige) {
        blocs.push({
          id: `questionnaire-annexe-${tache.id}`,
          kind: "annexe-corrige",
          tacheId: tache.id,
          content: {
            type: "question",
            tacheIndex: index,
            corrige: corrigeResolu,
          } satisfies ContenuAnnexeCorrige,
        });
      }
    }
  }

  return blocs;
}

/**
 * Construit les blocs du cahier de réponses — épreuve ministérielle.
 *
 * Chaque bloc contient l'espace de production (lignes ou cases) et la
 * grille d'évaluation (qui apparaît AUSSI dans le questionnaire — voir
 * spec §7.4 : « la grille est aux deux endroits »). Pas de consigne.
 *
 * Résout Bug 7 : auparavant `outilEvaluation` n'était pas inclus, donc le
 * type guard du renderer retournait null pour ces blocs.
 */
function construireBlocsCahierReponses(taches: TacheImpression[]): Bloc[] {
  return taches.map((tache, i) => ({
    id: genererIdBloc("cahier-reponses", i),
    kind: "quadruplet" as const,
    tacheId: tache.id,
    content: {
      tacheIndex: i,
      titre: tache.titre,
      espaceProduction: tache.espaceProduction,
      outilEvaluation: tache.outilEvaluation,
    } satisfies ContenuCahierReponses,
  }));
}

/* -------------------------------------------------------------------------- */
/*  Composition par mode                                                      */
/* -------------------------------------------------------------------------- */

function composerParMode(
  taches: TacheImpression[],
  options: OptionsRendu,
): Record<TypeFeuillet, Bloc[]> {
  const { mode, corrige } = options;

  switch (mode) {
    case "formatif":
      return {
        "dossier-documentaire": [],
        questionnaire: construireBlocsQuestionnaire(taches, mode, corrige),
        "cahier-reponses": [],
      };

    case "sommatif-standard":
      return {
        "dossier-documentaire": construireBlocsDossierDocumentaire(taches, mode),
        questionnaire: construireBlocsQuestionnaire(taches, mode, corrige),
        "cahier-reponses": [],
      };

    case "epreuve-ministerielle":
      return {
        "dossier-documentaire": construireBlocsDossierDocumentaire(taches, mode),
        questionnaire: construireBlocsQuestionnaire(taches, mode, corrige),
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
    modeCorrige: options.corrige,
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
    contexte: { type: "epreuve", mode: options.mode, corrige: options.corrige },
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
