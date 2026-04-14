import { cn } from "@/lib/utils/cn";

type Size = "sm" | "md" | "lg";

const SIZE_CLASSES: Record<Size, string> = {
  sm: "h-8 w-8 text-xs font-medium",
  md: "h-10 w-10 text-sm font-medium",
  lg: "h-20 w-20 text-[28px] font-semibold",
};

type Props = {
  initials: string;
  size: Size;
  className?: string;
};

/** Cercle initiales — couleur unique teal sur gris pâle (§8). */
export function AvatarInitials({ initials, size, className }: Props) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-teal-600 select-none",
        SIZE_CLASSES[size],
        className,
      )}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}
