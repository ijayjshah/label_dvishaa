import { eq } from "drizzle-orm";
import { db } from "./index";
import { categoriesTable, sizesTable, siteSettingsTable } from "./schema/index";
import { seedDefaultAdmin } from "./seed-default-admin";

async function seed() {
  await seedDefaultAdmin();

  // Categories
  const cats = [
    { name: "Kurtas & Suits", slug: "kurtas-suits", sortOrder: 1 },
    { name: "Sarees", slug: "sarees", sortOrder: 2 },
    { name: "Lehengas", slug: "lehengas", sortOrder: 3 },
    { name: "Dupattas", slug: "dupattas", sortOrder: 4 },
    { name: "Dresses", slug: "dresses", sortOrder: 5 },
    { name: "Co-ords", slug: "co-ords", sortOrder: 6 },
  ];
  for (const cat of cats) {
    const [ex] = await db.select().from(categoriesTable).where(eq(categoriesTable.slug, cat.slug));
    if (!ex) {
      await db.insert(categoriesTable).values(cat);
      console.log("Category created:", cat.name);
    }
  }

  // Sizes
  const sizes = [
    { label: "XS", bustRange: "30-31 in", waistRange: "24-25 in", hipRange: "33-34 in", heightRange: "under 5ft2", sortOrder: 1, isActive: true },
    { label: "S", bustRange: "32-33 in", waistRange: "26-27 in", hipRange: "35-36 in", heightRange: "5ft2-5ft4", sortOrder: 2, isActive: true },
    { label: "M", bustRange: "34-35 in", waistRange: "28-29 in", hipRange: "37-38 in", heightRange: "5ft2-5ft6", sortOrder: 3, isActive: true },
    { label: "L", bustRange: "36-37 in", waistRange: "30-31 in", hipRange: "39-40 in", heightRange: "5ft4-5ft7", sortOrder: 4, isActive: true },
    { label: "XL", bustRange: "38-39 in", waistRange: "32-33 in", hipRange: "41-42 in", heightRange: "5ft5-5ft8", sortOrder: 5, isActive: true },
    { label: "XXL", bustRange: "40-42 in", waistRange: "34-36 in", hipRange: "43-45 in", heightRange: "any height", sortOrder: 6, isActive: true },
  ];
  for (const size of sizes) {
    const [ex] = await db.select().from(sizesTable).where(eq(sizesTable.label, size.label));
    if (!ex) {
      await db.insert(sizesTable).values(size);
      console.log("Size created:", size.label);
    }
  }

  // Settings
  const settings = [
    { key: "store_name", value: "Label Dvisha", group: "general" },
    { key: "store_email", value: "hello@labeldvisha.com", group: "general" },
    { key: "store_phone", value: "+91 9999999999", group: "general" },
    { key: "store_address", value: "Mumbai, India", group: "general" },
    { key: "free_shipping_threshold", value: "999", group: "shipping" },
    { key: "currency", value: "INR", group: "general" },
    { key: "instagram_url", value: "https://instagram.com/labeldvisha", group: "social" },
    { key: "tagline", value: "Wear Your Story", group: "general" },
  ];
  for (const s of settings) {
    const [ex] = await db.select().from(siteSettingsTable).where(eq(siteSettingsTable.key, s.key));
    if (!ex) {
      await db.insert(siteSettingsTable).values(s);
      console.log("Setting created:", s.key);
    }
  }

  console.log("Seed complete!");
  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });
