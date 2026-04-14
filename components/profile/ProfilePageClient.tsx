"use client";

import { useState } from "react";
import { ProfileHero } from "@/components/profile/ProfileHero";
import { ProfileProfessionalInfo } from "@/components/profile/ProfileProfessionalInfo";
import { ProfileContributions } from "@/components/profile/ProfileContributions";
import { ProfileEditIdentity } from "@/components/profile/ProfileEditIdentity";
import { ProfileEditProfessional } from "@/components/profile/ProfileEditProfessional";
import { DeleteAccountSection } from "@/components/profile/DeleteAccountSection";
import type { ProfileOverview } from "@/lib/queries/profile-overview";
import type {
  ProfileDocument,
  ProfileTask,
  ProfileEvaluation,
} from "@/lib/queries/profile-contributions";

type Props = {
  overview: ProfileOverview;
  initialDocuments: ProfileDocument[];
  initialTasks: ProfileTask[];
  initialEvaluations: ProfileEvaluation[];
  cssOptions: { id: string; nomOfficiel: string }[];
  schoolOptions: { id: string; nomOfficiel: string; cssId: string }[];
};

export function ProfilePageClient({
  overview,
  initialDocuments,
  initialTasks,
  initialEvaluations,
  cssOptions,
  schoolOptions,
}: Props) {
  const [editIdentityOpen, setEditIdentityOpen] = useState(false);
  const [editProOpen, setEditProOpen] = useState(false);

  const { profile, counts, experienceLabel, isOwner } = overview;

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-12">
      <ProfileHero
        firstName={profile.firstName}
        lastName={profile.lastName}
        email={profile.email}
        role={profile.role}
        schoolName={profile.schoolName}
        cssName={profile.cssName}
        createdAt={profile.createdAt}
        experienceLabel={experienceLabel}
        totalContributions={counts.total}
        isOwner={isOwner}
        onEditClick={() => setEditIdentityOpen(true)}
      />

      <ProfileProfessionalInfo
        niveaux={profile.niveaux}
        disciplines={profile.disciplines}
        yearsExperience={profile.yearsExperience}
        isOwner={isOwner}
        onEditClick={() => setEditProOpen(true)}
      />

      <ProfileContributions
        profileId={profile.id}
        isOwner={isOwner}
        counts={counts}
        initialDocuments={initialDocuments}
        initialTasks={initialTasks}
        initialEvaluations={initialEvaluations}
      />

      {isOwner && <DeleteAccountSection />}

      {/* Side Sheets */}
      {isOwner && (
        <>
          <ProfileEditIdentity
            open={editIdentityOpen}
            onClose={() => setEditIdentityOpen(false)}
            currentFirstName={profile.firstName}
            currentLastName={profile.lastName}
            currentSchoolId={
              // Trouver l'ID école depuis le nom — on a les options
              schoolOptions.find((s) => s.nomOfficiel === profile.schoolName)?.id ?? null
            }
            cssOptions={cssOptions}
            schoolOptions={schoolOptions}
            onChainToProInfo={() => {
              setEditIdentityOpen(false);
              setTimeout(() => setEditProOpen(true), 300);
            }}
          />
          <ProfileEditProfessional
            open={editProOpen}
            onClose={() => setEditProOpen(false)}
            currentNiveaux={profile.niveaux}
            currentDisciplines={profile.disciplines}
            currentYearsExperience={profile.yearsExperience}
            onChainToIdentity={() => {
              setEditProOpen(false);
              setTimeout(() => setEditIdentityOpen(true), 300);
            }}
          />
        </>
      )}
    </div>
  );
}
