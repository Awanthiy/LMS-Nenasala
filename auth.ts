import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { authConfig } from "@/auth.config";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations/auth";
import type { Role } from "@/lib/roles";

// Used to keep response time similar whether or not the email exists.
const DUMMY_HASH = bcrypt.hashSync("timing-equalizer", 12);

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(raw) {
        const parsed = loginSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        const user = await prisma.user.findFirst({ where: { email, deletedAt: null } });
        const valid = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
        if (!user || !valid || user.status !== "ACTIVE") return null;

        return { id: user.id, name: user.name, email: user.email, image: user.image, role: user.role as Role };
      },
    }),
  ],
});
