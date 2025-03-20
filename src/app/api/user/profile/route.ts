import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";

import { auth } from "@/lib/auth";
import { userProfileUpdateInput } from "@/lib/validations/user";
import IError, { errorCode } from "@/types/IError";
import { prisma } from "@/lib/db";

export const PUT = auth(async (request) => {
  const session = request.auth;

  if (!session?.user || !session.user.id) {
    return NextResponse.json(
      {
        errors: [{ code: "auth/unauthorized", message: "Unauthorized" }],
      } satisfies IError,
      { status: 401 }
    );
  }

  try {
    const { name } = userProfileUpdateInput.parse(await request.json());

    const user = await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        name,
      },
    });

    Reflect.deleteProperty(user, "password");

    return NextResponse.json(user);
  } catch (error) {
    if (error instanceof ZodError) {
      const zodError: IError = {
        errors: error.errors.map((err) => {
          const code: errorCode = "validation/invalid-input";

          return {
            code,
            message: err.message,
          };
        }),
      };

      return NextResponse.json(zodError, { status: 400 });
    } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2015") {
        return NextResponse.json(
          {
            errors: [
              {
                code: "not-found",
                message: "User not found",
              },
            ],
          } satisfies IError,
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      {
        errors: [{ code: "unknown-error", message: "Something went wrong" }],
      } satisfies IError,
      { status: 500 }
    );
  }
});
