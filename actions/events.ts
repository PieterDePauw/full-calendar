"use server"

// Import modules
import { eq } from "drizzle-orm"
import { db } from "@/db/client"
import { eventsTable } from "@/db/schema"
import { type CalendarEvent } from "@/lib/types"

// Get all events from the database
export async function getEvents({ limit }: { limit?: number }): Promise<CalendarEvent[]> {
    // > Select all rows from the events table
    const events = limit ? await db.select().from(eventsTable).limit(limit) : await db.select().from(eventsTable)
    // > Return the events
    return events
}

// Create a new event in the database
export async function createEventAction(eventData: CalendarEvent): Promise<CalendarEvent> {
    // > Insert a new event into the events table
    const [newEvent] = await db.insert(eventsTable).values(eventData).returning()
    // > Return the new event
    return newEvent
}

// Update an existing event in the database
export async function updateEventAction(modifiedEvent: CalendarEvent): Promise<CalendarEvent> {
    // > Update the matching row, returning the updated record
    const [updatedEvent] = await db.update(eventsTable).set(modifiedEvent).where(eq(eventsTable.id, modifiedEvent.id)).returning()
    // > Return the updated event converted to CalendarEvent
    return updatedEvent
}

// Delete an event by ID
export async function deleteEventAction(eventId: string): Promise<CalendarEvent> {
    // > Delete the event with the specified ID, returning the deleted row
    const [deletedEvent] = await db.delete(eventsTable).where(eq(eventsTable.id, eventId)).returning()
    // > Return the deleted row or handle the case if it didn't exist
    return deletedEvent
}
