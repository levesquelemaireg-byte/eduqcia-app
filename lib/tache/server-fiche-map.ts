/**
 * Mappe les lignes Supabase → `TacheFicheData` pour la page lecture.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  ConnaissanceSelection,
  DocumentFiche,
  PeerVoteTally,
  TacheFicheData,
} from "@/lib/types/fiche";
import type { DocumentSlotId } from "@/lib/tache/blueprint-helpers";
import { canonicalOiIcone } from "@/lib/tache/oi-canonical";
import { parseDocumentLegendPosition } from "@/lib/tache/document-helpers";
import {
  getDocumentCategorieTextuelle,
  documentCategorieIconographiqueLabel,
} from "@/lib/tache/document-categories-helpers";
import { sortAuteursByFamilyName } from "@/lib/tache/auteur-display-sort";
import { getVariantSlugForComportementId } from "@/lib/tache/non-redaction/registry";
import { hydrateRendererDocument } from "@/lib/documents/hydrate-renderer-document";
import type { Database } from "@/lib/types/database";
import type { DocumentElementJson } from "@/lib/types/document-element-json";

type TacheRow = {
  id: string;
  auteur_id: string;
  consigne: string | null;
  guidage: string | null;
  corrige: string | null;
  nb_lignes: number | null;
  oi_id: string | null;
  comportement_id: string | null;
  niveau_id: number | null;
  discipline_id: number | null;
  aspects_societe: string[] | null;
  cd_id: number | null;
  connaissances_ids: number[];
  version: number;
  version_updated_at: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

const ASPECT_LABEL: Record<string, string> = {
  economique: "Économique",
  politique: "Politique",
  social: "Social",
  culturel: "Culturel",
  territorial: "Territorial",
};

const SLOT_ORDER: DocumentSlotId[] = ["doc_A", "doc_B", "doc_C", "doc_D"];

function slotLetterFromSlot(slot: string): "A" | "B" | "C" | "D" {
  if (slot === "doc_A") return "A";
  if (slot === "doc_B") return "B";
  if (slot === "doc_C") return "C";
  return "D";
}

export async function fetchTacheFicheBundle(
  supabase: SupabaseClient,
  id: string,
): Promise<{ fiche: TacheFicheData; votes: PeerVoteTally | null } | null> {
  const { data: raw, error } = await supabase
    .from("tache")
    .select(
      "id, auteur_id, consigne, guidage, corrige, nb_lignes, oi_id, comportement_id, niveau_id, discipline_id, cd_id, connaissances_ids, aspects_societe, version, version_updated_at, is_published, created_at, updated_at",
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !raw) return null;
  const t = raw as unknown as TacheRow;

  const [auteurRes, oiRes, compRes, niveauRes, discRes, cdRes, collabRes, docLinksRes, voteRes] =
    await Promise.all([
      supabase.from("profiles").select("first_name, last_name").eq("id", t.auteur_id).maybeSingle(),
      t.oi_id
        ? supabase.from("oi").select("id, titre, icone").eq("id", t.oi_id).maybeSingle()
        : Promise.resolve({ data: null }),
      t.comportement_id
        ? supabase
            .from("comportements")
            .select("id, enonce, outil_evaluation")
            .eq("id", t.comportement_id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
      t.niveau_id
        ? supabase.from("niveaux").select("label").eq("id", t.niveau_id).maybeSingle()
        : Promise.resolve({ data: null }),
      t.discipline_id
        ? supabase.from("disciplines").select("label").eq("id", t.discipline_id).maybeSingle()
        : Promise.resolve({ data: null }),
      t.cd_id
        ? supabase
            .from("cd")
            .select("competence, composante, critere")
            .eq("id", t.cd_id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
      supabase.from("tache_collaborateurs").select("user_id").eq("tae_id", id),
      supabase.from("tache_documents").select("slot, document_id").eq("tae_id", id),
      supabase
        .from("vote_counts")
        .select(
          "tae_id, tae_version, rigueur_n1, rigueur_n2, rigueur_n3, clarte_n1, clarte_n2, clarte_n3, alignement_n1, alignement_n2, alignement_n3, total_votants",
        )
        .eq("tae_id", id)
        .eq("tae_version", t.version)
        .maybeSingle(),
    ]);

  const auteurs: { id: string; first_name: string; last_name: string }[] = [];
  if (auteurRes.data && "first_name" in auteurRes.data) {
    auteurs.push({
      id: t.auteur_id,
      first_name: String(auteurRes.data.first_name ?? ""),
      last_name: String(auteurRes.data.last_name ?? ""),
    });
  }

  const collabIds =
    collabRes.data
      ?.map((c: { user_id: string }) => c.user_id)
      .filter((uid: string) => uid !== t.auteur_id) ?? [];
  if (collabIds.length > 0) {
    const { data: collabProfiles } = await supabase
      .from("profiles")
      .select("id, first_name, last_name")
      .in("id", collabIds);
    if (Array.isArray(collabProfiles)) {
      for (const p of collabProfiles) {
        const row = p as { id: string; first_name: string; last_name: string };
        auteurs.push({ id: row.id, first_name: row.first_name, last_name: row.last_name });
      }
    }
  }

  const auteursSorted = sortAuteursByFamilyName(auteurs);

  const aspects_societe = (t.aspects_societe ?? [])
    .map((k) => ASPECT_LABEL[k] ?? k)
    .filter(Boolean);

  const documents: DocumentFiche[] = [];
  const links = docLinksRes.data as { slot: string; document_id: string }[] | null;
  const docIds = links?.map((l) => l.document_id) ?? [];
  type DocRow = Database["public"]["Tables"]["documents"]["Row"];

  const docById = new Map<string, DocRow>();

  if (docIds.length > 0) {
    const { data: docRows } = await supabase
      .from("documents")
      .select("id, titre, type, structure, elements, repere_temporel")
      .in("id", docIds);
    if (Array.isArray(docRows)) {
      for (const d of docRows as DocRow[]) {
        docById.set(d.id, d);
      }
    }
  }
  if (links) {
    const bySlot = new Map<string, DocumentFiche>();
    for (const l of links) {
      const d = docById.get(l.document_id);
      if (!d) continue;
      const rawElements = (Array.isArray(d.elements) ? d.elements : []) as DocumentElementJson[];
      const firstEl = rawElements[0];
      const contenu = firstEl?.contenu ?? "";
      const sourceCitation = firstEl?.source_citation ?? "";
      const imageUrl = firstEl?.image_url ?? null;
      const legendTrim = (firstEl?.image_legende ?? "").trim();
      const legendPos = parseDocumentLegendPosition(firstEl?.image_legende_position ?? null);
      const sourceType = firstEl?.source_type ?? undefined;
      const categorieLabel =
        firstEl?.type === "textuel" && firstEl.categorie_textuelle
          ? (getDocumentCategorieTextuelle(firstEl.categorie_textuelle)?.label ?? null)
          : firstEl?.type === "iconographique" && firstEl.categorie_iconographique
            ? (documentCategorieIconographiqueLabel(firstEl.categorie_iconographique) ?? null)
            : null;
      bySlot.set(l.slot, {
        letter: slotLetterFromSlot(l.slot),
        titre: d.titre,
        contenu,
        source_citation: sourceCitation,
        type: d.type === "iconographique" ? "iconographique" : "textuel",
        image_url: imageUrl,
        imagePixelWidth: null,
        imagePixelHeight: null,
        imageLegende: legendTrim.length > 0 ? legendTrim : null,
        imageLegendePosition: legendTrim.length > 0 && legendPos ? legendPos : null,
        rendererDocument: hydrateRendererDocument(d),
        sourceType,
        repereTemporel: d.repere_temporel ?? null,
        categorieLabel,
      });
    }
    for (const sid of SLOT_ORDER) {
      const found = bySlot.get(sid);
      if (found) documents.push(found);
    }
  }

  let connaissances: ConnaissanceSelection[] = [];
  if (t.connaissances_ids?.length) {
    const { data: connRows } = await supabase
      .from("connaissances")
      .select("realite_sociale, section, sous_section, enonce")
      .in("id", t.connaissances_ids);
    if (Array.isArray(connRows)) {
      connaissances = connRows.map((c) => {
        const row = c as {
          realite_sociale: string;
          section: string;
          sous_section: string | null;
          enonce: string;
        };
        return {
          realite_sociale: row.realite_sociale,
          section: row.section,
          sous_section: row.sous_section,
          enonce: row.enonce,
        };
      });
    }
  }

  const oiData = oiRes.data as { id: string; titre: string; icone: string | null } | null;
  const iconeFromJson = canonicalOiIcone(oiData?.id ?? t.oi_id);
  const oi: TacheFicheData["oi"] = oiData
    ? {
        id: oiData.id,
        titre: oiData.titre,
        icone: iconeFromJson ?? oiData.icone ?? "cognition",
      }
    : {
        id: t.oi_id ?? "",
        titre: "",
        icone: iconeFromJson ?? "cognition",
      };

  const compData = compRes.data as {
    id: string;
    enonce: string;
    outil_evaluation: string;
  } | null;
  const comportement: TacheFicheData["comportement"] = compData
    ? { id: compData.id, enonce: compData.enonce }
    : { id: t.comportement_id ?? "", enonce: "" };
  const outilEvaluation = compData?.outil_evaluation ?? null;

  const cdRow = cdRes.data as { competence: string; composante: string; critere: string } | null;
  const cd = cdRow
    ? { competence: cdRow.competence, composante: cdRow.composante, critere: cdRow.critere }
    : null;

  const nRow = niveauRes.data as { label: string } | null;
  const dRow = discRes.data as { label: string } | null;

  const variantSlug = getVariantSlugForComportementId(t.comportement_id ?? "");
  const showStudentAnswerLines = variantSlug === null;
  /** Parcours non rédactionnel : guidage élève affiché sur feuille par défaut ; `false` = masquer à l’impression (sommatif). */
  const showGuidageOnStudentSheet = variantSlug !== null ? true : undefined;
  const guidageHtml = t.guidage ?? "";

  const fiche: TacheFicheData = {
    id: t.id,
    auteur_id: t.auteur_id,
    auteurs: auteursSorted,
    consigne: t.consigne ?? "",
    guidage: guidageHtml,
    corrige: t.corrige ?? "",
    aspects_societe,
    nb_lignes: t.nb_lignes ?? 5,
    showStudentAnswerLines,
    showGuidageOnStudentSheet,
    niveau: { label: nRow?.label ?? "" },
    discipline: { label: dRow?.label ?? "" },
    oi,
    comportement,
    outilEvaluation,
    cd,
    connaissances,
    documents,
    version: t.version,
    version_updated_at: t.version_updated_at,
    is_published: t.is_published,
    created_at: t.created_at,
    updated_at: t.updated_at,
  };

  let votes: PeerVoteTally | null = null;
  const vr = voteRes.data as Record<string, unknown> | null;
  if (vr) {
    votes = {
      rigueur_n1: Number(vr.rigueur_n1 ?? 0),
      rigueur_n2: Number(vr.rigueur_n2 ?? 0),
      rigueur_n3: Number(vr.rigueur_n3 ?? 0),
      clarte_n1: Number(vr.clarte_n1 ?? 0),
      clarte_n2: Number(vr.clarte_n2 ?? 0),
      clarte_n3: Number(vr.clarte_n3 ?? 0),
      alignement_n1: Number(vr.alignement_n1 ?? 0),
      alignement_n2: Number(vr.alignement_n2 ?? 0),
      alignement_n3: Number(vr.alignement_n3 ?? 0),
      total_votants: Number(vr.total_votants ?? 0),
    };
  }

  return { fiche, votes };
}
