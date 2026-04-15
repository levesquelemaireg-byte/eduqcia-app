import { cn } from "@/lib/utils/cn";

type Props = {
  children: string;
  variant?: "warning" | "error";
  icon?: string;
  className?: string;
};

/**
 * Alerte inline — avertissement ou erreur, non bloquante.
 *
 * `variant="warning"` (défaut) : texte warning, icône info.
 * `variant="error"` : fond error/10, texte error, icône error.
 */
export function InlineAlert({ children, variant = "warning", icon, className }: Props) {
  const isError = variant === "error";
  const defaultIcon = isError ? "error" : "info";
  const resolvedIcon = icon ?? defaultIcon;

  return (
    <p
      className={cn(
        "flex items-start gap-1.5 text-sm leading-relaxed",
        isError ? "rounded-md bg-error/10 p-3 text-error" : "text-xs text-warning",
        className,
      )}
      role={isError ? "alert" : "status"}
    >
      <span
        className="material-symbols-outlined mt-[0.125em] shrink-0 text-[1em] leading-none"
        aria-hidden="true"
      >
        {resolvedIcon}
      </span>
      {children}
    </p>
  );
}
