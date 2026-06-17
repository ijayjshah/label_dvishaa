import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "./index";
import { usersTable } from "./schema/index";

const DEFAULT_EMAIL = "labeldvisha4345@gmail.com";
const DEFAULT_PASSWORD = "Admin@1234";
const LEGACY_EMAIL = "admin@labeldvisha.com";

/**
 * Creates or updates the seed admin from env (SEED_ADMIN_*).
 * Unlike seedDefaultAdmin, this always applies the configured password and profile.
 */
async function resetSeedAdmin(): Promise<void> {
  const email = (process.env.SEED_ADMIN_EMAIL ?? DEFAULT_EMAIL).trim().toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD ?? DEFAULT_PASSWORD;
  const fullName = process.env.SEED_ADMIN_NAME ?? "Label Dvisha Admin";
  const phone = process.env.SEED_ADMIN_PHONE ?? "7990414960";
  const passwordHash = await bcrypt.hash(password, 12);

  const [byEmail] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (byEmail) {
    await db
      .update(usersTable)
      .set({ fullName, phone, passwordHash, role: "admin", isActive: true })
      .where(eq(usersTable.id, byEmail.id));
    console.log("Admin updated:", email);
    return;
  }

  const [legacy] = await db.select().from(usersTable).where(eq(usersTable.email, LEGACY_EMAIL));
  if (legacy) {
    await db
      .update(usersTable)
      .set({ email, fullName, phone, passwordHash, role: "admin", isActive: true })
      .where(eq(usersTable.id, legacy.id));
    console.log("Admin migrated from legacy email to:", email);
    return;
  }

  await db.insert(usersTable).values({
    fullName,
    email,
    phone,
    passwordHash,
    role: "admin",
  });
  console.log("Admin created:", email);
}

resetSeedAdmin()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
