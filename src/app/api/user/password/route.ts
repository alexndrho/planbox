import { NextResponse } from "next/server";
import { ZodError } from "zod";
import bcrypt from "bcryptjs";

import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { userPasswordUpdateInput } from "@/lib/validations/user";
import IError, { errorCode } from "@/types/IError";

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
    const { password, newPassword } = userPasswordUpdateInput.parse(
      await request.json()
    );

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

    const isMatch = bcrypt.compareSync(password, user.password);
    const isSamePassword = bcrypt.compareSync(newPassword, user.password);

    if (!isMatch) {
      return NextResponse.json(
        {
          errors: [
            { code: "auth/invalid-password", message: "Invalid password" },
          ],
        } satisfies IError,
        { status: 400 }
      );
    } else if (isSamePassword) {
      return NextResponse.json(
        {
          errors: [
            {
              code: "validation/invalid-input",
              message: "New password cannot be the same as the old password",
            },
          ],
        } satisfies IError,
        { status: 400 }
      );
    }

    const hashedPassword = bcrypt.hashSync(newPassword, 10);

    await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        password: hashedPassword,
      },
    });

    return NextResponse.json({ message: "Password updated" });
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
