import { migrate } from "drizzle-orm/postgres-js/migrator";
import { db } from "./database";

migrate(db, { migrationsFolder: "drizzle" })
  .then(() => {
    console.log("Migrations completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error during migrations:", error);
    process.exit(1);
  });
