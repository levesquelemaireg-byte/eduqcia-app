import { AppShell } from "@/components/layout/AppShell";
import { requireActiveAppUser } from "@/lib/auth/require-active-app-user";
import { getUnreadNotificationCount } from "@/lib/queries/dashboard";
import { getMissingProInfoCount } from "@/lib/queries/profile-missing-info";
import { createClient } from "@/lib/supabase/server";
import { getDisplayName } from "@/lib/utils/profile-display";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { userId, email, profileId, firstName, lastName } = await requireActiveAppUser();
  const supabase = await createClient();
  const [unreadNotifications, missingProInfoCount] = await Promise.all([
    getUnreadNotificationCount(userId),
    getMissingProInfoCount(supabase, userId),
  ]);

  return (
    <AppShell
      displayName={getDisplayName(firstName, lastName)}
      email={email}
      profileId={profileId}
      unreadNotifications={unreadNotifications}
      missingProInfoCount={missingProInfoCount}
    >
      {children}
    </AppShell>
  );
}
