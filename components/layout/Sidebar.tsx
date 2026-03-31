"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/lib/actions/auth-logout";

type NavItem = {
  href: string;
  label: string;
  icon: string;
  /** Badge numérique (ex. notifications) */
  badge?: number;
};

type Section = { title: string; items: NavItem[] };

function isActive(pathname: string, href: string): boolean {
  if (href === "/questions") {
    if (pathname === "/questions") return true;
    if (pathname.startsWith("/questions/") && !pathname.startsWith("/questions/new")) return true;
    return false;
  }
  if (href === "/evaluations") {
    if (pathname === "/evaluations") return true;
    if (pathname.startsWith("/evaluations/") && !pathname.startsWith("/evaluations/new"))
      return true;
    return false;
  }
  if (href === "/documents") {
    return pathname === "/documents" || pathname.startsWith("/documents/");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

const SECTIONS: Section[] = [
  {
    title: "Navigation",
    items: [{ href: "/dashboard", label: "Tableau de bord", icon: "dashboard" }],
  },
  {
    title: "Mes contenus",
    items: [
      { href: "/questions", label: "Mes tâches", icon: "quiz" },
      { href: "/evaluations", label: "Mes épreuves", icon: "assignment" },
    ],
  },
  {
    title: "Création",
    items: [
      { href: "/questions/new", label: "Créer une tâche", icon: "post_add" },
      { href: "/evaluations/new", label: "Créer une épreuve", icon: "note_add" },
      { href: "/documents/new", label: "Créer un document", icon: "add_notes" },
    ],
  },
  {
    title: "Communauté",
    items: [
      { href: "/bank", label: "Banque collaborative", icon: "public" },
      { href: "/collaborateurs", label: "Enseignants collaborateurs", icon: "groups" },
    ],
  },
  {
    title: "Système",
    items: [{ href: "/profile", label: "Profil", icon: "person" }],
  },
];

type Props = {
  displayName: string;
  email: string;
  profileId: string;
  unreadNotifications: number;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  mobileOpen: boolean;
  onOpenMobile: () => void;
  onCloseMobile: () => void;
};

export function Sidebar({
  displayName,
  email,
  profileId,
  unreadNotifications,
  collapsed,
  onToggleCollapsed,
  mobileOpen,
  onCloseMobile,
}: Props) {
  const pathname = usePathname();

  const sections = SECTIONS.map((sec) => ({
    ...sec,
    items: sec.items.map((item) => {
      if (item.href === "/profile") {
        return { ...item, href: `/profile/${profileId}` };
      }
      if (item.href === "/dashboard" && unreadNotifications > 0) {
        return { ...item, badge: unreadNotifications };
      }
      return item;
    }),
  }));

  const asideClass = [
    "sidebar fixed left-0 top-0 z-50 flex h-full min-h-[100dvh] flex-col border-r border-white/10 bg-deep text-white",
    "transition-[transform,width] duration-200 ease-out motion-reduce:transition-none",
    "w-[var(--sidebar-width)] overflow-visible",
    collapsed ? "sidebar--collapsed lg:w-[var(--sidebar-collapsed)]" : "",
    mobileOpen ? "sidebar--open translate-x-0" : "-translate-x-full lg:translate-x-0",
  ].join(" ");

  return (
    <aside className={asideClass} aria-label="Menu application">
      <div className="sidebar__brand relative border-b border-white/10 px-3 py-4">
        <Link
          href="/dashboard"
          className="sidebar__brand-link flex min-w-0 items-center gap-2 rounded-md px-1 py-1 hover:bg-white/5"
          onClick={onCloseMobile}
        >
          <span className="sidebar__brand-mark flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent text-white">
            <span className="material-symbols-outlined text-[22px]" aria-hidden="true">
              school
            </span>
          </span>
          <span className={`sidebar__brand-copy min-w-0 ${collapsed ? "lg:hidden" : ""}`}>
            <span className="sidebar__brand-text block truncate text-sm font-semibold">
              ÉduQc.IA
            </span>
          </span>
        </Link>
        <button
          type="button"
          className="sidebar__toggle sidebar__toggle--floating absolute -right-[0.95rem] top-1/2 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-deep text-white shadow-md hover:bg-white/10 lg:flex"
          aria-label={collapsed ? "Développer le menu" : "Réduire le menu"}
          onClick={onToggleCollapsed}
        >
          <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
            {collapsed ? "chevron_right" : "chevron_left"}
          </span>
        </button>
      </div>

      <div className="sidebar__nav flex-1 overflow-y-auto overflow-x-hidden px-2 py-3">
        <nav aria-label="Navigation principale">
          {sections.map((section) => (
            <div key={section.title} className="sidebar__section mb-4">
              <span
                className={`sidebar__section-label mb-2 block px-3 text-[10px] font-semibold uppercase tracking-wider text-white/45 ${
                  collapsed ? "lg:hidden" : ""
                }`}
              >
                {section.title}
              </span>
              <ul className="sidebar__menu space-y-0.5">
                {section.items.map((item) => {
                  const active = isActive(pathname, item.href);
                  return (
                    <li
                      key={item.href}
                      className={`sidebar__item ${active ? "sidebar__item--active" : ""}`}
                    >
                      <Link
                        href={item.href}
                        className={`sidebar__link relative flex items-center gap-2 rounded-md px-3 py-2 text-sm text-white/90 hover:bg-white/10 ${
                          active ? "bg-white/15 font-medium text-white" : ""
                        } ${collapsed ? "lg:justify-center lg:gap-0" : ""}`}
                        aria-current={active ? "page" : undefined}
                        data-tooltip={collapsed ? item.label : undefined}
                        onClick={onCloseMobile}
                      >
                        <span
                          className="sidebar__icon material-symbols-outlined shrink-0 text-[20px]"
                          aria-hidden="true"
                        >
                          {item.icon}
                        </span>
                        <span
                          className={`sidebar__label min-w-0 flex-1 truncate ${collapsed ? "lg:hidden" : ""}`}
                        >
                          {item.label}
                        </span>
                        {item.badge != null && item.badge > 0 ? (
                          <span
                            className={`shrink-0 self-center rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white ${
                              collapsed ? "lg:absolute lg:right-1 lg:top-1" : ""
                            }`}
                          >
                            {item.badge > 99 ? "99+" : item.badge}
                          </span>
                        ) : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      <div className="sidebar__footer border-t border-white/10 p-2">
        <div
          className={`mb-2 rounded-md px-3 py-2 text-xs text-white/60 ${collapsed ? "lg:hidden" : ""}`}
        >
          <p className="truncate font-medium text-white/90">{displayName}</p>
          <p className="truncate">{email}</p>
        </div>
        <form action={logoutAction} aria-label="Déconnexion">
          <button
            type="submit"
            className={`sidebar__logout flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-white/80 hover:bg-white/10 ${
              collapsed ? "lg:justify-center lg:gap-0" : ""
            }`}
          >
            <span className="material-symbols-outlined shrink-0 text-[20px]" aria-hidden="true">
              logout
            </span>
            <span className={`sidebar__footer-label ${collapsed ? "lg:hidden" : ""}`}>
              Déconnexion
            </span>
          </button>
        </form>
      </div>
    </aside>
  );
}
