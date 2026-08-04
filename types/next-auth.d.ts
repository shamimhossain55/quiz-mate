import NextAuth, { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      role?: "admin" | "user" | string;
    } & DefaultSession["user"];
  }

  interface User {
    role?: "admin" | "user" | string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "admin" | "user" | string;
  }
}
