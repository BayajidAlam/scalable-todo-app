import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string({
      required_error: "Please enter your name.",
    })
    .min(4),
  email: z
    .string({
      required_error: "Please enter your email address.",
    })
    .email(),
  password: z
    .string({
      required_error: "Please enter your password.",
    })
    .min(6),
  secret_pass: z
    .string({
      required_error: "Please enter your secret pass.",
    })
    .min(6),
});