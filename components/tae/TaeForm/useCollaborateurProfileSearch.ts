"use client";

import { useEffect, useState } from "react";
import { searchCollaborateursProfilesAction } from "@/lib/actions/search-collaborateurs-profiles";
import type { CollaborateurProfileSearchRow } from "@/lib/queries/collaborateur-profile-search";

/**
 * Recherche profils pour le Bloc 1 — action serveur + debounce géré par l’appelant.
 * Les lignes affichées sont vidées par dérivation lorsque la requête est inactive.
 */
export function useCollaborateurProfileSearch(debouncedTerm: string, enabled: boolean) {
  const [rows, setRows] = useState<CollaborateurProfileSearchRow[]>([]);
  const [pending, setPending] = useState(false);

  const effective = enabled && debouncedTerm.length >= 2;

  useEffect(() => {
    if (!effective) {
      return;
    }

    let cancelled = false;
    const tid = window.setTimeout(() => {
      if (cancelled) return;
      setPending(true);
      void searchCollaborateursProfilesAction(debouncedTerm).then((res) => {
        if (cancelled) return;
        setPending(false);
        if (res.ok) setRows(res.rows);
        else setRows([]);
      });
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(tid);
    };
  }, [debouncedTerm, effective]);

  return {
    rows: effective ? rows : [],
    pending: effective && pending,
  };
}
