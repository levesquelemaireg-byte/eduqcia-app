"use client";

import { useEffect, useState } from "react";
import type { GrilleEntry } from "@/components/tae/TaeForm/bloc2/types";
import type { OiEntryJson } from "@/lib/types/oi";
import { BLOC2_ERROR_OI_FETCH } from "@/lib/ui/ui-copy";

/** Cache module — un seul fetch réseau par session pour `/data/oi.json`. */
let oiCache: OiEntryJson[] | null = null;
let oiFetchPromise: Promise<OiEntryJson[]> | null = null;

/** Cache module — un seul fetch réseau par session pour `/data/grilles-evaluation.json`. */
let grillesCache: GrilleEntry[] | null = null;
let grillesFetchPromise: Promise<GrilleEntry[]> | null = null;

export function useOiData() {
  const [oiList, setOiList] = useState<OiEntryJson[] | null>(() => oiCache);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (oiCache !== null) {
      return;
    }
    if (!oiFetchPromise) {
      oiFetchPromise = fetch("/data/oi.json")
        .then((r) => {
          if (!r.ok) throw new Error("fetch");
          return r.json() as Promise<OiEntryJson[]>;
        })
        .then((data) => {
          oiCache = data;
          return data;
        })
        .catch(() => {
          oiCache = null;
          throw new Error("fetch");
        });
    }
    let cancelled = false;
    oiFetchPromise
      .then((data) => {
        if (!cancelled) setOiList(data);
      })
      .catch(() => {
        if (!cancelled) setError(BLOC2_ERROR_OI_FETCH);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { oiList, error };
}

/**
 * Données barèmes ministériels — fetch partagé entre tous les montages.
 * `null` = premier chargement pas encore terminé ; tableau = résolu (éventuellement vide).
 */
export function useGrilles(): GrilleEntry[] | null {
  const [grilles, setGrilles] = useState<GrilleEntry[] | null>(() => grillesCache);

  useEffect(() => {
    if (grillesCache !== null) {
      return;
    }
    if (!grillesFetchPromise) {
      grillesFetchPromise = fetch("/data/grilles-evaluation.json")
        .then((r) => (r.ok ? r.json() : Promise.resolve([])))
        .then((data: unknown) => {
          grillesCache = Array.isArray(data) ? (data as GrilleEntry[]) : [];
          return grillesCache;
        })
        .catch(() => {
          grillesCache = [];
          return grillesCache;
        });
    }
    let cancelled = false;
    void grillesFetchPromise.then((data) => {
      if (!cancelled) setGrilles(data);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return grilles;
}
