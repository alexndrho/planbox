import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import IError from "@/types/IError";
import { prisma } from "@/lib/db";

export const GET = auth(async (request) => {
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
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          errors: [{ code: "not-found", message: "User not found" }],
        } satisfies IError,
        { status: 404 }
      );
    }

    Reflect.deleteProperty(user, "password");

    return NextResponse.json(user);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        errors: [{ code: "unknown-error", message: "Something went wrong" }],
      } satisfies IError,
      { status: 500 }
    );
  }
});
