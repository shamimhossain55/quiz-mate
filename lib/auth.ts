import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { adminDb } from "@/lib/firebase-admin";

// Optional fallback: Comma-separated list of admin emails in .env.local
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
      const email = (user?.email || token.email || "")?.toLowerCase().trim();

      if (email) {
        try {
          // Fetch role from Firestore 'users' collection keyed by email
          const userDocRef = adminDb.collection("users").doc(email);
          const userDoc = await userDocRef.get();

          if (userDoc.exists) {
            const userData = userDoc.data();
            token.role = userData?.role || (ADMIN_EMAILS.includes(email) ? "admin" : "user");
          } else {
            // Default role is "user" unless in ADMIN_EMAILS list
            const defaultRole = ADMIN_EMAILS.includes(email) ? "admin" : "user";
            token.role = defaultRole;

            // Provision initial document in 'users' collection
            await userDocRef.set(
              {
                email: email,
                name: user?.name || token.name || email.split("@")[0],
                role: defaultRole,
                createdAt: new Date().toISOString(),
              },
              { merge: true }
            );
          }
        } catch (error) {
          console.error("Error fetching user role from Firestore:", error);
          if (!token.role) {
            token.role = ADMIN_EMAILS.includes(email) ? "admin" : "user";
          }
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role || "user";
      }
      return session;
    },
  },
};