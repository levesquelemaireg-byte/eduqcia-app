import { SommaireConnaissances } from "@/components/tae/TaeForm/sommaire/SommaireConnaissances";
import type { DisciplineCode } from "@/lib/tae/blueprint-helpers";
import { materialIconTooltip } from "@/lib/tae/icon-justifications";
import type { ConnaissanceSelectionWithIds } from "@/lib/tae/connaissances-helpers";
import { WIZARD_REFERENTIEL_CONN_INDISPO } from "@/lib/ui/ui-copy";

type Props = {
  discipline: DisciplineCode;
  items: ConnaissanceSelectionWithIds[];
  onRemoveRow: (rowId: string) => void;
};

export function SommaireFicheConnaissances({ discipline, items, onRemoveRow }: Props) {
  return (
    <section aria-labelledby="sommaire-conn">
      <h4
        id="sommaire-conn"
        className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-accent"
      >
        <span
          className="material-symbols-outlined text-[1em]"
          aria-hidden="true"
          title={materialIconTooltip("lightbulb")}
        >
          lightbulb
        </span>
        Connaissances relatives
      </h4>
      {discipline === "geo" ? (
        <p className="mt-3 text-sm text-muted">{WIZARD_REFERENTIEL_CONN_INDISPO}</p>
      ) : (
        <SommaireConnaissances items={items} onRemoveRow={onRemoveRow} />
      )}
    </section>
  );
}
