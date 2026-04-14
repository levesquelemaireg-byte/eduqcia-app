import { RegisterForm } from "@/components/auth/RegisterForm";
import { getAllCss, getAllSchools } from "@/lib/queries/css-schools";

export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  const [cssList, allSchools] = await Promise.all([getAllCss(), getAllSchools()]);

  return (
    <>
      <h2 className="mb-[var(--space-2)] text-lg font-semibold tracking-tight text-deep">
        Inscription
      </h2>
      <p className="mb-[var(--space-4)] text-sm leading-relaxed text-muted">
        Seuls les courriels institutionnels{" "}
        <span className="whitespace-nowrap font-medium text-steel">(@*.gouv.qc.ca)</span> sont
        acceptés.
      </p>
      <RegisterForm cssList={cssList} allSchools={allSchools} />
    </>
  );
}
