import { setupDatabase } from "../lib/db";

async function main() {
  console.log("Setting up database schema...");
  await setupDatabase();
  console.log("Database setup complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
