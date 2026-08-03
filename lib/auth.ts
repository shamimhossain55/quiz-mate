import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

// Comma-separated list of admin emails in .env.local
// e.g. ADMIN_EMAILS=admin@gmail.com,another@gmail.com
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;

        const email = credentials.email.trim();
        if (!email || !email.includes("@")) {
          throw new Error("সঠিক ইমেইল ঠিকানা প্রদান করুন");
        }

        const name = email.split("@")[0];

        return {
          id: email,
          name: name,
          email: email,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || "quizmate_secret_key_2026",
  callbacks: {
    async jwt({ token, user }) {
      // On initial sign-in, embed role into JWT
      if (user?.email) {
        const isAdmin = ADMIN_EMAILS.includes(user.email.toLowerCase());
        token.role = isAdmin ? "admin" : "user";
      }
      return token;
    },
    async session({ session, token }) {
      // Expose role to client session
      if (session.user) {
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
};