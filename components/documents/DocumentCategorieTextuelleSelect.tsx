"use client";

import { ListboxField, type ListboxOption } from "@/components/ui/ListboxField";
import type { CategorieTextuelleValue } from "@/lib/documents/categorie-textuelle";
import { getAllCategoriesTextuelles } from "@/lib/tae/document-categories-helpers";
import {
  DOCUMENT_TYPE_TEXTUEL_CATEGORY_HELP,
  DOCUMENT_TYPE_TEXTUEL_CATEGORY_LABEL,
  SELECT_PLACEHOLDER_CATEGORIE_TEXTUELLE,
} from "@/lib/ui/ui-copy";

type Props = {
  id: string;
  value: CategorieTextuelleValue | "";
  onChange: (next: CategorieTextuelleValue | "") => void;
  /** défaut true — false : pas de paragraphe d'aide sous le label (modale (i) côté parent). */
  showDescription?: boolean;
  /** défaut true — false : pas de `<label>` (libellé + (i) côté parent). */
  showLabel?: boolean;
};

/**
 * Sélecteur catégorie textuelle — symétrique à `DocumentTypeIconographiqueSelect`.
 * Façade fine sur `ListboxField` étendu avec icônes par option. Source de vérité
 * unique : `public/data/document-categories.json` clé `textuelles`.
 */
export function DocumentCategorieTextuelleSelect({
  id,
  value,
  onChange,
  showDescription = true,
  showLabel = true,
}: Props) {
  const helpId = `${id}-help`;

  const options: ListboxOption[] = getAllCategoriesTextuelles().map((cat) => ({
    value: cat.id,
    label: cat.label,
    icon: cat.icon,
  }));

  return (
    <div className="space-y-2">
      {showLabel ? (
        <label htmlFor={id} className="text-sm font-semibold text-deep">
          {DOCUMENT_TYPE_TEXTUEL_CATEGORY_LABEL}
        </label>
      ) : null}
      {showDescription ? (
        <p id={helpId} className="text-xs text-muted">
          {DOCUMENT_TYPE_TEXTUEL_CATEGORY_HELP}
        </p>
      ) : null}
      <ListboxField
        id={id}
        value={value}
        onChange={(v) => onChange((v || "") as CategorieTextuelleValue | "")}
        allowEmpty
        placeholder={SELECT_PLACEHOLDER_CATEGORIE_TEXTUELLE}
        aria-describedby={showDescription ? helpId : undefined}
        aria-required
        options={options}
        className="w-full"
      />
    </div>
  );
}
