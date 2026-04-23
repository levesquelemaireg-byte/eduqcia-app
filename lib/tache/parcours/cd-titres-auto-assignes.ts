/**
 * Titres des compétences disciplinaires auto-assignables aux parcours (Schéma de
 * caractérisation, Interprétation). Dupliqué depuis `public/data/hec-cd.json`
 * et `public/data/hqc-cd.json` pour permettre un lookup synchrone dans les
 * selectors du Sommaire et au Bloc 6 sans dépendre d'un fetch async.
 *
 * À synchroniser manuellement si les référentiels ministériels changent.
 */
export const CD_TITRE_AUTO_ASSIGNEE: Record<string, string> = {
  "HEC-CD1": "Interroger les réalités sociales dans une perspective historique",
  "HEC-CD2": "Interpréter les réalités sociales à l’aide de la méthode historique",
  "HQC-CD1": "Caractériser une période de l’histoire du Québec et du Canada",
  "HQC-CD2": "Interpréter une réalité sociale",
};
