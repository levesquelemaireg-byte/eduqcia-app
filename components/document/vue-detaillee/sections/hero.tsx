import { StatusBadge } from "@/lib/fiche/primitives/MetaRow";

type Props = {
  titre: string;
  estPublie: boolean;
  typeLabel: string;
  structureLabel: string;
  niveauLabels: string;
  disciplineLabels: string;
};

/** Header de la vue détaillée document — statut + titre + contexte. */
export function SectionHero({
  titre,
  estPublie,
  typeLabel,
  structureLabel,
  niveauLabels,
  disciplineLabels,
}: Props) {
  const contexte = [typeLabel, structureLabel, niveauLabels, disciplineLabels]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="space-y-1.5">
      {/* Ligne 1 : statut */}
      <div className="flex items-center gap-2">
        <StatusBadge
          label={estPublie ? "Publiée" : "Brouillon"}
          variant={estPublie ? "published" : "draft"}
        />
      </div>

      {/* Ligne 2 : titre */}
      <h1 className="text-2xl font-semibold leading-tight text-deep">{titre || "Sans titre"}</h1>

      {/* Ligne 3 : contexte */}
      {contexte && <p className="text-sm text-steel">{contexte}</p>}
    </div>
  );
}
