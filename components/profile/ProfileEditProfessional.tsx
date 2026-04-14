"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { SideSheet } from "@/components/ui/SideSheet";
import { updateProfileProfessional } from "@/lib/actions/profile-update-professional";

const NIVEAUX_OPTIONS = [
  { code: "sec1", label: "Sec. 1" },
  { code: "sec2", label: "Sec. 2" },
  { code: "sec3", label: "Sec. 3" },
  { code: "sec4", label: "Sec. 4" },
];

const DISCIPLINES_OPTIONS = [
  { code: "HEC", label: "Histoire et éducation à la citoyenneté" },
  { code: "GEO", label: "Géographie et éducation à la citoyenneté" },
  { code: "HQC", label: "Histoire du Québec et du Canada" },
];

type Props = {
  open: boolean;
  onClose: () => void;
  currentNiveaux: string[];
  currentDisciplines: string[];
  currentYearsExperience: number | null;
  onChainToIdentity: () => void;
};

export function ProfileEditProfessional({
  open,
  onClose,
  currentNiveaux,
  currentDisciplines,
  currentYearsExperience,
  onChainToIdentity,
}: Props) {
  const router = useRouter();
  const [niveaux, setNiveaux] = useState<string[]>(currentNiveaux);
  const [disciplines, setDisciplines] = useState<string[]>(currentDisciplines);
  const [yearsExp, setYearsExp] = useState<string>(
    currentYearsExperience != null ? String(currentYearsExperience) : "",
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDirty =
    JSON.stringify(niveaux.slice().sort()) !== JSON.stringify(currentNiveaux.slice().sort()) ||
    JSON.stringify(disciplines.slice().sort()) !==
      JSON.stringify(currentDisciplines.slice().sort()) ||
    yearsExp !== (currentYearsExperience != null ? String(currentYearsExperience) : "");

  const handleClose = useCallback(() => {
    if (isDirty && !window.confirm("Vous avez des modifications non enregistrées. Quitter ?")) {
      return;
    }
    onClose();
  }, [isDirty, onClose]);

  function toggleNiveau(code: string) {
    setNiveaux((prev) => (prev.includes(code) ? prev.filter((n) => n !== code) : [...prev, code]));
  }

  function toggleDiscipline(code: string) {
    setDisciplines((prev) =>
      prev.includes(code) ? prev.filter((d) => d !== code) : [...prev, code],
    );
  }

  async function handleSave() {
    setSaving(true);
    setError(null);

    const timeout = setTimeout(() => {
      setError("Le serveur ne répond pas. Vérifiez votre connexion.");
      setSaving(false);
    }, 10000);

    const result = await updateProfileProfessional({
      niveaux,
      disciplines,
      yearsExperience: yearsExp === "" ? null : Number(yearsExp),
    });

    clearTimeout(timeout);
    setSaving(false);

    if (result.success) {
      router.refresh();
      onClose();
      toast.success("Informations professionnelles mises à jour", {
        action: {
          label: "Modifier l'identité →",
          onClick: onChainToIdentity,
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
      title="Informations professionnelles"
      footer={
        <div className="flex flex-col-reverse gap-2 md:flex-row md:justify-end">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-md px-4 py-2 text-sm font-medium text-teal-600 hover:bg-teal-50"
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
      <div className="space-y-6">
        {error && (
          <p className="rounded-md bg-red-50 p-3 text-sm text-red-700" role="alert">
            {error}
          </p>
        )}

        {/* Niveaux — multi-select chips */}
        <fieldset>
          <legend className="mb-2 text-sm font-medium text-slate-700">Niveau enseigné</legend>
          <div className="flex flex-wrap gap-2">
            {NIVEAUX_OPTIONS.map((n) => {
              const selected = niveaux.includes(n.code);
              return (
                <button
                  key={n.code}
                  type="button"
                  onClick={() => toggleNiveau(n.code)}
                  className={`inline-flex h-8 items-center gap-1 rounded-lg border px-4 text-sm font-medium transition-colors ${
                    selected
                      ? "border-teal-500 bg-teal-50 text-teal-700"
                      : "border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200"
                  } focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 focus-visible:outline-none`}
                  aria-pressed={selected}
                >
                  <span className="material-symbols-outlined text-[1em]" aria-hidden="true">
                    school
                  </span>
                  {n.label}
                </button>
              );
            })}
          </div>
        </fieldset>

        {/* Disciplines — multi-select chips */}
        <fieldset>
          <legend className="mb-2 text-sm font-medium text-slate-700">Discipline enseignée</legend>
          <div className="flex flex-wrap gap-2">
            {DISCIPLINES_OPTIONS.map((d) => {
              const selected = disciplines.includes(d.code);
              return (
                <button
                  key={d.code}
                  type="button"
                  onClick={() => toggleDiscipline(d.code)}
                  className={`inline-flex h-8 items-center gap-1 rounded-lg border px-4 text-sm font-medium transition-colors ${
                    selected
                      ? "border-teal-500 bg-teal-50 text-teal-700"
                      : "border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200"
                  } focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 focus-visible:outline-none`}
                  aria-pressed={selected}
                >
                  <span className="material-symbols-outlined text-[1em]" aria-hidden="true">
                    menu_book
                  </span>
                  {d.label}
                </button>
              );
            })}
          </div>
        </fieldset>

        {/* Années d'expérience */}
        <div>
          <label htmlFor="edit-years-exp" className="mb-1 block text-sm font-medium text-slate-700">
            Années d&apos;expérience
          </label>
          <input
            id="edit-years-exp"
            type="number"
            min={0}
            max={50}
            value={yearsExp}
            onChange={(e) => setYearsExp(e.target.value)}
            placeholder="Ex : 12"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-500 focus:outline-none"
          />
        </div>
      </div>
    </SideSheet>
  );
}
