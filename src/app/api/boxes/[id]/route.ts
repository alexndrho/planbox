import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import IError from "@/types/IError";

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
    const box = await prisma.box.findUnique({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!box) {
      return NextResponse.json(
        {
          errors: [{ code: "not-found", message: "Box not found" }],
        } satisfies IError,
        { status: 404 }
      );
    }

    return NextResponse.json(box);
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
