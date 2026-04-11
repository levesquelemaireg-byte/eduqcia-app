"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type Props = {
  children: ReactNode;
  className?: string;
};

/** Container flex-wrap pour les chips de métadonnées. */
export function ChipBar({ children, className }: Props) {
  return <div className={cn("flex flex-wrap items-stretch gap-2", className)}>{children}</div>;
}
