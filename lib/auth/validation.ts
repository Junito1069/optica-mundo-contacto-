import { z } from "zod";

export const registrationSchema = z.object({ name: z.string().trim().min(2, "Ingresa tu nombre."), email: z.string().trim().email("Ingresa un email válido.").max(254), password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres.").max(128) });
export const loginSchema = registrationSchema.pick({ email: true, password: true });