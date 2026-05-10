import { eq } from "drizzle-orm";
import { db } from "./index";
import { usersTable } from "./schema/index";
import bcrypt from "bcryptjs";

const DEFAULT_EMAIL = "admin@labeldvisha.com";
const DEFAULT_PASSWORD = "Admin@1234";

export type SeedAdminOptions = {
  email?: string;
  password?: string;
  fullName?: string;
  phone?: string;
};

/**
 * Ensures an admin user exists (idempotent). Uses env overrides when set:
 * SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD, SEED_ADMIN_NAME, SEED_ADMIN_PHONE
 */
export async function seedDefaultAdmin(options: SeedAdminOptions = {}): Promise<void> {
  const email = options.email ?? process.env.SEED_ADMIN_EMAIL ?? DEFAULT_EMAIL;
  const password = options.password ?? process.env.SEED_ADMIN_PASSWORD ?? DEFAULT_PASSWORD;
  const fullName = options.fullName ?? process.env.SEED_ADMIN_NAME ?? "Label Dvisha Admin";
  const phone = options.phone ?? process.env.SEED_ADMIN_PHONE ?? "9999999999";

  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (existing.length > 0) {
    console.log("Admin already exists:", email);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await db.insert(usersTable).values({
    fullName,
    email,
    phone,
    passwordHash,
    role: "admin",
  });
  console.log("Admin user created:", email);
  if (!process.env.SEED_ADMIN_PASSWORD) {
    console.log("Initial password (set SEED_ADMIN_PASSWORD in .env next time):", password);
  }
  console.log("Change this password after first login in production.");
}
