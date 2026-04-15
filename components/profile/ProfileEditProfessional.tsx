"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { SideSheet } from "@/components/ui/SideSheet";
import { Field } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { InlineAlert } from "@/components/ui/InlineAlert";
import { ToggleChip } from "@/components/ui/ToggleChip";
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
          <Button variant="ghost" onClick={handleClose}>
            Annuler
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? "Enregistrement…" : "Enregistrer"}
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {error && <InlineAlert variant="error">{error}</InlineAlert>}

        {/* Niveaux — multi-select chips */}
        <fieldset>
          <legend className="mb-2 text-sm font-medium text-deep">Niveau enseigné</legend>
          <div className="flex flex-wrap gap-2">
            {NIVEAUX_OPTIONS.map((n) => (
              <ToggleChip
                key={n.code}
                label={n.label}
                icon="school"
                selected={niveaux.includes(n.code)}
                onClick={() => toggleNiveau(n.code)}
              />
            ))}
          </div>
        </fieldset>

        {/* Disciplines — multi-select chips */}
        <fieldset>
          <legend className="mb-2 text-sm font-medium text-deep">Discipline enseignée</legend>
          <div className="flex flex-wrap gap-2">
            {DISCIPLINES_OPTIONS.map((d) => (
              <ToggleChip
                key={d.code}
                label={d.label}
                icon="menu_book"
                selected={disciplines.includes(d.code)}
                onClick={() => toggleDiscipline(d.code)}
              />
            ))}
          </div>
        </fieldset>

        {/* Années d'expérience */}
        <Field
          label="Années d'expérience"
          id="edit-years-exp"
          type="number"
          min={0}
          max={50}
          value={yearsExp}
          onChange={(e) => setYearsExp(e.target.value)}
          placeholder="Ex : 12"
        />
      </div>
    </SideSheet>
  );
}
