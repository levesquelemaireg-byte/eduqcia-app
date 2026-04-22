import { copyGrilleAbsentePourOutil } from "@/lib/ui/ui-copy";

type Props = {
  id: string;
};

/** Affichage explicite lorsque `outil_evaluation` ne correspond à aucune entrée du JSON. */
export function GrilleAbsente({ id }: Props) {
  return (
    <p className="m-0 py-2 text-[10pt] italic text-muted" role="status">
      {copyGrilleAbsentePourOutil(id)}
    </p>
  );
}
