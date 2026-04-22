"use client";

import { ListboxField, type ListboxOption } from "@/components/ui/ListboxField";
import { getAllCategoriesIconographiques } from "@/lib/tache/document-categories-helpers";
import type { DocumentCategorieIconographiqueId } from "@/lib/types/document-categories";
import {
  DOCUMENT_TYPE_ICONO_CATEGORY_HELP,
  DOCUMENT_TYPE_ICONO_CATEGORY_LABEL,
  SELECT_PLACEHOLDER_CATEGORIE_ICONOGRAPHIQUE,
} from "@/lib/ui/ui-copy";

type Props = {
  id: string;
  value: DocumentCategorieIconographiqueId | "";
  onChange: (next: DocumentCategorieIconographiqueId | "") => void;
  /** défaut true — false : pas de paragraphe d'aide sous le label (modale (i) côté parent). */
  showDescription?: boolean;
  /** défaut true — false : pas de `<label>` (libellé + (i) côté parent). */
  showLabel?: boolean;
};

/**
 * Sélecteur catégorie iconographique — façade fine sur `ListboxField` étendu
 * avec icônes par option (D-Composant-1 Option A). Source de vérité unique :
 * `public/data/document-categories.json` clé `iconographiques`.
 */
export function DocumentTypeIconographiqueSelect({
  id,
  value,
  onChange,
  showDescription = true,
  showLabel = true,
}: Props) {
  const helpId = `${id}-help`;

  const options: ListboxOption[] = getAllCategoriesIconographiques().map((cat) => ({
    value: cat.id,
    label: cat.label,
    icon: cat.icon,
  }));

  return (
    <div className="space-y-2">
      {showLabel ? (
        <label htmlFor={id} className="text-sm font-semibold text-deep">
          {DOCUMENT_TYPE_ICONO_CATEGORY_LABEL}
        </label>
      ) : null}
      {showDescription ? (
        <p id={helpId} className="text-xs text-muted">
          {DOCUMENT_TYPE_ICONO_CATEGORY_HELP}
        </p>
      ) : null}
      <ListboxField
        id={id}
        value={value}
        onChange={(v) => onChange((v || "") as DocumentCategorieIconographiqueId | "")}
        allowEmpty
        placeholder={SELECT_PLACEHOLDER_CATEGORIE_ICONOGRAPHIQUE}
        aria-describedby={showDescription ? helpId : undefined}
        aria-required
        options={options}
        className="w-full"
      />
    </div>
  );
}
