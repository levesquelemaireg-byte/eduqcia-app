"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { RepereTemporelField } from "@/components/ui/RepereTemporelField";
import { updateDocumentBankFieldsAction } from "@/lib/actions/update-document-bank-fields";
import {
  DOCUMENT_FICHE_BANK_SAVE_CTA,
  DOCUMENT_FICHE_BANK_SECTION_BODY,
  DOCUMENT_FICHE_BANK_SECTION_TITLE,
  TOAST_DOCUMENT_BANK_UPDATE_FORBIDDEN,
  TOAST_DOCUMENT_BANK_UPDATE_INCOMPLETE,
  TOAST_DOCUMENT_BANK_UPDATE_OK,
} from "@/lib/ui/ui-copy";

type Props = {
  documentId: string;
  initialRepere: string;
  initialAnnee: number | null;
};

export function DocumentBankCompletionCard({ documentId, initialRepere, initialAnnee }: Props) {
  const router = useRouter();
  const [repere, setRepere] = useState(initialRepere);
  const [annee, setAnnee] = useState<number | null>(initialAnnee);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const r = await updateDocumentBankFieldsAction({
        documentId,
        repere_temporel: repere,
        annee_normalisee: annee,
      });
      if (!r.ok) {
        if (r.code === "forbidden") toast.error(TOAST_DOCUMENT_BANK_UPDATE_FORBIDDEN);
        else if (r.message) toast.error(r.message);
        else toast.error(TOAST_DOCUMENT_BANK_UPDATE_INCOMPLETE);
        return;
      }
      if (r.isPublished) {
        toast.success(TOAST_DOCUMENT_BANK_UPDATE_OK);
      } else {
        toast.message(TOAST_DOCUMENT_BANK_UPDATE_INCOMPLETE);
      }
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  return (
    <section
      className="mb-6 rounded-xl border border-border bg-panel-alt/80 p-4 shadow-sm md:p-5"
      aria-labelledby="doc-bank-completion-heading"
    >
      <h2 id="doc-bank-completion-heading" className="text-base font-semibold text-deep">
        {DOCUMENT_FICHE_BANK_SECTION_TITLE}
      </h2>
      <p className="mt-2 text-sm text-muted">{DOCUMENT_FICHE_BANK_SECTION_BODY}</p>
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <RepereTemporelField
          repereTemporelValue={repere}
          onRepereTemporelChange={setRepere}
          anneeNormaliseeValue={annee}
          onAnneeNormaliseeChange={setAnnee}
        />
        <button
          type="submit"
          disabled={saving}
          className="inline-flex min-h-11 items-center justify-center rounded-lg bg-accent px-4 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "…" : DOCUMENT_FICHE_BANK_SAVE_CTA}
        </button>
      </form>
    </section>
  );
}
