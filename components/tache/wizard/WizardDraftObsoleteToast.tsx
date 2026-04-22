"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { TOAST_WIZARD_DRAFT_OBSOLETE } from "@/lib/ui/ui-copy";

/** Toast unique au chargement si le serveur a détecté un brouillon hors format v7 (`bloc1` absent). */
export function WizardDraftObsoleteToast({ show }: { show: boolean }) {
  const fired = useRef(false);
  useEffect(() => {
    if (!show || fired.current) return;
    fired.current = true;
    toast.error(TOAST_WIZARD_DRAFT_OBSOLETE);
  }, [show]);
  return null;
}
