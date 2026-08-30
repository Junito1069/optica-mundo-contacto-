export type PublicUser = { id: string; email: string; name: string; createdAt: string };
export type AuthUserRecord = PublicUser & { passwordHash: string };
export type AuthSession = { userId: string; tokenHash: string; expiresAt: string };