import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// Shell env vars (e.g. DATABASE_URL=prod pnpm db:migrate) take precedence
const envSetByShell = !!process.env.DATABASE_URL;
config();
config({
  path: ".env.local",
  override: !envSetByShell, // don't overwrite if user passed from shell
});

export default defineConfig({
  out: "./drizzle",
  schema: "./src/server/db/schema",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
