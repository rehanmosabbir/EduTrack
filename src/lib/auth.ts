import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import type { Role } from "@/types";
import * as authService from "@/server/services/auth.service";
import { AppError } from "@/server/utils/AppError";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: Role;
      studentId?: string | null;
      guardianId?: string | null;
    };
  }

  interface User {
    role?: Role;
    accessToken?: string;
    studentId?: string | null;
    guardianId?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    role?: Role;
    userId?: string;
    studentId?: string | null;
    guardianId?: string | null;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Email and Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          throw new Error("Email and password are required");
        }
        try {
          const result = await authService.loginWithPassword({
            email: credentials.email,
            password: credentials.password,
          });
          return {
            id: result.user.id,
            name: result.user.name,
            email: result.user.email,
            image: result.user.image,
            role: result.user.role,
            accessToken: result.accessToken,
            studentId: result.user.studentId,
            guardianId: result.user.guardianId,
          };
        } catch (err) {
          if (err instanceof AppError) throw new Error(err.message);
          throw new Error("Invalid email or password");
        }
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/login", error: "/login" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.role = user.role;
        token.userId = user.id;
        token.studentId = user.studentId;
        token.guardianId = user.guardianId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId ?? "";
        session.user.role = (token.role as Role) ?? "STUDENT";
        session.user.studentId = token.studentId;
        session.user.guardianId = token.guardianId;
        session.accessToken = token.accessToken;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
