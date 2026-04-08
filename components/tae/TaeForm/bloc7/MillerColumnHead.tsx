export function MillerColumnHead({ label }: { label: string }) {
  return (
    <div className="bg-accent px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-white">
      {label}
    </div>
  );
}
