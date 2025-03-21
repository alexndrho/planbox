import type { Note } from "@prisma/client";
import type { Content } from "@tiptap/react";

export const upsertNote = async (boxId: string, content: Content) => {
  const response = await fetch(`/api/boxes/${boxId}/note`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.errors[0].message);
  }

  return data as Note;
};

export const getNote = async (boxId: string) => {
  const response = await fetch(`/api/boxes/${boxId}/note`);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.errors[0].message);
  }

  return data as Note | null;
};
