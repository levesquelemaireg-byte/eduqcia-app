"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { SideSheet } from "@/components/ui/SideSheet";
import { Field } from "@/components/ui/Field";
import { FieldLayout } from "@/components/ui/FieldLayout";
import { Button } from "@/components/ui/Button";
import { InlineAlert } from "@/components/ui/InlineAlert";
import { updateProfileIdentity } from "@/lib/actions/profile-update-identity";

type Props = {
  open: boolean;
  onClose: () => void;
  currentFirstName: string;
  currentLastName: string;
  currentSchoolId: string | null;
  cssOptions: { id: string; nomOfficiel: string }[];
  schoolOptions: { id: string; nomOfficiel: string; cssId: string }[];
  onChainToProInfo: () => void;
};

export function ProfileEditIdentity({
  open,
  onClose,
  currentFirstName,
  currentLastName,
  currentSchoolId,
  cssOptions,
  schoolOptions,
  onChainToProInfo,
}: Props) {
  const router = useRouter();
  const [firstName, setFirstName] = useState(currentFirstName);
  const [lastName, setLastName] = useState(currentLastName);
  const [selectedCssId, setSelectedCssId] = useState<string>(
    () => schoolOptions.find((s) => s.id === currentSchoolId)?.cssId ?? "",
  );
  const [schoolId, setSchoolId] = useState<string>(currentSchoolId ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredSchools = selectedCssId
    ? schoolOptions.filter((s) => s.cssId === selectedCssId)
    : [];

  const isDirty =
    firstName !== currentFirstName ||
    lastName !== currentLastName ||
    schoolId !== (currentSchoolId ?? "");

  const handleClose = useCallback(() => {
    if (isDirty && !window.confirm("Vous avez des modifications non enregistrées. Quitter ?")) {
      return;
    }
    onClose();
  }, [isDirty, onClose]);

  async function handleSave() {
    setSaving(true);
    setError(null);

    const timeout = setTimeout(() => {
      setError("Le serveur ne répond pas. Vérifiez votre connexion.");
      setSaving(false);
    }, 10000);

    const result = await updateProfileIdentity({
      firstName,
      lastName,
      schoolId: schoolId || null,
    });

    clearTimeout(timeout);
    setSaving(false);

    if (result.success) {
      router.refresh();
      onClose();
      toast.success("Identité mise à jour", {
        action: {
          label: "Modifier les informations professionnelles →",
          onClick: onChainToProInfo,
        },
        duration: 4000,
      });
    } else {
      setError(result.error);
    }
  }

  return (
    <SideSheet
      open={open}
      onClose={handleClose}
      title="Modifier l'identité"
      footer={
        <div className="flex flex-col-reverse gap-2 md:flex-row md:justify-end">
          <Button variant="ghost" onClick={handleClose}>
            Annuler
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? "Enregistrement…" : "Enregistrer"}
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        {error && <InlineAlert variant="error">{error}</InlineAlert>}

        <Field
          label="Prénom"
          id="edit-first-name"
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />

        <Field
          label="Nom"
          id="edit-last-name"
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />

        <FieldLayout label="Centre de services scolaire" htmlFor="edit-css">
          <select
            id="edit-css"
            value={selectedCssId}
            onChange={(e) => {
              setSelectedCssId(e.target.value);
              setSchoolId("");
            }}
            className="auth-input min-h-11 w-full rounded-md border border-border bg-panel px-3 py-2.5 text-sm text-deep"
          >
            <option value="">Sélectionner un CSS</option>
            {cssOptions.map((css) => (
              <option key={css.id} value={css.id}>
                {css.nomOfficiel}
              </option>
            ))}
          </select>
        </FieldLayout>

        {selectedCssId && (
          <FieldLayout label="Établissement" htmlFor="edit-school">
            <select
              id="edit-school"
              value={schoolId}
              onChange={(e) => setSchoolId(e.target.value)}
              className="auth-input min-h-11 w-full rounded-md border border-border bg-panel px-3 py-2.5 text-sm text-deep"
            >
              <option value="">Sélectionner un établissement</option>
              {filteredSchools.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nomOfficiel}
                </option>
              ))}
            </select>
          </FieldLayout>
        )}

        <div>
          <p className="text-sm text-muted">
            <span className="font-medium text-deep">Rôle</span> — non modifiable (action admin)
          </p>
          <p className="mt-1 text-sm text-muted">
            <span className="font-medium text-deep">Courriel</span> — non modifiable (lié à votre
            compte)
          </p>
        </div>
      </div>
    </SideSheet>
  );
}
