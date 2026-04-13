import { readFile } from "fs/promises";
import path from "path";
import type { SupabaseClient } from "@supabase/supabase-js";

import { parseCategorieTextuelle } from "@/lib/documents/categorie-textuelle";
import { parseTypeIconographique } from "@/lib/documents/type-iconographique";
import type { AutonomousDocumentFormValues } from "@/lib/schemas/autonomous-document";
import type { DocumentElementJson } from "@/lib/types/document-element-json";
import type { DisciplineCode, NiveauCode } from "@/lib/tae/blueprint-helpers";
import {
  connDataUrlForDiscipline,
  filterConnRowsByNiveau,
  parseConnJsonArray,
  rowToSelectionWithIds,
  type ConnRawRow,
} from "@/lib/tae/connaissances-helpers";
import { initialAspects, type AspectSocieteKey } from "@/lib/tae/redaction-helpers";
import type { Database } from "@/lib/types/database";

const ASPECT_DB_TO_KEY: Record<string, AspectSocieteKey> = {
  Économique: "economique",
  Politique: "politique",
  Social: "social",
  Culturel: "culturel",
  Territorial: "territorial",
};

async function loadConnRows(discipline: DisciplineCode): Promise<ConnRawRow[]> {
  const url = connDataUrlForDiscipline(discipline);
  if (!url) return [];
  const raw = await readFile(path.join(process.cwd(), "public", url.replace(/^\//, "")), "utf8");
  return parseConnJsonArray(JSON.parse(raw) as unknown, discipline);
}

type Client = SupabaseClient<Database>;

/**
 * Données formulaire pour `/documents/[id]/edit` — auteur uniquement.
 */
export async function loadAutonomousDocumentForEditForm(
  supabase: Client,
  documentId: string,
  userId: string,
): Promise<AutonomousDocumentFormValues | null> {
  const { data: doc, error } = await supabase
    .from("documents")
    .select(
      "id, titre, type, structure, elements, repere_temporel, annee_normalisee, auteur_id, niveaux_ids, disciplines_ids, connaissances_ids, aspects_societe",
    )
    .eq("id", documentId)
    .maybeSingle();
  if (error || !doc) return null;
  if (doc.auteur_id !== userId) return null;

  const niveauIds = doc.niveaux_ids ?? [];
  const discIds = doc.disciplines_ids ?? [];
  const niveauId = niveauIds[0];
  const disciplineId = discIds[0];
  if (niveauId == null || disciplineId == null) return null;

  const [nRes, dRes] = await Promise.all([
    supabase.from("niveaux").select("code").eq("id", niveauId).maybeSingle(),
    supabase.from("disciplines").select("code").eq("id", disciplineId).maybeSingle(),
  ]);
  const niveauCode = (nRes.data as { code?: string } | null)?.code ?? "";
  const discCodeUpper = (dRes.data as { code?: string } | null)?.code ?? "";
  const discipline = discCodeUpper.toLowerCase() as DisciplineCode;
  if (!niveauCode || !discipline) return null;

  const aspects = { ...initialAspects };
  for (const a of doc.aspects_societe ?? []) {
    const k = ASPECT_DB_TO_KEY[String(a)];
    if (k) aspects[k] = true;
  }

  const connaissances_miller: AutonomousDocumentFormValues["connaissances_miller"] = [];
  const connIds = doc.connaissances_ids ?? [];
  if (discipline !== "geo" && connIds.length > 0) {
    const { data: connDbRows } = await supabase
      .from("connaissances")
      .select("id, realite_sociale, section, sous_section, enonce")
      .in("id", connIds);
    const allConn = await loadConnRows(discipline);
    const filtered = filterConnRowsByNiveau(allConn, niveauCode as NiveauCode);
    const byKey = new Map<string, ConnRawRow>();
    for (const r of filtered) {
      const key = (rs: string) => `${rs}|${r.section}|${r.sous_section ?? ""}|${r.enonce}`;
      if (r.kind === "hqc") {
        const composite = `${r.periode} — ${r.realite_sociale}`;
        byKey.set(key(r.realite_sociale), r);
        byKey.set(key(composite), r);
      } else {
        byKey.set(key(r.realite_sociale), r);
      }
    }
    if (Array.isArray(connDbRows)) {
      for (const c of connDbRows) {
        const db = c as {
          realite_sociale: string;
          section: string;
          sous_section: string | null;
          enonce: string;
        };
        const key = `${db.realite_sociale}|${db.section}|${db.sous_section ?? ""}|${db.enonce}`;
        const match = byKey.get(key);
        if (match) connaissances_miller.push(rowToSelectionWithIds(match));
      }
    }
  }

  const structure =
    doc.structure === "perspectives"
      ? ("perspectives" as const)
      : doc.structure === "deux_temps"
        ? ("deux_temps" as const)
        : ("simple" as const);

  const rawElements = (Array.isArray(doc.elements) ? doc.elements : []) as DocumentElementJson[];
  const formElements = rawElements.map((el) => ({
    id: crypto.randomUUID(),
    type: el.type === "iconographique" ? ("iconographique" as const) : ("textuel" as const),
    contenu: el.contenu ?? "",
    image_url: el.image_url ?? "",
    image_intrinsic_width: undefined,
    image_intrinsic_height: undefined,
    source_citation: el.source_citation ?? "",
    source_type: el.source_type === "primaire" ? ("primaire" as const) : ("secondaire" as const),
    image_legende: el.image_legende ?? "",
    image_legende_position:
      (el.image_legende_position as
        | "haut_gauche"
        | "haut_droite"
        | "bas_gauche"
        | "bas_droite"
        | null) ?? null,
    type_iconographique: parseTypeIconographique(el.categorie_iconographique),
    categorie_textuelle: parseCategorieTextuelle(el.categorie_textuelle),
    auteur: el.auteur ?? "",
    repere_temporel: el.repere_temporel ?? "",
    sous_titre: el.sous_titre ?? "",
  }));

  return {
    structure,
    nb_perspectives: structure === "perspectives" ? (formElements.length as 2 | 3) : undefined,
    titre: doc.titre,
    elements:
      formElements.length > 0
        ? formElements
        : [
            {
              id: crypto.randomUUID(),
              type: "textuel" as const,
              contenu: "",
              image_url: "",
              image_intrinsic_width: undefined,
              image_intrinsic_height: undefined,
              source_citation: "",
              source_type: "secondaire" as const,
              image_legende: "",
              image_legende_position: null,
              type_iconographique: null,
              categorie_textuelle: null,
              auteur: "",
              repere_temporel: "",
              sous_titre: "",
            },
          ],
    repere_temporel: doc.repere_temporel ?? "",
    annee_normalisee: doc.annee_normalisee,
    niveau_id: niveauId,
    discipline_id: disciplineId,
    connaissances_miller,
    aspects,
    legal_accepted: true,
  };
}
