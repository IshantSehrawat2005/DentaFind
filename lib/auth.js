import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getDb } from "./mongodb";

const memoryUsers = [];

const providers = [
  CredentialsProvider({
    name: "Credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      const { email, password } = credentials;
      const db = await getDb();
      if (db) {
        const user = await db.collection("users").findOne({ email });
        if (!user) return null;
        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) return null;
        return { id: user._id.toString(), name: user.name, email: user.email, role: user.role, phone: user.phone };
      } else {
        const user = memoryUsers.find((u) => u.email === email);
        if (!user) return null;
        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) return null;
        return { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone };
      }
    },
  }),
];

// Dynamically add Google provider if configured
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID !== "your-google-client-id") {
  const GoogleProvider = require("next-auth/providers/google").default;
  providers.push(GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  }));
}

// Dynamically add GitHub provider if configured
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_ID !== "your-github-client-id") {
  const GitHubProvider = require("next-auth/providers/github").default;
  providers.push(GitHubProvider({
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
  }));
}

export const authOptions = {
  providers,
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.role = user.role || "patient";
        token.userId = user.id;
        token.phone = user.phone;
      }
      if (account?.provider === "google" || account?.provider === "github") {
        token.role = "patient";
        // Save OAuth user to DB
        const db = await getDb();
        if (db) {
          const existing = await db.collection("users").findOne({ email: token.email });
          if (!existing) {
            const result = await db.collection("users").insertOne({
              name: token.name, email: token.email, role: "patient",
              provider: account.provider, createdAt: new Date(),
            });
            token.userId = result.insertedId.toString();
          } else {
            token.userId = existing._id.toString();
            token.role = existing.role;
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      session.user.role = token.role;
      session.user.id = token.userId;
      session.user.phone = token.phone;
      return session;
    },
  },
  pages: { signIn: "/auth" },
  secret: process.env.NEXTAUTH_SECRET,
};

export { memoryUsers };
