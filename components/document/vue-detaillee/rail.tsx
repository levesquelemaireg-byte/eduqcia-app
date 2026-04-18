import { MetaChip } from "@/lib/fiche/primitives/MetaChip";
import { ChipBar } from "@/lib/fiche/primitives/ChipBar";
import { MetaRowSimple } from "@/lib/fiche/primitives/MetaRow";
import { SectionRail, RailLayout } from "@/components/partagees/vue-detaillee/rail-layout";
import type { DocFicheData } from "@/lib/fiche/types";
import { ANCRAGE_TEMPOREL_LABEL } from "@/lib/ui/ui-copy";

type Props = {
  data: DocFicheData;
};

/**
 * Rail latéral pour la vue détaillée document.
 * Utilise uniquement les primitives existantes — aucune nouvelle primitive.
 */
export function DocumentRail({ data }: Props) {
  const hasRepere =
    data.document.repereTemporelDocument != null &&
    data.document.repereTemporelDocument.trim() !== "";

  return (
    <RailLayout>
      {/* Identité */}
      <SectionRail titre="Identité" estPremiere>
        <div className="space-y-1">
          <LigneMetadonnee
            label="Type"
            valeur={capitaliser(data.document.elements[0]?.type ?? "")}
          />
          <LigneMetadonnee label="Structure" valeur={capitaliser(data.document.structure)} />
          <LigneMetadonnee label="Source" valeur={capitaliser(data.sourceType)} />
        </div>
      </SectionRail>

      {/* Ancrage temporel */}
      {hasRepere && (
        <SectionRail titre={ANCRAGE_TEMPOREL_LABEL}>
          <div className="space-y-1">
            <p className="text-xs leading-relaxed text-deep">
              {data.document.repereTemporelDocument}
            </p>
            <p className="text-[10px] italic text-muted">
              N&apos;apparaît jamais sur la copie de l&apos;élève
            </p>
          </div>
        </SectionRail>
      )}

      {/* Indexation */}
      {(data.niveauLabels || data.disciplineLabels || data.aspectsStr) && (
        <SectionRail titre="Indexation">
          <ChipBar>
            {data.niveauLabels && (
              <MetaChip icon="school" label={data.niveauLabels} mode="lecture" />
            )}
            {data.disciplineLabels && (
              <MetaChip icon="menu_book" label={data.disciplineLabels} mode="lecture" />
            )}
            {data.aspectsStr &&
              data.aspectsStr
                .split(", ")
                .map((aspect) => (
                  <MetaChip key={aspect} icon="public" label={aspect} mode="lecture" />
                ))}
          </ChipBar>
        </SectionRail>
      )}

      {/* Connaissances */}
      {data.connLabels && (
        <SectionRail titre="Connaissances">
          <div className="space-y-1">
            {data.connLabels.split(" · ").map((conn, i) => (
              <p key={i} className="text-xs leading-relaxed text-deep">
                {conn}
              </p>
            ))}
          </div>
        </SectionRail>
      )}

      {/* Utilisation */}
      {data.usageCaption && (
        <SectionRail titre="Utilisation">
          <div className="rounded-md bg-panel-alt px-3 py-2">
            <p className="text-xs text-deep">{data.usageCaption}</p>
          </div>
        </SectionRail>
      )}

      {/* Auteur */}
      <SectionRail titre="Auteur">
        <div className="space-y-1">
          {data.authorName && <MetaRowSimple icon="person" label={data.authorName} noBorderTop />}
          {data.created && <MetaRowSimple icon="calendar_today" label={data.created} noBorderTop />}
        </div>
      </SectionRail>
    </RailLayout>
  );
}

/* ─── Sous-composants internes ──────────────────────────────── */

function LigneMetadonnee({ label, valeur }: { label: string; valeur: string }) {
  if (!valeur) return null;
  return (
    <div className="grid grid-cols-[80px_1fr] gap-2">
      <span className="text-[11px] text-muted">{label}</span>
      <span className="text-xs leading-relaxed text-deep">{valeur}</span>
    </div>
  );
}

function capitaliser(s: string): string {
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
}
