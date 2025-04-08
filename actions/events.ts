"use server"

// Import modules
import { db } from "@/db/client"
import { eventsTable } from "@/db/schema"
import { type CalendarEvent, type EventColor } from "@/components/full-calendar"
import { eq } from "drizzle-orm"

// Get all events from the database
export async function getEvents(): Promise<CalendarEvent[]> {
    // > Select all rows from the events table
    const events = await db.select().from(eventsTable)

    // > Map the rows to CalendarEvent objects
    return events.map((event) => ({ id: event.id, title: event.title, description: event.description ?? undefined, start: event.start, end: event.end, allDay: event.allDay, color: event.color as EventColor, location: event.location ?? undefined }))
}

// Create a new event in the database
export async function createEventAction(eventData: CalendarEvent): Promise<CalendarEvent> {
    // > Insert a new event into the events table
    const [newEvent] = await db
        .insert(eventsTable)
        .values({
            title: eventData.title,
            description: eventData.description,
            start: eventData.start,
            end: eventData.end,
            allDay: eventData.allDay ?? false,
            // Just store the string. Drizzle will validate if it's an enum in the DB schema:
            color: eventData.color as EventColor,
            location: eventData.location,
        })
        .returning()

    // Convert to CalendarEvent
    return {
        id: newEvent.id,
        title: newEvent.title,
        description: newEvent.description ?? undefined,
        start: newEvent.start,
        end: newEvent.end,
        allDay: newEvent.allDay,
        color: newEvent.color as EventColor | undefined,
        location: newEvent.location ?? undefined,
    }
}

// Update an existing event in the database
export async function updateEventAction(modifiedEvent: CalendarEvent): Promise<CalendarEvent> {
    // > Update the matching row, returning the updated record
    const [updatedEvent] = await db
        .update(eventsTable)
        .set({
            title: modifiedEvent.title,
            description: modifiedEvent.description,
            start: modifiedEvent.start,
            end: modifiedEvent.end,
            allDay: modifiedEvent.allDay ?? false,
            color: modifiedEvent.color,
            location: modifiedEvent.location,
        })
        .where(eq(eventsTable.id, modifiedEvent.id))
        .returning()

    // > Return the updated event converted to CalendarEvent
    return {
        id: updatedEvent.id,
        title: updatedEvent.title,
        description: updatedEvent.description ?? undefined,
        start: updatedEvent.start,
        end: updatedEvent.end,
        allDay: updatedEvent.allDay ?? false,
        color: updatedEvent.color as EventColor | undefined,
        location: updatedEvent.location ?? undefined,
    }
}

// Delete an event by ID
export async function deleteEventAction(eventId: string): Promise<CalendarEvent> {
    // > Delete the event with the specified ID, returning the deleted row
    const [deletedEvent] = await db.delete(eventsTable).where(eq(eventsTable.id, eventId)).returning()

    // > Return the deleted row or handle the case if it didn't exist
    return {
        id: deletedEvent.id,
        title: deletedEvent.title,
        description: deletedEvent.description ?? undefined,
        start: deletedEvent.start,
        end: deletedEvent.end,
        allDay: deletedEvent.allDay ?? false,
        color: deletedEvent.color as EventColor | undefined,
        location: deletedEvent.location ?? undefined,
    }
}
