"use client";

import { useState } from "react";
import { WarningModal } from "@/components/ui/WarningModal";
import { Field } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { InlineAlert } from "@/components/ui/InlineAlert";
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

  function handleCloseModal() {
    setModalOpen(false);
    setConfirmation("");
    setError(null);
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
        onClose={handleCloseModal}
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

          {error && <InlineAlert variant="error">{error}</InlineAlert>}

          <Field
            label="Tapez SUPPRIMER pour confirmer"
            id="delete-confirm"
            type="text"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            autoComplete="off"
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={handleCloseModal}>
              Annuler
            </Button>
            <Button
              onClick={handleDelete}
              disabled={confirmation !== "SUPPRIMER" || deleting}
              className="bg-error text-white hover:bg-error/90 hover:opacity-100"
            >
              {deleting ? "Suppression…" : "Supprimer définitivement"}
            </Button>
          </div>
        </div>
      </WarningModal>
    </>
  );
}
