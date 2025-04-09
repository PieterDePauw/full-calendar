// Import modules
import { sql, type InferInsertModel, type InferSelectModel } from "drizzle-orm"
import { pgTable, pgEnum, text, boolean, uuid, timestamp } from "drizzle-orm/pg-core"

// Define the event color enum
// biome-ignore format: "keep the code as is"
export const colorEnum = pgEnum("event_color", [ "sky", "amber", "violet", "rose", "emerald", "orange", "red", "green", "blue", "purple", "pink", "yellow", "gray", "slate", "zinc", "neutral", "stone"])

// Define the schema for the events table
// biome-ignore format: "keep the code as is"
export const eventsTable = pgTable("events", {
    id: uuid("id").notNull().primaryKey().default(sql`gen_random_uuid()`),
    title: text("title").notNull(),
    description: text("description").default("").notNull(),
    location: text("location").default("").notNull(),
    color: colorEnum("color").default("neutral").notNull(),
    allDay: boolean("all_day").default(false).notNull(),
    start: timestamp("start", { withTimezone: true }).notNull(),
    end: timestamp("end", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull().$defaultFn(() => new Date()),
    updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdateFn(() => new Date()),
})

// Define the types for the events table
export type EventType = InferSelectModel<typeof eventsTable>
export type NewEventType = InferInsertModel<typeof eventsTable>
export type UpdateEventType = Partial<NewEventType> & { id: string }
