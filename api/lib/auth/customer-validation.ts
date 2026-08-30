import { z } from "zod";

export const customerLoginSchema = z.object({ email: z.string().trim().email("Ingresa un email válido.").max(254), password: z.string().min(8, "Ingresa una contraseña válida.").max(128) });
export const customerRegistrationSchema = customerLoginSchema.extend({ name: z.string().trim().min(2, "Ingresa tu nombre.").max(120) });