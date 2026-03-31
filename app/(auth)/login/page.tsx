import { LoginForm } from "@/components/auth/LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const sp = await searchParams;
  const nextPath = sp.next?.startsWith("/") && !sp.next.startsWith("//") ? sp.next : "/dashboard";

  return (
    <>
      <h2 className="mb-[var(--space-4)] text-lg font-semibold tracking-tight text-deep">
        Connexion
      </h2>
      <LoginForm nextPath={nextPath} errorParam={sp.error ?? null} />
    </>
  );
}
