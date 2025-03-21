import { z } from "zod";
import { Prisma } from "@prisma/client";

export const noteInput = z.object({
  content: z.string(),
}) satisfies z.Schema<Omit<Prisma.NoteCreateInput, "box">>;
