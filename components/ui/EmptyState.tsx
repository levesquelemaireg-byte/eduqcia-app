import type { ReactNode } from "react";

type Props = {
  icon: string;
  message: string;
  children?: ReactNode;
};

/** État vide générique — icône + message + CTA optionnel. */
export function EmptyState({ icon, message, children }: Props) {
  return (
    <div className="py-8 text-center">
      <span className="material-symbols-outlined mb-2 text-[32px] text-muted" aria-hidden="true">
        {icon}
      </span>
      <p className="text-base font-medium text-deep">{message}</p>
      {children}
    </div>
  );
}
