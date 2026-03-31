import { AppShell } from "@/components/layout/AppShell";
import { requireActiveAppUser } from "@/lib/auth/require-active-app-user";
import { getUnreadNotificationCount } from "@/lib/queries/dashboard";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { userId, email, profileId, fullName } = await requireActiveAppUser();
  const unreadNotifications = await getUnreadNotificationCount(userId);

  return (
    <AppShell
      displayName={fullName}
      email={email}
      profileId={profileId}
      unreadNotifications={unreadNotifications}
    >
      {children}
    </AppShell>
  );
}
