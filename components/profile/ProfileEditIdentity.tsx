"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { SideSheet } from "@/components/ui/SideSheet";
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
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-teal-600 hover:bg-teal-50 rounded-md"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50"
          >
            {saving ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      }
    >
      <div className="space-y-5">
        {error && (
          <p className="rounded-md bg-red-50 p-3 text-sm text-red-700" role="alert">
            {error}
          </p>
        )}

        <div>
          <label
            htmlFor="edit-first-name"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Prénom
          </label>
          <input
            id="edit-first-name"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-500 focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="edit-last-name" className="mb-1 block text-sm font-medium text-slate-700">
            Nom
          </label>
          <input
            id="edit-last-name"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-500 focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="edit-css" className="mb-1 block text-sm font-medium text-slate-700">
            Centre de services scolaire
          </label>
          <select
            id="edit-css"
            value={selectedCssId}
            onChange={(e) => {
              setSelectedCssId(e.target.value);
              setSchoolId("");
            }}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-500 focus:outline-none"
          >
            <option value="">Sélectionner un CSS</option>
            {cssOptions.map((css) => (
              <option key={css.id} value={css.id}>
                {css.nomOfficiel}
              </option>
            ))}
          </select>
        </div>

        {selectedCssId && (
          <div>
            <label htmlFor="edit-school" className="mb-1 block text-sm font-medium text-slate-700">
              Établissement
            </label>
            <select
              id="edit-school"
              value={schoolId}
              onChange={(e) => setSchoolId(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            >
              <option value="">Sélectionner un établissement</option>
              {filteredSchools.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nomOfficiel}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <p className="text-sm text-slate-500">
            <span className="font-medium text-slate-700">Rôle</span> — non modifiable (action admin)
          </p>
          <p className="mt-1 text-sm text-slate-500">
            <span className="font-medium text-slate-700">Courriel</span> — non modifiable (lié à
            votre compte)
          </p>
        </div>
      </div>
    </SideSheet>
  );
}
