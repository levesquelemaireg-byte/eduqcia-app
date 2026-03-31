export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div>
      <h1 className="text-2xl font-semibold text-deep">Profil</h1>
      <p className="mt-2 text-sm text-muted">Identifiant : {id}</p>
      <p className="mt-2 text-sm text-muted">Vue publique enseignant — à venir.</p>
    </div>
  );
}
