export type UserRole = "cliente" | "administrador" | "empleado" | "ADMIN" | "EMPLOYEE";

export function isCustomerRole(role?: string | null) {
  const normalized = role?.toLowerCase();
  return normalized === "cliente" || normalized === "customer";
}

export function isAdminRole(role?: string | null) {
  const normalized = role?.toLowerCase();
  return normalized === "administrador" || normalized === "empleado" || normalized === "admin" || normalized === "employee";
}

export type PublicUser = { id: string; email: string; name: string; createdAt: string; role?: UserRole };
export type AuthUserRecord = PublicUser & { passwordHash: string };
export type AuthSession = { userId: string; tokenHash: string; expiresAt: string };