import { Prisma } from "@prisma/client";
import { z } from "zod";

export const userSignupInput = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(30, "Password must be at most 30 characters")
    .regex(/[a-z]/, "Lowercase character required")
    .regex(/[A-Z]/, "Uppercase character required")
    .regex(/[0-9]/, "Numeric character required")
    .regex(
      /[\^$*.[\]{}()?"!@#%&/\\,><':;|_~]/,
      "Non-alphanumeric character required"
    ),
}) satisfies z.Schema<Prisma.UserCreateInput>;
