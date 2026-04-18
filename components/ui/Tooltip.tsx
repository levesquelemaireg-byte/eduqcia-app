"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils/cn";

export type TooltipPlacement = "top" | "bottom" | "left" | "right";

type Props = {
  /** Élément déclencheur (bouton ou lien cliquable). */
  children: ReactNode;
  /** Titre optionnel — affiché avec icône Material Symbols si fournie. */
  title?: string;
  /** Nom du glyphe Material Symbols pour le titre. */
  titleIcon?: string;
  /** Corps du tooltip — obligatoire. */
  content: ReactNode;
  /** Chips monospace en pied — séparées par un filet en tirets. */
  examples?: readonly string[];
  /** Placement préféré (par défaut `bottom`). Bascule automatiquement si débordement. */
  placement?: TooltipPlacement;
  /** Largeur en pixels (par défaut 300). */
  width?: number;
  /** Classe additionnelle du conteneur tooltip. */
  className?: string;
};

const OPEN_DELAY_MS = 300;
const TRANSITION_MS = 180;
const POINTER_SIZE = 10;
const VIEWPORT_MARGIN = 12;

/**
 * Primitive tooltip — variante « light card » du design system.
 *
 * Rendue via portal côté `document.body` pour éviter les pièges d'overflow.
 * Hover 300 ms + focus clavier ouvrent le tooltip ; Escape le ferme.
 */
export function Tooltip({
  children,
  title,
  titleIcon,
  content,
  examples,
  placement = "bottom",
  width = 300,
  className,
}: Props) {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [resolved, setResolved] = useState<TooltipPlacement>(placement);
  const [pos, setPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [pointerPos, setPointerPos] = useState<{ top: number; left: number } | null>(null);
  const wrapperRef = useRef<HTMLSpanElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const openTimeoutRef = useRef<number | null>(null);
  const tooltipId = useId();

  useEffect(() => {
    // Portal nécessite `document` (navigateur uniquement) — pattern SSR-safe standard.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const clearOpenTimeout = useCallback(() => {
    if (openTimeoutRef.current != null) {
      window.clearTimeout(openTimeoutRef.current);
      openTimeoutRef.current = null;
    }
  }, []);

  const scheduleOpen = useCallback(() => {
    clearOpenTimeout();
    openTimeoutRef.current = window.setTimeout(() => {
      setOpen(true);
    }, OPEN_DELAY_MS);
  }, [clearOpenTimeout]);

  const closeNow = useCallback(() => {
    clearOpenTimeout();
    setOpen(false);
  }, [clearOpenTimeout]);

  useEffect(() => clearOpenTimeout, [clearOpenTimeout]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeNow();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, closeNow]);

  useLayoutEffect(() => {
    if (!open || !wrapperRef.current || !tooltipRef.current) return;
    const triggerRect = wrapperRef.current.getBoundingClientRect();
    const tipRect = tooltipRef.current.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const gap = POINTER_SIZE;

    let current: TooltipPlacement = placement;

    if (
      placement === "bottom" &&
      triggerRect.bottom + gap + tipRect.height + VIEWPORT_MARGIN > vh
    ) {
      current = "top";
    } else if (
      placement === "top" &&
      triggerRect.top - gap - tipRect.height - VIEWPORT_MARGIN < 0
    ) {
      current = "bottom";
    } else if (
      placement === "right" &&
      triggerRect.right + gap + tipRect.width + VIEWPORT_MARGIN > vw
    ) {
      current = "left";
    } else if (
      placement === "left" &&
      triggerRect.left - gap - tipRect.width - VIEWPORT_MARGIN < 0
    ) {
      current = "right";
    }

    let top = 0;
    let left = 0;
    if (current === "bottom") {
      top = triggerRect.bottom + gap;
      left = triggerRect.left + triggerRect.width / 2 - tipRect.width / 2;
    } else if (current === "top") {
      top = triggerRect.top - gap - tipRect.height;
      left = triggerRect.left + triggerRect.width / 2 - tipRect.width / 2;
    } else if (current === "right") {
      top = triggerRect.top + triggerRect.height / 2 - tipRect.height / 2;
      left = triggerRect.right + gap;
    } else {
      top = triggerRect.top + triggerRect.height / 2 - tipRect.height / 2;
      left = triggerRect.left - gap - tipRect.width;
    }

    left = Math.max(VIEWPORT_MARGIN, Math.min(left, vw - tipRect.width - VIEWPORT_MARGIN));
    top = Math.max(VIEWPORT_MARGIN, Math.min(top, vh - tipRect.height - VIEWPORT_MARGIN));

    const tipW = tooltipRef.current.offsetWidth;
    const tipH = tooltipRef.current.offsetHeight;
    let pointer: { top: number; left: number };
    if (current === "bottom" || current === "top") {
      const centerX = triggerRect.left + triggerRect.width / 2;
      const offset = centerX - left;
      pointer = {
        left: Math.max(POINTER_SIZE, Math.min(offset, tipW - POINTER_SIZE)),
        top: current === "bottom" ? -POINTER_SIZE / 2 : tipH - POINTER_SIZE / 2,
      };
    } else {
      const centerY = triggerRect.top + triggerRect.height / 2;
      const offsetY = centerY - top;
      pointer = {
        top: Math.max(POINTER_SIZE, Math.min(offsetY, tipH - POINTER_SIZE)),
        left: current === "right" ? -POINTER_SIZE / 2 : tipW - POINTER_SIZE / 2,
      };
    }

    // Mesure DOM → état : cas légitime de setState dans un layout effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setResolved(current);
    setPos({ top, left });
    setPointerPos(pointer);
  }, [open, placement, content, title, examples]);

  const tooltipNode = (
    <div
      ref={tooltipRef}
      role="tooltip"
      id={tooltipId}
      style={{
        position: "fixed",
        top: pos.top,
        left: pos.left,
        width,
        opacity: open ? 1 : 0,
        transform: open ? "translateY(0)" : "translateY(-2px)",
        transition: `opacity ${TRANSITION_MS}ms cubic-bezier(0.4, 0, 0.2, 1), transform ${TRANSITION_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`,
        pointerEvents: open ? "auto" : "none",
        zIndex: 60,
      }}
      className={cn("tooltip-card", className)}
      onMouseEnter={clearOpenTimeout}
      onMouseLeave={closeNow}
    >
      {pointerPos ? (
        <span
          aria-hidden="true"
          className="tooltip-pointer"
          style={{
            top: pointerPos.top,
            left: pointerPos.left,
          }}
          data-placement={resolved}
        />
      ) : null}
      {title ? (
        <div className="tooltip-title">
          {titleIcon ? (
            <span className="material-symbols-outlined tooltip-title-icon" aria-hidden="true">
              {titleIcon}
            </span>
          ) : null}
          <span>{title}</span>
        </div>
      ) : null}
      <div className="tooltip-body">{content}</div>
      {examples && examples.length > 0 ? (
        <div className="tooltip-examples">
          <span className="tooltip-examples-label">Exemples :</span>
          {examples.map((ex) => (
            <code key={ex}>{ex}</code>
          ))}
        </div>
      ) : null}
    </div>
  );

  return (
    <>
      <span
        ref={wrapperRef}
        className="inline-flex"
        onMouseEnter={scheduleOpen}
        onMouseLeave={closeNow}
        onFocus={() => setOpen(true)}
        onBlur={closeNow}
        aria-describedby={open ? tooltipId : undefined}
      >
        {children}
      </span>
      {mounted && typeof document !== "undefined" ? createPortal(tooltipNode, document.body) : null}
    </>
  );
}
