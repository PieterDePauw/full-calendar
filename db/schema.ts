// Import modules
import { pgTable, pgEnum, text, boolean, uuid, timestamp } from "drizzle-orm/pg-core"

// Define the event color enum
// biome-ignore format: "keep the code as is"
export const eventColorEnum = pgEnum("event_color", [ "sky", "amber", "violet", "rose", "emerald", "orange", "red", "green", "blue", "purple", "pink", "yellow", "gray", "slate", "zinc", "neutral", "stone"])

// Define the schema for the events table
// biome-ignore format: "keep the code as is"
export const eventsTable = pgTable("events", {
    id: uuid("id").defaultRandom().primaryKey(),
    title: text("title").notNull(),
    description: text("description"),
    location: text("location"),
    color: eventColorEnum("color").default("neutral").notNull(),
    allDay: boolean("all_day").default(false).notNull(),
    start: timestamp("start", { withTimezone: true }).notNull(),
    end: timestamp("end", { withTimezone: true }).notNull(),
})
