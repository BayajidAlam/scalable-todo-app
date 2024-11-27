import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string({
      required_error: "Please enter your email address.",
    })
    .email(),
  password: z
    .string({
      required_error: "Please enter your password.",
    })
    .min(6)
    .max(12),
});