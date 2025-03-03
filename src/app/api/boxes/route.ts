import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z, ZodError } from "zod";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { boxInput } from "@/lib/validations/box";
import IError, { errorCode } from "@/types/IError";

const deleteBoxInput = z.object({
  id: z.string(),
});

export const GET = auth(async (request) => {
  const session = request.auth;

  if (!session?.user || !session.user.email) {
    return NextResponse.json(
      {
        errors: [{ code: "auth/unauthorized", message: "Unauthorized" }],
      } satisfies IError,
      { status: 401 }
    );
  }

  const boxes = await prisma.box.findMany({
    where: {
      user: {
        email: session.user.email,
      },
    },
    orderBy: [
      {
        updatedAt: "desc",
      },
    ],
  });

  return NextResponse.json(boxes);
});

export const POST = auth(async (request) => {
  const session = request.auth;

  if (!session?.user || !session.user.email) {
    return NextResponse.json(
      {
        errors: [{ code: "auth/unauthorized", message: "Unauthorized" }],
      } satisfies IError,
      { status: 401 }
    );
  }

  try {
    const { name } = boxInput.parse(await request.json());

    await prisma.box.create({
      data: {
        name,
        user: {
          connect: {
            email: session.user.email,
          },
        },
      },
    });

    return NextResponse.json({ message: `${name} box created` });
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
      if (error.code === "P2002") {
        return NextResponse.json(
          {
            errors: [
              {
                code: "validation/unique-constraint",
                message: "Box name must be unique",
              },
            ],
          } satisfies IError,
          { status: 400 }
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

export const DELETE = auth(async (request) => {
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
    const { id } = deleteBoxInput.parse(await request.json());

    const deletedBox = await prisma.box.delete({
      where: {
        id,
        userId: session.user.id,
      },
    });

    return NextResponse.json({
      message: `${deletedBox.name} box has been deleted`,
    });
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
    }

    return NextResponse.json(
      {
        errors: [{ code: "unknown-error", message: "Something went wrong" }],
      } satisfies IError,
      { status: 500 }
    );
  }
});
