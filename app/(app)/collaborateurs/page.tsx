import { createClient } from "@/lib/supabase/server";
import { getAllActiveCollaborateurs } from "@/lib/queries/collaborateurs-list";
import { getDisplayName, getInitials } from "@/lib/utils/profile-display";
import { redirect } from "next/navigation";

export default async function CollaborateursPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const collaborateurs = await getAllActiveCollaborateurs(supabase, user.id);

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-deep md:text-3xl">
          Enseignants collaborateurs
        </h1>
        <p className="mt-2 text-sm text-muted">
          {collaborateurs.length === 0
            ? "Aucun enseignant inscrit pour le moment."
            : `${collaborateurs.length} enseignant${collaborateurs.length > 1 ? "s" : ""} inscrit${collaborateurs.length > 1 ? "s" : ""} sur la plateforme.`}
        </p>
      </header>

      {collaborateurs.length > 0 ? (
        <ul className="divide-y divide-border rounded-lg border border-border bg-panel">
          {collaborateurs.map((c) => {
            const displayName = getDisplayName(c.first_name, c.last_name);
            const initials = getInitials(c.first_name, c.last_name);

            return (
              <li key={c.id} className="flex items-center gap-4 px-5 py-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/10 text-sm font-semibold text-accent">
                  {initials || "?"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-deep">{displayName}</p>
                  <p className="truncate text-xs text-muted">{c.email}</p>
                  {(c.school_name || c.css_name) && (
                    <p className="mt-0.5 truncate text-xs text-muted">
                      {[c.school_name, c.css_name].filter(Boolean).join(" · ")}
                    </p>
                  )}
                </div>
                <div className="shrink-0 text-right">
                  <span className="text-sm font-semibold text-deep">{c.tae_published_count}</span>
                  <p className="text-xs text-muted">
                    tâche{c.tae_published_count !== 1 ? "s" : ""} publiée
                    {c.tae_published_count !== 1 ? "s" : ""}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
