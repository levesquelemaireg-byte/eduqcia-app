import type { ReactNode } from "react";
import { AppShellClient } from "@/components/layout/AppShellClient";

type Props = {
  children: ReactNode;
  displayName: string;
  email: string;
  profileId: string;
  unreadNotifications: number;
};

export function AppShell({ children, displayName, email, profileId, unreadNotifications }: Props) {
  return (
    <AppShellClient
      displayName={displayName}
      email={email}
      profileId={profileId}
      unreadNotifications={unreadNotifications}
    >
      {children}
    </AppShellClient>
  );
}
