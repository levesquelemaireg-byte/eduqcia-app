"use client";

import { useEffect, useState } from "react";
import { listBankDocumentsPickerAction } from "@/lib/actions/list-bank-documents-picker";
import { stripHtmlToPlainText } from "@/lib/documents/strip-html";
import { BANK_DOCUMENT_PICKER_EMPTY, BANK_DOCUMENT_PICKER_LOADING } from "@/lib/ui/ui-copy";

export type BanqueDocStub = {
  id: string;
  titre: string;
  source_citation: string;
};

type Props = {
  onSelect: (doc: BanqueDocStub) => void;
};

/**
 * Modale « Parcourir la banque » — données réelles (`docs/WORKFLOWS.md` Bloc 4).
 */
export function BanqueDocumentsStub({ onSelect }: Props) {
  const [rows, setRows] = useState<BanqueDocStub[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const data = await listBankDocumentsPickerAction();
      if (!cancelled) setRows(data);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (rows === null) {
    return (
      <p className="text-sm text-muted" role="status">
        {BANK_DOCUMENT_PICKER_LOADING}
      </p>
    );
  }

  if (rows.length === 0) {
    return <p className="text-sm leading-relaxed text-muted">{BANK_DOCUMENT_PICKER_EMPTY}</p>;
  }

  return (
    <ul className="max-h-[min(60vh,24rem)] space-y-2 overflow-y-auto pr-1">
      {rows.map((doc) => (
        <li key={doc.id}>
          <button
            type="button"
            onClick={() => onSelect(doc)}
            className="w-full rounded-lg border border-border bg-panel px-3 py-2.5 text-left text-sm transition-colors hover:border-accent/40 hover:bg-accent/5"
          >
            <span className="font-semibold text-deep">{doc.titre}</span>
            <span className="mt-0.5 block text-xs text-muted">
              {stripHtmlToPlainText(doc.source_citation)}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
