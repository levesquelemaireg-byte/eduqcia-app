import { redirect } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type ActiveAppUser = {
  userId: string;
  email: string;
  profileId: string;
  fullName: string;
};

/**
 * Session obligatoire + profil actif — même garde-fou que `(app)/layout.tsx`.
 */
export async function requireActiveAppUser(): Promise<ActiveAppUser> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const admin = createServiceClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("id, full_name, status")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.status !== "active") {
    redirect("/activate");
  }

  return {
    userId: user.id,
    email: user.email ?? "",
    profileId: profile.id,
    fullName: profile.full_name,
  };
}
