import { Prisma } from "@prisma/client";
import { z } from "zod";

export const boxInput = z.object({
  name: z.string().nonempty("Name is required"),
}) satisfies z.Schema<Omit<Prisma.BoxCreateInput, "user">>;
