"use client";

import type { TextareaHTMLAttributes } from "react";
import { forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

/**
 * Zone de texte multiligne — inclut toujours **`auth-input`** (focus teal, `globals.css`).
 * Ne pas dupliquer de `<textarea>` nu dans l’app : utiliser ce composant ou ajouter `auth-input` manuellement.
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, ...rest },
  ref,
) {
  return (
    <textarea
      ref={ref}
      className={cn(
        "auth-input w-full resize-y rounded-lg border border-border bg-panel px-3 py-2.5 text-sm text-deep placeholder:text-muted",
        className,
      )}
      {...rest}
    />
  );
});
