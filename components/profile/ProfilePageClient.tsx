"use client";

import { useState } from "react";
import { ProfileHero } from "@/components/profile/ProfileHero";
import { ProfileContributions } from "@/components/profile/ProfileContributions";
import { ProfileEditSheet } from "@/components/profile/ProfileEditSheet";
import { DeleteAccountSection } from "@/components/profile/DeleteAccountSection";
import { ChangePasswordSection } from "@/components/profile/ChangePasswordSection";
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
  const [editOpen, setEditOpen] = useState(false);

  const { profile, counts, experienceLabel, isOwner } = overview;

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-12">
      <ProfileHero
        firstName={profile.firstName}
        lastName={profile.lastName}
        email={profile.email}
        role={profile.role}
        genre={profile.genre}
        schoolName={profile.schoolName}
        cssName={profile.cssName}
        createdAt={profile.createdAt}
        experienceLabel={experienceLabel}
        totalContributions={counts.total}
        niveaux={profile.niveaux}
        disciplines={profile.disciplines}
        yearsExperience={profile.yearsExperience}
        isOwner={isOwner}
        onEditClick={() => setEditOpen(true)}
      />

      <ProfileContributions
        profileId={profile.id}
        isOwner={isOwner}
        counts={counts}
        initialDocuments={initialDocuments}
        initialTasks={initialTasks}
        initialEvaluations={initialEvaluations}
      />

      {isOwner && <ChangePasswordSection />}

      {isOwner && <DeleteAccountSection />}

      {isOwner && (
        <ProfileEditSheet
          open={editOpen}
          onClose={() => setEditOpen(false)}
          currentFirstName={profile.firstName}
          currentLastName={profile.lastName}
          currentSchoolId={
            schoolOptions.find((s) => s.nomOfficiel === profile.schoolName)?.id ?? null
          }
          currentGenre={profile.genre}
          currentNiveaux={profile.niveaux}
          currentDisciplines={profile.disciplines}
          currentYearsExperience={profile.yearsExperience}
          cssOptions={cssOptions}
          schoolOptions={schoolOptions}
          profileId={profile.id}
        />
      )}
    </div>
  );
}
