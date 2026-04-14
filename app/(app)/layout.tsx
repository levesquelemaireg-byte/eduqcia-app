import { AppShell } from "@/components/layout/AppShell";
import { requireActiveAppUser } from "@/lib/auth/require-active-app-user";
import { getUnreadNotificationCount } from "@/lib/queries/dashboard";
import { getDisplayName } from "@/lib/utils/profile-display";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { userId, email, profileId, firstName, lastName } = await requireActiveAppUser();
  const unreadNotifications = await getUnreadNotificationCount(userId);

  return (
    <AppShell
      displayName={getDisplayName(firstName, lastName)}
      email={email}
      profileId={profileId}
      unreadNotifications={unreadNotifications}
    >
      {children}
    </AppShell>
  );
}
