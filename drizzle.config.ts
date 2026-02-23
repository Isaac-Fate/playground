import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// Load dotenv file
config({ path: ".env.local" });

export default defineConfig({
  out: "./drizzle",
  schema: "./src/server/db/schema",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
