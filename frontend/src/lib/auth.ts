import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import type { Role } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: Role;
      studentProfileId?: string | null;
    };
  }

  interface User {
    role?: Role;
    accessToken?: string;
    studentProfileId?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    role?: Role;
    userId?: string;
    studentProfileId?: string | null;
  }
}

type AuthApiResponse = {
  data: {
    user: {
      id: string;
      name: string;
      email: string;
      image?: string | null;
      role: Role;
      studentProfileId?: string | null;
    };
    accessToken: string;
  };
};

function applyAuthUser(
  user: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: Role;
    accessToken?: string;
    studentProfileId?: string | null;
  },
  payload: AuthApiResponse["data"],
) {
  user.id = payload.user.id;
  user.name = payload.user.name;
  user.email = payload.user.email;
  user.image = payload.user.image;
  user.role = payload.user.role;
  user.accessToken = payload.accessToken;
  user.studentProfileId = payload.user.studentProfileId;
}

const googleConfigured =
  !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET;

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

        const res = await fetch(`${API_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
          }),
        });

        if (!res.ok) {
          const body = (await res.json().catch(() => null)) as {
            error?: { message?: string };
          } | null;
          throw new Error(body?.error?.message ?? "Invalid email or password");
        }

        const body = (await res.json()) as AuthApiResponse;
        return {
          id: body.data.user.id,
          name: body.data.user.name,
          email: body.data.user.email,
          image: body.data.user.image,
          role: body.data.user.role,
          accessToken: body.data.accessToken,
          studentProfileId: body.data.user.studentProfileId,
        };
      },
    }),
    ...(googleConfigured
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          }),
        ]
      : []),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "credentials") {
        return true;
      }

      if (account?.provider !== "google") return false;

      try {
        const res = await fetch(`${API_URL}/auth/google-sync`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: user.email,
            name: user.name,
            image: user.image,
            googleId: account.providerAccountId,
          }),
        });

        if (!res.ok) {
          const body = (await res.json().catch(() => null)) as {
            error?: { message?: string };
          } | null;
          const message =
            body?.error?.message ?? "Google sign-in failed";
          return `/login?error=${encodeURIComponent(message)}`;
        }

        const body = (await res.json()) as AuthApiResponse;
        applyAuthUser(user, body.data);
        return true;
      } catch {
        return `/login?error=${encodeURIComponent("Unable to verify account")}`;
      }
    },
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.role = user.role;
        token.userId = user.id;
        token.studentProfileId = user.studentProfileId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId ?? "";
        session.user.role = (token.role as Role) ?? "STUDENT";
        session.user.studentProfileId = token.studentProfileId;
        session.accessToken = token.accessToken;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
