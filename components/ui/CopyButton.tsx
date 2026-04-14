"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils/cn";

type Props = {
  text: string;
  ariaLabel?: string;
  className?: string;
};

/** Icon button copier + toast aria-live 4s (§5.5). */
export function CopyButton({ text, ariaLabel = "Copier le courriel", className }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 4000);
      } catch {
        // Fallback silencieux
      }
    },
    [text],
  );

  return (
    <span className="relative inline-flex items-center">
      <button
        type="button"
        onClick={handleCopy}
        className={cn(
          "inline-flex h-10 w-10 items-center justify-center rounded-full bg-transparent text-slate-500 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 focus-visible:outline-none",
          className,
        )}
        aria-label={ariaLabel}
      >
        <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
          {copied ? "check" : "content_copy"}
        </span>
      </button>
      {copied && (
        <span
          role="status"
          aria-live="polite"
          className="absolute left-full ml-2 whitespace-nowrap rounded-md bg-deep px-2 py-1 text-xs text-white shadow-md"
        >
          Courriel copié
        </span>
      )}
    </span>
  );
}
