import { RegisterForm } from "@/components/auth/RegisterForm";
import { loadCssEcoles } from "@/lib/data/load-css-ecoles";

export default async function RegisterPage() {
  const cssEcoles = await loadCssEcoles();

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
      <RegisterForm cssEcoles={cssEcoles} />
    </>
  );
}
