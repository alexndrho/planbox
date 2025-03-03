import { Prisma } from "@prisma/client";
import { z } from "zod";

export const boxInput = z.object({
  name: z.string().nonempty("Name is required").max(100, "Name is too long"),
}) satisfies z.Schema<Omit<Prisma.BoxCreateInput, "user">>;
