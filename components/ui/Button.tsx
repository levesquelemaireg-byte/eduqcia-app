import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({ children, variant = "primary", className = "", ...rest }: Props) {
  const base =
    "inline-flex items-center justify-center rounded-[var(--radius-md)] px-4 py-2.5 text-sm font-semibold transition-[opacity,background-color] disabled:cursor-not-allowed disabled:opacity-50";
  const variants: Record<NonNullable<Props["variant"]>, string> = {
    primary: "bg-accent text-white hover:opacity-90 active:opacity-[0.88]",
    secondary: "border border-border bg-panel-alt text-deep hover:bg-surface",
    ghost: "text-steel hover:bg-surface",
  };
  return (
    <button type="button" className={cn(base, variants[variant], className)} {...rest}>
      {children}
    </button>
  );
}
