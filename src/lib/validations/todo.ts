import { z } from "zod";
import { Prisma } from "@prisma/client";

export const todoInput = z.object({
  todo: z.string().nonempty("Text is required").max(100, "Text is too long"),
  done: z.boolean().optional(),
  deadline: z.date().optional(),
}) satisfies z.Schema<Omit<Prisma.TodoCreateInput, "box">>;

export const todoUpdateInput = todoInput.partial();
