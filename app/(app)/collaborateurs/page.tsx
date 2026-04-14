import { createClient } from "@/lib/supabase/server";
import { getAllActiveCollaborateurs } from "@/lib/queries/collaborateurs-list";
import { CollaborateursClient } from "@/components/collaborateurs/CollaborateursClient";
import { redirect } from "next/navigation";

export default async function CollaborateursPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { items, total } = await getAllActiveCollaborateurs(supabase, user.id);

  return <CollaborateursClient currentUserId={user.id} initialItems={items} initialTotal={total} />;
}
