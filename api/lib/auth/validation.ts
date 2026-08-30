import { z } from "zod";

export const adminLoginSchema = z.object({
  email: z.string().trim().email("Ingresa un email válido.").max(254),
  password: z.string().min(4, "Ingresa una contraseña válida.").max(128),
});