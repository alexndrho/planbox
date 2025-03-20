import { z } from "zod";

import type {
  userPasswordUpdateInput,
  userProfileUpdateInput,
} from "@/lib/validations/user";
import { UserWithoutPassword } from "@/types/user";

export async function getMyUserInfo() {
  const response = await fetch("/api/user");
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.errors[0].message);
  }

  return data as UserWithoutPassword;
}

export async function updateMyPublicProfile(
  values: z.infer<typeof userProfileUpdateInput>
) {
  const response = await fetch("/api/user/profile", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(values),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.errors[0].message);
  }

  return data as UserWithoutPassword;
}

export async function updateMyPassword(
  values: z.infer<typeof userPasswordUpdateInput>
) {
  const response = await fetch("/api/user/password", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(values),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.errors[0].message);
  }

  return data;
}
