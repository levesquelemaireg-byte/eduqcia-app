"use client";

import {
  DOCUMENT_TYPE_ICONO_CATEGORY_HELP,
  DOCUMENT_TYPE_ICONO_CATEGORY_LABEL,
  DOCUMENT_TYPE_ICONO_LABEL,
  DOCUMENT_TYPE_ICONO_SLUGS,
} from "@/lib/ui/ui-copy";
import type { DocumentTypeIconoSlug } from "@/lib/ui/ui-copy";

type Props = {
  id: string;
  value: DocumentTypeIconoSlug | "";
  onChange: (next: DocumentTypeIconoSlug | "") => void;
  /** défaut true — false : pas de paragraphe d’aide sous le label (modale (i) côté parent). */
  showDescription?: boolean;
  /** défaut true — false : pas de `<label>` (libellé + (i) côté parent). */
  showLabel?: boolean;
};

export function DocumentTypeIconographiqueSelect({
  id,
  value,
  onChange,
  showDescription = true,
  showLabel = true,
}: Props) {
  const helpId = `${id}-help`;
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
      <select
        id={id}
        aria-describedby={showDescription ? helpId : undefined}
        value={value}
        onChange={(e) => onChange((e.target.value || "") as DocumentTypeIconoSlug | "")}
        className="auth-input h-11 w-full rounded-lg border border-border bg-panel px-3 text-sm text-deep"
      >
        <option value="">—</option>
        {DOCUMENT_TYPE_ICONO_SLUGS.map((slug) => (
          <option key={slug} value={slug}>
            {DOCUMENT_TYPE_ICONO_LABEL[slug]}
          </option>
        ))}
      </select>
    </div>
  );
}
