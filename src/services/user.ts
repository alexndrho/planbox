import { User } from "@prisma/client";

export default async function getMyUserInfo() {
  const response = await fetch("/api/user");
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.errors[0].message);
  }

  return data as User;
}
