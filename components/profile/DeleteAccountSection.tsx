"use client";

import { useState } from "react";
import { WarningModal } from "@/components/ui/WarningModal";
import { deleteAccountAction } from "@/lib/actions/account-delete";

/** Section suppression de compte Loi 25 — mode propriétaire uniquement (§17.5). */
export function DeleteAccountSection() {
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setDeleting(true);
    setError(null);
    const result = await deleteAccountAction({ confirmation });
    // Si on arrive ici, c'est un échec (succès = redirect)
    if (!result.ok) {
      setError(result.error);
      setDeleting(false);
    }
  }

  return (
    <>
      <div className="border-t border-border pt-8">
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="text-sm font-medium text-error hover:text-error"
        >
          Supprimer mon compte
        </button>
      </div>

      <WarningModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setConfirmation("");
          setError(null);
        }}
        title="Suppression définitive du compte"
      >
        <div className="space-y-4">
          <p className="text-sm text-deep">
            En vertu de la Loi 25 sur la protection des renseignements personnels, cette action
            entraîne la suppression irréversible de toutes vos données personnelles :
          </p>
          <ul className="list-disc space-y-1 pl-5 text-sm text-deep">
            <li>Votre nom, courriel et informations d&apos;établissement</li>
            <li>Vos niveaux, disciplines et années d&apos;expérience</li>
            <li>Vos brouillons non publiés (tâches, documents, épreuves)</li>
            <li>Vos votes, favoris et notifications</li>
          </ul>
          <p className="text-sm text-deep">
            <strong>Vos contributions publiées</strong> (tâches, documents et épreuves) resteront
            accessibles dans la banque collaborative, mais votre nom sera remplacé par « [Compte
            supprimé] ».
          </p>
          <p className="text-sm font-semibold text-error">
            Cette action est irréversible. Vous ne pourrez pas récupérer votre compte.
          </p>

          {error && (
            <p className="rounded-md bg-error/10 p-3 text-sm text-error" role="alert">
              {error}
            </p>
          )}

          <div>
            <label htmlFor="delete-confirm" className="mb-1 block text-sm font-medium text-deep">
              Tapez SUPPRIMER pour confirmer
            </label>
            <input
              id="delete-confirm"
              type="text"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              autoComplete="off"
              className="auth-input h-11 w-full rounded-lg border border-border bg-panel px-3 text-sm text-deep"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setModalOpen(false);
                setConfirmation("");
                setError(null);
              }}
              className="rounded-md px-4 py-2 text-sm font-medium text-muted hover:bg-surface"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={confirmation !== "SUPPRIMER" || deleting}
              className="rounded-md bg-error px-4 py-2 text-sm font-medium text-white hover:bg-error/90 disabled:opacity-50"
            >
              {deleting ? "Suppression…" : "Supprimer définitivement"}
            </button>
          </div>
        </div>
      </WarningModal>
    </>
  );
}
