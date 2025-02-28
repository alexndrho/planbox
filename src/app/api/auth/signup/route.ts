import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { genSalt, hash } from "bcryptjs";
import { userSignupInput } from "@/lib/validations/user";
import { ZodError } from "zod";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import IError, { authCode } from "@/types/IError";

export async function POST(request: Request) {
  try {
    const { email, password } = userSignupInput.parse(await request.json());

    const salt = await genSalt(10);
    const hashedPassword = await hash(password, salt);

    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    return NextResponse.json({ message: "success" });
  } catch (error) {
    if (error instanceof ZodError) {
      const zodError: IError = {
        errors: error.errors.map((err) => {
          let code: authCode = "auth/invalid-input";

          if (err.path.includes("email")) {
            code = "auth/invalid-email";
          } else if (err.path.includes("password")) {
            code = "auth/invalid-password";
          }

          return {
            code,
            message: err.message,
          };
        }),
      };

      return NextResponse.json(zodError, { status: 400 });
    } else if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json(
          {
            errors: [
              {
                code: "auth/invalid-email",
                message: "Email already exists",
              },
            ],
          } satisfies IError,
          { status: 400 }
        );
      }

      return NextResponse.json(
        {
          errors: [{ code: "unknown-error", message: "Unknown error" }],
        } as IError,
        { status: 500 }
      );
    }
  }
}
