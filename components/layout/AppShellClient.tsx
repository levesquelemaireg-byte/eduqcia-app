"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";

const STORAGE_KEY = "eduqcia-sidebar-collapsed";

type Props = {
  children: ReactNode;
  displayName: string;
  email: string;
  profileId: string;
  unreadNotifications: number;
  missingProInfoCount: number;
};

export function AppShellClient({
  children,
  displayName,
  email,
  profileId,
  unreadNotifications,
  missingProInfoCount,
}: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Différer les mises à jour d’état hors du corps synchrone de l’effet (react-hooks/set-state-in-effect).
    queueMicrotask(() => {
      try {
        const v = localStorage.getItem(STORAGE_KEY);
        if (v === "1") setCollapsed(true);
      } catch {
        /* ignore */
      }
      setHydrated(true);
    });
  }, []);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((c) => {
      const next = !c;
      try {
        localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const openMobile = useCallback(() => setMobileOpen(true), []);
  const closeMobile = useCallback(() => setMobileOpen(false), []);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMobile();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen, closeMobile]);

  return (
    <div className="app-shell-root flex min-h-[100dvh] flex-1 bg-bg">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:outline-none"
      >
        Aller au contenu principal
      </a>
      <Sidebar
        displayName={displayName}
        email={email}
        profileId={profileId}
        unreadNotifications={unreadNotifications}
        missingProInfoCount={missingProInfoCount}
        collapsed={hydrated ? collapsed : false}
        onToggleCollapsed={toggleCollapsed}
        mobileOpen={mobileOpen}
        onOpenMobile={openMobile}
        onCloseMobile={closeMobile}
      />

      {/* Backdrop mobile */}
      <button
        type="button"
        aria-label="Fermer le menu"
        className={`fixed inset-0 z-40 bg-deep/40 transition-opacity lg:hidden ${
          mobileOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={closeMobile}
      />

      <div
        className={`app-shell-main flex min-h-full min-w-0 flex-1 flex-col transition-[margin] duration-200 ease-out motion-reduce:transition-none ${
          hydrated && collapsed
            ? "lg:ml-[var(--sidebar-collapsed)]"
            : "lg:ml-[var(--sidebar-width)]"
        } ml-0`}
      >
        {/* Topbar mobile */}
        <header className="app-shell-mobile-header sticky top-0 z-30 flex h-[var(--topbar-height)] shrink-0 items-center gap-3 border-b border-border bg-panel px-3 shadow-sm lg:hidden">
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md text-deep hover:bg-panel-alt"
            onClick={openMobile}
            aria-label="Ouvrir le menu"
          >
            <span className="material-symbols-outlined text-[22px]" aria-hidden="true">
              menu
            </span>
          </button>
          <span className="text-sm font-semibold text-deep">ÉduQc.IA</span>
          <span className="ml-auto max-w-[40%] truncate text-xs text-muted">{displayName}</span>
        </header>

        <main id="main-content" className="main--app flex-1 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
