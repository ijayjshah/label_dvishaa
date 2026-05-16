import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { hashPassword, comparePassword, signToken, requireAuth } from "../lib/auth";
import { SignupBody, LoginBody } from "@workspace/api-zod";
import { logger } from "../lib/logger";

const router: Router = Router();

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function authUserJson(user: typeof usersTable.$inferSelect) {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt.toISOString(),
  };
}

router.post("/auth/signup", async (req, res): Promise<void> => {
  try {
    const parsed = SignupBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }
    const { fullName, phone, password } = parsed.data;
    const email = normalizeEmail(parsed.data.email);

    const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, email));
    if (existing) {
      res.status(400).json({ error: "Email already registered" });
      return;
    }

    const passwordHash = await hashPassword(password);
    const [user] = await db.insert(usersTable).values({ fullName, email, phone, passwordHash }).returning();
    const token = signToken({ userId: user.id, role: user.role });

    res.status(201).json({
      user: authUserJson(user),
      token,
    });
  } catch (err) {
    logger.error({ err }, "auth/signup failed");
    const expose = process.env.NODE_ENV !== "production";
    const message = err instanceof Error ? err.message : "Internal server error";
    res.status(500).json({ error: expose ? message : "Internal server error" });
  }
});

router.post("/auth/login", async (req, res): Promise<void> => {
  try {
    const parsed = LoginBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }
    const email = normalizeEmail(parsed.data.email);
    const { password } = parsed.data;

    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
    if (!user || !user.isActive) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    if (!user.passwordHash || typeof user.passwordHash !== "string") {
      logger.error({ userId: user.id }, "auth/login: user missing password_hash");
      res.status(500).json({
        error:
          process.env.NODE_ENV !== "production"
            ? "Account has no password set; reset or re-seed admin"
            : "Internal server error",
      });
      return;
    }

    const valid = await comparePassword(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const token = signToken({ userId: user.id, role: user.role });
    res.json({
      user: authUserJson(user),
      token,
    });
  } catch (err) {
    logger.error({ err }, "auth/login failed");
    const expose = process.env.NODE_ENV !== "production";
    const message = err instanceof Error ? err.message : "Internal server error";
    res.status(500).json({ error: expose ? message : "Internal server error" });
  }
});

router.post("/auth/logout", (_req, res): void => {
  res.json({ message: "Logged out" });
});

router.get("/auth/me", requireAuth, (req, res): void => {
  const user = (req as any).user;
  res.json({ id: user.id, fullName: user.fullName, email: user.email, phone: user.phone, role: user.role, isActive: user.isActive, createdAt: user.createdAt.toISOString() });
});

export default router;
