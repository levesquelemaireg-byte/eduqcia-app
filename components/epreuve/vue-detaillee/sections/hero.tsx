import { StatusBadge } from "@/lib/fiche/primitives/MetaRow";

type Props = {
  titre: string;
  estPubliee: boolean;
  nbTaches: number;
  niveauLabel?: string;
  disciplineLabel?: string;
};

/** Header de la vue détaillée épreuve — statut + titre + contexte. */
export function SectionHero({ titre, estPubliee, nbTaches, niveauLabel, disciplineLabel }: Props) {
  const contexte = [`${nbTaches} tâche${nbTaches !== 1 ? "s" : ""}`, niveauLabel, disciplineLabel]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <StatusBadge
          label={estPubliee ? "Publiée" : "Brouillon"}
          variant={estPubliee ? "published" : "draft"}
        />
      </div>

      <h1 className="text-2xl font-semibold leading-tight text-deep">{titre || "Sans titre"}</h1>

      {contexte && <p className="text-sm text-steel">{contexte}</p>}
    </div>
  );
}
