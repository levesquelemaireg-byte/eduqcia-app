"use client";

import {
  getPasswordStrength,
  strengthLabels,
  type PasswordStrengthLevel,
} from "@/lib/utils/passwordStrength";

const barClass: Record<PasswordStrengthLevel, string> = {
  weak: "bg-error",
  medium: "bg-warning",
  strong: "bg-success",
};

type Props = {
  password: string;
};

export function PasswordStrengthMeter({ password }: Props) {
  if (!password.length) return null;

  const strength = getPasswordStrength(password);
  const idx = (["weak", "medium", "strong"] as const).indexOf(strength);

  return (
    <div className="mt-[var(--space-2)]">
      <div className="flex gap-1">
        {(["weak", "medium", "strong"] as const).map((level, i) => (
          <div
            key={level}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i <= idx ? barClass[strength] : "bg-border"
            }`}
          />
        ))}
      </div>
      <p className="mt-1 text-xs text-muted">
        Force : <span className="font-medium text-steel">{strengthLabels[strength]}</span>
      </p>
    </div>
  );
}
