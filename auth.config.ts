import type { NextAuthConfig } from "next-auth";
import { ROLE_HOME, isRole, roleForPath, type Role } from "@/lib/roles";

const PUBLIC_PATHS = ["/login", "/forgot-password", "/reset-password"];
const PUBLIC_API_PREFIXES = ["/api/auth", "/api/health"];

/** Edge-safe config (no Prisma / bcrypt). Used by middleware. */
export const authConfig = {
  pages: { signIn: "/login" },
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const path = nextUrl.pathname;
      const user = auth?.user;
      const isApi = path.startsWith("/api/");

      if (PUBLIC_API_PREFIXES.some((p) => path.startsWith(p))) return true;

      if (PUBLIC_PATHS.includes(path)) {
        if (user && isRole(user.role) && path === "/login") {
          return Response.redirect(new URL(ROLE_HOME[user.role], nextUrl));
        }
        return true;
      }

      if (!user) {
        if (isApi) {
          return Response.json({ success: false, message: "Authentication required", errors: {} }, { status: 401 });
        }
        return false; // redirects to /login
      }

      const owner = roleForPath(path);
      if (owner && owner !== user.role) {
        if (isApi) {
          return Response.json({ success: false, message: "Forbidden", errors: {} }, { status: 403 });
        }
        return Response.redirect(new URL(isRole(user.role) ? ROLE_HOME[user.role] : "/login", nextUrl));
      }
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as Role;
      return session;
    },
  },
} satisfies NextAuthConfig;