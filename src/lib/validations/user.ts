import { Prisma } from "@prisma/client";
import { z } from "zod";

export const zodPassword = z
  .string()
  .min(6, "Password must be at least 6 characters")
  .max(30, "Password must be at most 30 characters")
  .regex(/[a-z]/, "Lowercase character required")
  .regex(/[A-Z]/, "Uppercase character required")
  .regex(/[0-9]/, "Numeric character required")
  .regex(
    /[\^$*.[\]{}()?"!@#%&/\\,><':;|_~]/,
    "Non-alphanumeric character required"
  );

export const userSignupInput = z.object({
  email: z.string().email("Invalid email address"),
  password: zodPassword,
}) satisfies z.Schema<Prisma.UserCreateInput>;

export const userLoginInput = userSignupInput
  .extend({
    confirmPassword: z.string(),
  })
  .superRefine(({ password, confirmPassword }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: "custom",
        message: "The passwords did not match",
        path: ["confirmPassword"],
      });
    }
  });

export const userProfileUpdateInput = z.object({
  name: z.string().max(255, "Name must be at most 255 characters"),
}) satisfies z.Schema<Prisma.UserUpdateInput>;

export const userPasswordUpdateInput = userSignupInput
  .pick({ password: true })
  .extend({
    newPassword: zodPassword,
  });

export const userPasswordUpdateWithConfirmInput = userPasswordUpdateInput
  .extend({
    confirmPassword: z.string(),
  })
  .superRefine(({ newPassword, confirmPassword }, ctx) => {
    if (confirmPassword !== newPassword) {
      ctx.addIssue({
        code: "custom",
        message: "The passwords did not match",
        path: ["confirmPassword"],
      });
    }
  });
