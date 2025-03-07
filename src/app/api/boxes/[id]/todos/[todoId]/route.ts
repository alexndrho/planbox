import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import IError, { errorCode } from "@/types/IError";
import { todoUpdateInput } from "@/lib/validations/todo";

export const PUT = auth(async (request, { params }) => {
  const session = request.auth;

  if (!session?.user || !session.user.id) {
    return NextResponse.json(
      {
        errors: [{ code: "auth/unauthorized", message: "Unauthorized" }],
      } satisfies IError,
      { status: 401 }
    );
  }

  const { id, todoId } = (await params) as { id: string; todoId: string };

  if (typeof id !== "string") {
    return NextResponse.json(
      {
        errors: [
          { code: "validation/invalid-input", message: "Invalid box id" },
        ],
      } satisfies IError,
      { status: 400 }
    );
  } else if (typeof todoId !== "string") {
    return NextResponse.json(
      {
        errors: [
          { code: "validation/invalid-input", message: "Invalid todo id" },
        ],
      } satisfies IError,
      { status: 400 }
    );
  }

  try {
    const { todo, done, deadline } = todoUpdateInput.parse(
      await request.json()
    );

    await prisma.todo.update({
      where: {
        id: todoId,
        box: {
          id,
          userId: session.user.id,
        },
      },
      data: {
        todo,
        done,
        deadline,
      },
    });

    return NextResponse.json({ message: "Todo updated" });
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
                message: "Box not found",
              },
            ],
          } satisfies IError,
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      {
        errors: [{ code: "unknown-error", message: "Unknown error" }],
      } satisfies IError,
      { status: 500 }
    );
  }
});

export const DELETE = auth(async (request, { params }) => {
  const session = request.auth;

  if (!session?.user || !session.user.id) {
    return NextResponse.json(
      {
        errors: [{ code: "auth/unauthorized", message: "Unauthorized" }],
      } satisfies IError,
      { status: 401 }
    );
  }

  const { id, todoId } = (await params) as { id: string; todoId: string };

  if (typeof id !== "string") {
    return NextResponse.json(
      {
        errors: [
          { code: "validation/invalid-input", message: "Invalid box id" },
        ],
      } satisfies IError,
      { status: 400 }
    );
  } else if (typeof todoId !== "string") {
    return NextResponse.json(
      {
        errors: [
          { code: "validation/invalid-input", message: "Invalid todo id" },
        ],
      } satisfies IError,
      { status: 400 }
    );
  }

  try {
    await prisma.todo.delete({
      where: {
        id: todoId,
        box: {
          id,
          userId: session.user.id,
        },
      },
    });

    return NextResponse.json({ message: "Todo deleted" });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2015") {
        return NextResponse.json(
          {
            errors: [
              {
                code: "not-found",
                message: "Box not found",
              },
            ],
          } satisfies IError,
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      {
        errors: [{ code: "unknown-error", message: "Unknown error" }],
      } satisfies IError,
      { status: 500 }
    );
  }
});
