"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { SideSheet } from "@/components/ui/SideSheet";
import { WarningModal } from "@/components/ui/WarningModal";
import { Field } from "@/components/ui/Field";
import { FieldLayout } from "@/components/ui/FieldLayout";
import { ListboxField } from "@/components/ui/ListboxField";
import { Button } from "@/components/ui/Button";
import { InlineAlert } from "@/components/ui/InlineAlert";
import { updateProfileIdentity } from "@/lib/actions/profile-update-identity";
import { updateProfileProfessional } from "@/lib/actions/profile-update-professional";

const NIVEAUX_OPTIONS = [
  { code: "sec1", label: "Secondaire 1" },
  { code: "sec2", label: "Secondaire 2" },
  { code: "sec3", label: "Secondaire 3" },
  { code: "sec4", label: "Secondaire 4" },
];

const DISCIPLINES_OPTIONS = [
  { code: "HEC", label: "Histoire et éducation à la citoyenneté" },
  { code: "GEO", label: "Géographie et éducation à la citoyenneté" },
  { code: "HQC", label: "Histoire du Québec et du Canada" },
];

const GENRE_OPTIONS = [
  { value: "homme", label: "Homme" },
  { value: "femme", label: "Femme" },
];

type Props = {
  open: boolean;
  onClose: () => void;
  currentFirstName: string;
  currentLastName: string;
  currentSchoolId: string | null;
  currentGenre: string | null;
  currentNiveaux: string[];
  currentDisciplines: string[];
  currentYearsExperience: number | null;
  cssOptions: { id: string; nomOfficiel: string }[];
  schoolOptions: { id: string; nomOfficiel: string; cssId: string }[];
  profileId: string;
};

/** SideSheet unifié — identité + informations professionnelles. */
export function ProfileEditSheet({
  open,
  onClose,
  currentFirstName,
  currentLastName,
  currentSchoolId,
  currentGenre,
  currentNiveaux,
  currentDisciplines,
  currentYearsExperience,
  cssOptions,
  schoolOptions,
  profileId,
}: Props) {
  const router = useRouter();

  // Identité
  const [firstName, setFirstName] = useState(currentFirstName);
  const [lastName, setLastName] = useState(currentLastName);
  const [selectedCssId, setSelectedCssId] = useState<string>(
    () => schoolOptions.find((s) => s.id === currentSchoolId)?.cssId ?? "",
  );
  const [schoolId, setSchoolId] = useState<string>(currentSchoolId ?? "");
  const [genre, setGenre] = useState<string>(currentGenre ?? "");

  // Professionnel
  const [niveaux, setNiveaux] = useState<string[]>(currentNiveaux);
  const [disciplines, setDisciplines] = useState<string[]>(currentDisciplines);
  const [yearsExp, setYearsExp] = useState<string>(
    currentYearsExperience != null ? String(currentYearsExperience) : "",
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDiscardOpen, setConfirmDiscardOpen] = useState(false);

  const cssListboxOptions = cssOptions.map((css) => ({
    value: css.id,
    label: css.nomOfficiel,
  }));

  const schoolListboxOptions = schoolOptions
    .filter((s) => s.cssId === selectedCssId)
    .map((s) => ({
      value: s.id,
      label: s.nomOfficiel,
    }));

  const identityDirty =
    firstName !== currentFirstName ||
    lastName !== currentLastName ||
    schoolId !== (currentSchoolId ?? "") ||
    genre !== (currentGenre ?? "");

  const proDirty =
    JSON.stringify(niveaux.slice().sort()) !== JSON.stringify(currentNiveaux.slice().sort()) ||
    JSON.stringify(disciplines.slice().sort()) !==
      JSON.stringify(currentDisciplines.slice().sort()) ||
    yearsExp !== (currentYearsExperience != null ? String(currentYearsExperience) : "");

  const isDirty = identityDirty || proDirty;

  const handleClose = useCallback(() => {
    if (isDirty) {
      setConfirmDiscardOpen(true);
      return;
    }
    onClose();
  }, [isDirty, onClose]);

  const handleConfirmDiscard = useCallback(() => {
    setConfirmDiscardOpen(false);
    onClose();
  }, [onClose]);

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

    const [identityResult, proResult] = await Promise.all([
      identityDirty
        ? updateProfileIdentity({
            firstName,
            lastName,
            schoolId: schoolId || null,
            genre: genre || null,
          })
        : Promise.resolve({ success: true as const }),
      proDirty
        ? updateProfileProfessional({
            niveaux,
            disciplines,
            yearsExperience: yearsExp === "" ? null : Number(yearsExp),
          })
        : Promise.resolve({ success: true as const }),
    ]);

    clearTimeout(timeout);
    setSaving(false);

    if (!identityResult.success) {
      setError("error" in identityResult ? identityResult.error : "Erreur identité.");
      return;
    }
    if (!proResult.success) {
      setError("error" in proResult ? proResult.error : "Erreur informations professionnelles.");
      return;
    }

    router.refresh();
    onClose();
    toast.success("Profil mis à jour");
  }

  return (
    <>
      <SideSheet
        open={open}
        onClose={handleClose}
        title="Modifier le profil"
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
        <div>
          {error && (
            <InlineAlert variant="error" className="mb-5">
              {error}
            </InlineAlert>
          )}

          {/* ── Section Identité ── */}
          <h3 className="mb-4 inline-flex items-center gap-[0.35em] text-xs font-semibold uppercase tracking-wider text-muted">
            <span className="material-symbols-outlined text-[1em] leading-none" aria-hidden="true">
              person
            </span>
            Identité
          </h3>

          <div className="space-y-4">
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
              <ListboxField
                id="edit-css"
                options={cssListboxOptions}
                value={selectedCssId}
                onChange={(v) => {
                  setSelectedCssId(v);
                  setSchoolId("");
                }}
                placeholder="Sélectionner un centre de services scolaire"
                allowEmpty
              />
            </FieldLayout>

            {selectedCssId && (
              <FieldLayout label="Établissement" htmlFor="edit-school">
                <ListboxField
                  id="edit-school"
                  options={schoolListboxOptions}
                  value={schoolId}
                  onChange={setSchoolId}
                  placeholder="Sélectionner un établissement"
                  allowEmpty
                />
              </FieldLayout>
            )}

            <FieldLayout label="Genre" htmlFor="edit-genre">
              <ListboxField
                id="edit-genre"
                options={GENRE_OPTIONS}
                value={genre}
                onChange={setGenre}
                placeholder="Non renseigné"
                allowEmpty
              />
            </FieldLayout>
          </div>

          {/* ── Section Informations professionnelles ── */}
          <div className="mt-8 border-t border-border/50 pt-6">
            <h3 className="mb-5 inline-flex items-center gap-[0.35em] text-xs font-semibold uppercase tracking-wider text-muted">
              <span
                className="material-symbols-outlined text-[1em] leading-none"
                aria-hidden="true"
              >
                school
              </span>
              Informations professionnelles
            </h3>

            {/* Niveaux — checklist multi-select */}
            <fieldset>
              <legend className="mb-2 text-sm font-medium text-deep">Niveau enseigné</legend>
              <div className="space-y-1">
                {NIVEAUX_OPTIONS.map((n) => (
                  <label
                    key={n.code}
                    className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-sm text-deep hover:bg-surface"
                  >
                    <input
                      type="checkbox"
                      checked={niveaux.includes(n.code)}
                      onChange={() => toggleNiveau(n.code)}
                      className="h-4 w-4 rounded border-border text-accent accent-accent focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                    />
                    {n.label}
                  </label>
                ))}
              </div>
            </fieldset>

            {/* Disciplines — checklist multi-select */}
            <fieldset className="mt-6">
              <legend className="mb-2 text-sm font-medium text-deep">Discipline enseignée</legend>
              <div className="space-y-1">
                {DISCIPLINES_OPTIONS.map((d) => (
                  <label
                    key={d.code}
                    className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-sm text-deep hover:bg-surface"
                  >
                    <input
                      type="checkbox"
                      checked={disciplines.includes(d.code)}
                      onChange={() => toggleDiscipline(d.code)}
                      className="h-4 w-4 rounded border-border text-accent accent-accent focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                    />
                    {d.label}
                  </label>
                ))}
              </div>
            </fieldset>

            {/* Expérience — input number compact aligné à droite */}
            <div className="mt-6 flex items-center justify-between">
              <span className="inline-flex items-center gap-[0.35em] text-sm font-medium text-deep">
                <span
                  className="material-symbols-outlined text-[1em] leading-none text-muted"
                  aria-hidden="true"
                >
                  work_history
                </span>
                Années d&#39;expérience
              </span>
              <input
                id="edit-years-exp"
                type="number"
                min={0}
                max={50}
                value={yearsExp}
                onChange={(e) => setYearsExp(e.target.value)}
                aria-label="Années d'expérience"
                placeholder="—"
                className="w-16 rounded-md border border-border bg-panel px-2 py-1.5 text-center text-sm text-deep focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-auto [&::-webkit-outer-spin-button]:appearance-auto"
              />
            </div>
          </div>
        </div>
      </SideSheet>

      <WarningModal
        open={confirmDiscardOpen}
        title="Modifications non enregistrées"
        onClose={() => setConfirmDiscardOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setConfirmDiscardOpen(false)}>
              Continuer la modification
            </Button>
            <Button variant="primary" onClick={handleConfirmDiscard}>
              Quitter sans enregistrer
            </Button>
          </div>
        }
      >
        <p>Vous avez des modifications non enregistrées. Souhaitez-vous vraiment quitter ?</p>
      </WarningModal>
    </>
  );
}
