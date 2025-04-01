"use client"

// Import modules
import { useState, useEffect, useMemo } from "react"
import { RiCalendarLine, RiDeleteBinLine } from "@remixicon/react"
import { format, isBefore } from "date-fns"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { formatTimeForInput, type CalendarEvent, type EventColor } from "@/components/full-calendar"

// Define the color options for the event dialog@
const colorOptions: { value: EventColor; label: string; bgClass: string; borderClass: string }[] = [
    {
        value: "sky",
        label: "Sky",
        bgClass: "bg-sky-400 data-[state=checked]:bg-sky-400",
        borderClass: "border-sky-400 data-[state=checked]:border-sky-400",
    },
    {
        value: "amber",
        label: "Amber",
        bgClass: "bg-amber-400 data-[state=checked]:bg-amber-400",
        borderClass: "border-amber-400 data-[state=checked]:border-amber-400",
    },
    {
        value: "violet",
        label: "Violet",
        bgClass: "bg-violet-400 data-[state=checked]:bg-violet-400",
        borderClass: "border-violet-400 data-[state=checked]:border-violet-400",
    },
    {
        value: "rose",
        label: "Rose",
        bgClass: "bg-rose-400 data-[state=checked]:bg-rose-400",
        borderClass: "border-rose-400 data-[state=checked]:border-rose-400",
    },
    {
        value: "emerald",
        label: "Emerald",
        bgClass: "bg-emerald-400 data-[state=checked]:bg-emerald-400",
        borderClass: "border-emerald-400 data-[state=checked]:border-emerald-400",
    },
    {
        value: "orange",
        label: "Orange",
        bgClass: "bg-orange-400 data-[state=checked]:bg-orange-400",
        borderClass: "border-orange-400 data-[state=checked]:border-orange-400",
    },
]

// EventDialog component
export function EventDialog({ event, isOpen, onClose, onSave, onDelete }: { event: CalendarEvent | null; isOpen: boolean; onClose: () => void; onSave: (event: CalendarEvent) => void; onDelete: (eventId: string) => void }) {
    // > Define the initial start and end dates as today
    const today = new Date()
    // > Use the useState hook to manage the state of the title input field
    const [title, setTitle] = useState<string>("")
    // > Use the useState hook to manage the state of the description input field
    const [description, setDescription] = useState<string>("")
    // > Use the useState hook to manage the state of the start date input field
    const [startDate, setStartDate] = useState<Date>(today)
    // > Use the useState hook to manage the state of the end date input field
    const [endDate, setEndDate] = useState<Date>(today)
    // > Use the useState hook to manage the state of the start time input field
    const [startTime, setStartTime] = useState<string>("09:00")
    // > Use the useState hook to manage the state of the end time input field
    const [endTime, setEndTime] = useState<string>("10:00")
    // > Use the useState hook to manage the state of the all-day checkbox
    const [allDay, setAllDay] = useState<boolean>(false)
    // > Use the useState hook to manage the state of the location input field
    const [location, setLocation] = useState<string>("")
    // > Use the useState hook to manage the state of the color radio button
    const [color, setColor] = useState<EventColor>(colorOptions[0].value)
    // > Use the useState hook to manage the state of the error message
    const [error, setError] = useState<string | null>(null)
    // > Use the useState hook to manage the state of the start date date input dialog
    const [startDateOpen, setStartDateOpen] = useState<boolean>(false)
    // > Use the useState hook to manage the state of the end date date input dialog
    const [endDateOpen, setEndDateOpen] = useState<boolean>(false)

    // > Use the useEffect hook to log the event, whenever it changes, for debugging purposes
    useEffect(() => console.log("EventDialog received event:", event), [event])

    // > Use the useEffect hook to set the initial state of the dialog whenever the event prop changes
    useEffect(() => {
        // > Define the initial start and end dates as today
        const today = new Date()

        // > Define a helper function to reset the form fields to their initial values
        function resetForm() {
            setTitle("")
            setDescription("")
            setStartDate(today)
            setEndDate(today)
            setStartTime(formatTimeForInput(today))
            setEndTime(formatTimeForInput(today))
            setAllDay(false)
            setLocation("")
            setColor(colorOptions[0].value)
            setError(null)
        }

        // >> If there is an event, set the form fields to the event's values
        if (event) {
            setTitle(event.title || "")
            setDescription(event.description || "")
            setStartDate(new Date(event.start) || today)
            setEndDate(new Date(event.end) || today)
            setStartTime(formatTimeForInput(new Date(event.start)) || formatTimeForInput(today))
            setEndTime(formatTimeForInput(new Date(event.end)) || formatTimeForInput(today))
            setAllDay(event.allDay || false)
            setLocation(event.location || "")
            setColor(event.color || colorOptions[0].value)
            setError(null)
        } else {
            resetForm()
        }
    }, [event])

    // > Use the useMemo hook to create and memoize an array of time options (using an empty dependency array to ensure it is only created once)
    const timeOptions = useMemo(() => {
        // >> Create an array to hold the time options
        const options = []
        // >> Loop through each hour of the day (0-23)
        for (let hour = 0; hour < 24; hour++) {
            // >> Loop through each 15-minute interval (0, 15, 30, 45)
            for (let minute = 0; minute < 60; minute += 15) {
                // >> Format the hour and minute to be two digits
                const formattedHour = hour.toString().padStart(2, "0")
                // >> Format the minute to be two digits
                const formattedMinute = minute.toString().padStart(2, "0")
                // >> Create the value string in HH:MM format
                const value = `${formattedHour}:${formattedMinute}`
                // Use a fixed date to avoid unnecessary date object creations
                const date = new Date(2000, 0, 1, hour, minute)
                // >> Format the date to be in h:mm a format (e.g., 1:00 AM, 1:15 AM, etc.)
                const label = format(date, "h:mm a")
                // >> Push the value and label into the options array
                options.push({ value, label })
            }
        }
        return options
    }, [])

    // > Define a function to handle the save button click
    function handleSave() {
        // >> Define the start date and time based on the state
        const start = new Date(startDate)
        // >> Define the end date and time based on the state
        const end = new Date(endDate)
        // >> If the event is not set to all-day, set the start and end times based on the selected time
        if (!allDay) {
            // >>> Parse the start time from the start time string
            const [startHours, startMinutes] = startTime.split(":").map(Number)
            // >>> Set the hours, minutes, seconds to the start object
            start.setHours(startHours, startMinutes, 0)
            // >>> Parse the end time from the end time string
            const [endHours, endMinutes] = endTime.split(":").map(Number)
            // >>> Set the hours, minutes, seconds to the end object
            end.setHours(endHours, endMinutes, 0)
        }
        // >> If the event is all-day, set the start and end objects to the beginning and end of the day
        if (allDay) {
            // >>> Set the start object to the beginning of the day
            start.setHours(0, 0, 0, 0)
            // >>> Set the end object to the ending of the day
            end.setHours(23, 59, 59, 999)
        }
        // >> If the end date is before the start date, set an error message and return early
        if (isBefore(end, start)) {
            setError("End date cannot be before start date")
            return
        }
        // >> If the event doesn't have an ID, keep it empty
        const eventId = (event && event.id) || ""
        // >> If the event doesn't have a title, set it to "(no title)"
        const eventTitle = title.trim() ? title : "(no title)"
        // >> Call the onSave function with the event data
        onSave({ id: eventId, title: eventTitle, description, start, end, allDay, location, color })
    }

    // > Define a function to handle the delete button click
    function handleDelete() {
        // >> If the event doesn't exist or doesn't have an ID, return early
        if (!event || !event.id) return
        // >> Call the onDelete function with the event ID
        onDelete(event.id)
    }

    // > Define a function to handle the selecting of the start date
    const handleStartDateSelect = (date: Date | undefined) => {
        // >> If the date is falsy, return early
        if (!date) return
        // >> Set the start date to the selected date
        setStartDate(date)
        // >> If the end date falls does not fall before the new start date, return early
        if (isBefore(endDate, date)) { setEndDate(date) }
        // >> Reset the error message to null
        setError(null)
        // >> Close the start date popover
        setStartDateOpen(false)
    }

    // > Define a function to handle the selecting of the end date
    function handleEndDateSelect(date: Date | undefined) {
        // >> If the date is falsy, return early
        if (!date) return
        // >> Set the end date to the selected date
        setEndDate(date)
        // >> If the start date falls does not fall before the new end date, return early
        if (isBefore(date, startDate)) { setStartDate(date) }
        // >> Reset the error message to null
        setError(null)
        // >> Close the end date popover
        setEndDateOpen(false)

    }

    // > Return the JSX for the event dialog component
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px]">
                {/* Dialog header with title and description */}
                <DialogHeader>
                    <DialogTitle>{(event && event.id) ? "Edit Event" : "Create Event"}</DialogTitle>
                    <DialogDescription className="sr-only">{(event && event.id) ? "Edit the details of this event" : "Add a new event to your calendar"}</DialogDescription>
                </DialogHeader>

                {/* Error message if any */}
                {error && <div className="bg-destructive/15 text-destructive rounded-md px-3 py-2 text-sm">{error}</div>}

                {/* Form fields for event details */}
                <div className="grid gap-4 py-4">
                    {/* > Title field */}
                    <div className="*:not-first:mt-1.5">
                        <Label htmlFor="title">Title</Label>
                        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)}/>
                    </div>

                    {/* > Description field */}
                    <div className="*:not-first:mt-1.5">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3}/>
                    </div>

                    {/* > Start date and time fields */}
                    <div className="flex gap-4">
                        {/* >> Start date field */}
                        <div className="flex-1 *:not-first:mt-1.5">
                            <Label htmlFor="start-date">Start Date</Label>
                            <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                                <PopoverTrigger asChild={true}>
                                    <Button id="start-date" variant={"outline"} className={cn("group bg-background hover:bg-background border-input w-full justify-between px-3 font-normal outline-offset-0 outline-none focus-visible:outline-[3px]", !startDate && "text-muted-foreground")}>
                                        <span className={cn("truncate", !startDate && "text-muted-foreground")}>
                                            {startDate ? format(startDate, "PPP") : "Pick a date"}
                                        </span>
                                        <RiCalendarLine size={16} className="text-muted-foreground/80 shrink-0" aria-hidden="true"/>
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-2" align="start">
                                    <Calendar mode="single" selected={startDate} defaultMonth={startDate} onSelect={(date) => handleStartDateSelect(date)} />
                                </PopoverContent>
                            </Popover>
                        </div>

                        {/* >> Start time field */}
                        {!allDay && (
                            <div className="min-w-28 *:not-first:mt-1.5">
                                <Label htmlFor="start-time">Start Time</Label>
                                <Select value={startTime} onValueChange={setStartTime}>
                                    <SelectTrigger id="start-time">
                                        <SelectValue placeholder="Select time" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {timeOptions.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>

                    {/* > End date and time fields */}
                    <div className="flex gap-4">
                        {/* >> End date field */}
                        <div className="flex-1 *:not-first:mt-1.5">
                            <Label htmlFor="end-date">End Date</Label>
                            <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                                <PopoverTrigger asChild={true}>
                                    <Button id="end-date" variant={"outline"} className={cn("group bg-background hover:bg-background border-input w-full justify-between px-3 font-normal outline-offset-0 outline-none focus-visible:outline-[3px]", !endDate && "text-muted-foreground")}>
                                        <span className={cn("truncate", !endDate && "text-muted-foreground")}>
                                            {endDate ? format(endDate, "PPP") : "Pick a date"}
                                        </span>
                                        <RiCalendarLine size={16} className="text-muted-foreground/80 shrink-0" aria-hidden="true" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-2" align="start">
                                    <Calendar mode="single" selected={endDate} defaultMonth={endDate} onSelect={(date) => handleEndDateSelect(date)} />
                                </PopoverContent>
                            </Popover>
                        </div>

                        {/* >> End time field */}
                        {!allDay && (
                            <div className="min-w-28 *:not-first:mt-1.5">
                                <Label htmlFor="end-time">End Time</Label>
                                <Select value={endTime} onValueChange={setEndTime}>
                                    <SelectTrigger id="end-time">
                                        <SelectValue placeholder="Select time" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {timeOptions.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>

                    {/* > All day checkbox */}
                    <div className="flex items-center gap-2">
                        <Checkbox id="all-day" checked={allDay} onCheckedChange={(checked) => setAllDay(checked === true)} />
                        <Label htmlFor="all-day">All day</Label>
                    </div>

                    {/* > Location field */}
                    <div className="*:not-first:mt-1.5">
                        <Label htmlFor="location">Location</Label>
                        <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} />
                    </div>

                    {/* > Color radio buttons */}
                    <fieldset className="space-y-4">
                        <legend className="text-foreground text-sm leading-none font-medium">
                            Etiquette
                        </legend>
                        <RadioGroup className="flex gap-1.5" defaultValue={colorOptions[0].value} value={color} onValueChange={(value: EventColor) => setColor(value)}>
                            {colorOptions.map((colorOption) => (
                                <RadioGroupItem key={colorOption.value} id={`color-${colorOption.value}`} value={colorOption.value} aria-label={colorOption.label} className={cn("size-6 shadow-none", colorOption.bgClass, colorOption.borderClass)}/>
                            ))}
                        </RadioGroup>
                    </fieldset>
                </div>

                {/* Dialog footer with cancel and save buttons */}
                <DialogFooter className="flex-row sm:justify-between">
                    {(event && event.id) && (
                        <Button variant="outline" size="icon" onClick={handleDelete} aria-label="Delete event">
                            <RiDeleteBinLine size={16} aria-hidden="true" />
                        </Button>
                    )}
                    <div className="flex flex-1 justify-end gap-2">
                        <Button variant="outline" onClick={onClose}>Cancel</Button>
                        <Button onClick={handleSave}>Save</Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
