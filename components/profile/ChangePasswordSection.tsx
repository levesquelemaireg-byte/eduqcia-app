"use client";

import { useState } from "react";
import { PasswordField } from "@/components/ui/PasswordField";
import { PasswordStrengthMeter } from "@/components/auth/PasswordStrengthMeter";
import { Button } from "@/components/ui/Button";
import { InlineAlert } from "@/components/ui/InlineAlert";
import { updatePasswordAction } from "@/lib/actions/auth-update-password";

/** Section « Modifier le mot de passe » — mode propriétaire uniquement (AUTH-1). */
export function ChangePasswordSection() {
  const [open, setOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function reset() {
    setCurrentPassword("");
    setNewPassword("");
    setPasswordConfirm("");
    setError(null);
    setSuccess(false);
  }

  function handleClose() {
    setOpen(false);
    reset();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const result = await updatePasswordAction({
      currentPassword,
      newPassword,
      passwordConfirm,
    });

    setLoading(false);

    if (result.success) {
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setPasswordConfirm("");
    } else {
      setError(result.error);
    }
  }

  if (!open) {
    return (
      <div className="border-t border-border pt-8">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="text-sm font-medium text-accent hover:underline"
        >
          Modifier le mot de passe
        </button>
      </div>
    );
  }

  return (
    <div className="border-t border-border pt-8">
      <h3 className="mb-4 text-base font-semibold text-deep">Modifier le mot de passe</h3>

      <form onSubmit={handleSubmit} className="max-w-sm space-y-4">
        {error && <InlineAlert variant="error">{error}</InlineAlert>}
        {success && (
          <p
            className="flex items-start gap-1.5 rounded-md bg-success/10 p-3 text-sm leading-relaxed text-success"
            role="status"
          >
            <span
              className="material-symbols-outlined mt-[0.125em] shrink-0 text-[1em] leading-none"
              aria-hidden="true"
            >
              check_circle
            </span>
            Mot de passe modifié avec succès.
          </p>
        )}

        <PasswordField
          id="current-password"
          label="Mot de passe actuel"
          required
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          autoComplete="current-password"
        />

        <div className="space-y-1">
          <PasswordField
            id="new-password"
            label="Nouveau mot de passe"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
          />
          {newPassword.length > 0 && <PasswordStrengthMeter password={newPassword} />}
        </div>

        <PasswordField
          id="password-confirm"
          label="Confirmer le nouveau mot de passe"
          required
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
          autoComplete="new-password"
        />

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={loading}>
            {loading ? "Enregistrement…" : "Enregistrer"}
          </Button>
          <Button type="button" variant="ghost" onClick={handleClose}>
            Annuler
          </Button>
        </div>
      </form>
    </div>
  );
}
