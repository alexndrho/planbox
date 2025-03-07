import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { todoInput } from "@/lib/validations/todo";
import IError, { errorCode } from "@/types/IError";

export const POST = auth(async (request, { params }) => {
  const session = request.auth;

  if (!session?.user || !session.user.id) {
    return NextResponse.json(
      {
        errors: [{ code: "auth/unauthorized", message: "Unauthorized" }],
      } satisfies IError,
      { status: 401 }
    );
  }

  const { id } = (await params) as { id: string };

  if (typeof id !== "string") {
    return NextResponse.json(
      {
        errors: [
          { code: "validation/invalid-input", message: "Invalid box id" },
        ],
      } satisfies IError,
      { status: 400 }
    );
  }

  try {
    const data = await request.json();

    const { todo, done, deadline } = todoInput.parse({
      ...data,
      deadline: data.deadline ? new Date(data.deadline) : undefined,
    });

    await prisma.todo.create({
      data: {
        todo,
        done,
        deadline,
        box: {
          connect: {
            id,
            userId: session.user.id,
          },
        },
      },
    });

    return NextResponse.json({ message: "Todo created" });
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
                message: "Todo already exists",
              },
            ],
          } satisfies IError,
          { status: 400 }
        );
      } else if (error.code === "P2015") {
        return NextResponse.json({
          errors: [
            {
              code: "not-found",
              message: "Box not found",
            },
          ],
        } satisfies IError);
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

export const GET = auth(async (request, { params }) => {
  const session = request.auth;

  if (!session?.user || !session.user.id) {
    return NextResponse.json(
      {
        errors: [{ code: "auth/unauthorized", message: "Unauthorized" }],
      } satisfies IError,
      { status: 401 }
    );
  }

  const { id } = (await params) as { id: string };

  if (typeof id !== "string") {
    return NextResponse.json(
      {
        errors: [
          { code: "validation/invalid-input", message: "Invalid box id" },
        ],
      } satisfies IError,
      { status: 400 }
    );
  }

  try {
    const todos = await prisma.todo.findMany({
      where: {
        boxId: id,
        box: {
          userId: session.user.id,
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json(todos);
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
