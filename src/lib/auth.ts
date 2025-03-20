import NextAuth, { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db";
import { compare } from "bcryptjs";
import { userSignupInput } from "./validations/user";
import { z } from "zod";

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        try {
          const { email, password } = await userSignupInput.parseAsync(
            credentials
          );

          const existingUser = await prisma.user.findFirst({
            where: {
              email: email,
            },
          });

          if (!existingUser) return null;

          const passwordMatch = await compare(password, existingUser.password);

          if (!passwordMatch) return null;

          return {
            id: existingUser.id,
            email: existingUser.email,
            name: existingUser.name,
          };
        } catch (error) {
          if (error instanceof z.ZodError) {
            return null;
          }

          return null;
        }
      },
    }),
  ],

  callbacks: {
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
      }

      if (trigger === "update") {
        if (session?.name) {
          token.name = session.name;
        }
        if (session?.email) {
          token.email = session.email;
        }
      }

      return token;
    },
    session({ session, token }) {
      if (token.id) {
        session.user.id = token.id;
      }
      return session;
    },
  },
};

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  ...authConfig,
});
