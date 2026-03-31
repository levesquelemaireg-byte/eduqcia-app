/**
 * Types auth partagés. Les Server Actions ne sont pas réexportées ici (Next.js : pas de barrel
 * `use server` avec réexports) — importer depuis `auth-login`, `auth-register`, `auth-resend`, `auth-logout`.
 */
export type { AuthErrorCode } from "@/lib/actions/auth-errors";
export type { LoginPayload } from "@/lib/actions/auth-login";
