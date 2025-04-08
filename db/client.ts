// Import modules
import { drizzle } from "drizzle-orm/neon-http"
import { neon } from "@neondatabase/serverless"

// Check if the environment variable is set
if (!process.env.NEON_DATABASE_URL) throw new Error("NEON_DATABASE_URL is not set")

// Define the database client
const client = neon(process.env.NEON_DATABASE_URL)

// Define the database connection
export const db = drizzle(client)
