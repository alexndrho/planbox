import type { Box } from "@prisma/client";

export async function getBoxes() {
  const response = await fetch("/api/boxes");

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.errors[0].message);
  }

  return data as Box[];
}

export async function getBox(id: string) {
  const response = await fetch(`/api/boxes/${id}`);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.errors[0].message);
  }

  return data as Box;
}

export async function addBox(name: string) {
  const response = await fetch("/api/boxes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.errors[0].message);
  }

  return data;
}

export async function moveToTrashBox(id: string) {
  const response = await fetch("/api/boxes", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.errors[0].message);
  }

  return data;
}

