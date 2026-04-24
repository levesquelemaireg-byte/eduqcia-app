"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { toast } from "sonner";

import { DocumentMiniature, DocumentMiniatureList } from "@/components/document/miniature";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadMoreButton } from "@/components/ui/LoadMoreButton";
import { loadMoreProfileDocumentsAction } from "@/lib/actions/load-more-profile-documents";
import type { DocumentEnrichedRow } from "@/lib/types/document-enriched";
import { ICONES_METIER } from "@/lib/ui/icons/icones-metier";

type Props = {
  profileId: string;
  isOwner: boolean;
  totalCount: number;
  initialItems: DocumentEnrichedRow[];
};

export function ProfileDocumentsList({ profileId, isOwner, totalCount, initialItems }: Props) {
  const [items, setItems] = useState(initialItems);
  const [loading, setLoading] = useState(false);
  const liveRef = useRef<HTMLDivElement>(null);

  const remaining = totalCount - items.length;

  async function loadMore() {
    setLoading(true);
    const result = await loadMoreProfileDocumentsAction(profileId, items.length);
    setLoading(false);
    if (!result.ok) {
      toast.error("Impossible de charger plus de documents.");
      return;
    }
    setItems((prev) => [...prev, ...result.items]);
    if (liveRef.current) {
      liveRef.current.textContent = `${result.items.length} nouveaux résultats chargés`;
    }
  }

  if (totalCount === 0) {
    return (
      <EmptyState
        icon={ICONES_METIER.documents}
        message={
          isOwner
            ? "Vous n'avez pas encore publié de document."
            : "Cet enseignant n'a pas encore partagé de document."
        }
      >
        {isOwner && (
          <Link
            href="/documents/new"
            className="mt-2 inline-block text-sm font-medium text-accent hover:bg-accent/10"
          >
            Créer un document →
          </Link>
        )}
      </EmptyState>
    );
  }

  return (
    <>
      <div aria-live="polite" ref={liveRef} className="sr-only" />
      <DocumentMiniatureList>
        {items.map((doc) => (
          <DocumentMiniature
            key={doc.id}
            document={doc}
            context="profile"
            href={`/documents/${doc.id}`}
          />
        ))}
      </DocumentMiniatureList>
      {remaining > 0 && (
        <LoadMoreButton remaining={remaining} loading={loading} onClick={loadMore} />
      )}
    </>
  );
}
