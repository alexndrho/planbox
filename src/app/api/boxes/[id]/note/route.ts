import { NextResponse } from "next/server";
import { z, ZodError } from "zod";
import sanitizeHtml from "sanitize-html";

import { auth } from "@/lib/auth";
import { noteInput } from "@/lib/validations/note";
import IError, { errorCode } from "@/types/IError";
import { prisma } from "@/lib/db";

const noteInputSanitize = noteInput.extend({
  content: z.string().transform((data) =>
    sanitizeHtml(data, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat(["span", "div"]),
      allowedAttributes: {
        "*": ["style", "class"],
        a: ["href", "name", "target"],
        img: ["src"],
      },
    })
  ),
});

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
    const { content } = noteInputSanitize.parse(await request.json());

    await prisma.note.upsert({
      where: {
        boxId: id,
      },
      create: {
        content,
        box: {
          connect: {
            id,
            userId: session.user.id,
          },
        },
      },
      update: {
        content,
        box: {
          connect: {
            id,
            userId: session.user.id,
          },
        },
      },
    });
    return NextResponse.json({ message: "Note updated" });
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
    const note = await prisma.note.findUnique({
      where: {
        boxId: id,
        box: {
          userId: session.user.id,
        },
      },
    });

    console.log(note);

    return NextResponse.json(note);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        errors: [{ code: "unknown-error", message: "Unknown error" }],
      } satisfies IError,
      { status: 500 }
    );
  }
});
