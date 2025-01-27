import { addDays } from "date-fns";
import { eventsUrl, path } from "./definitions";
import {
    calendarEntryToEventAttributes,
    createCalendar,
    cutOpeningHoursByClosedHours,
    getOpeningHoursUntil,
    scrapedEventToCalendarEntry,
} from "./ics";
import { scrape } from "./scrape";

console.log(`Scraping URL «${eventsUrl}»`);
const scrapedEvents = await scrape(eventsUrl);

const openingHours = getOpeningHoursUntil(addDays(new Date(), 21));

console.log("Found", scrapedEvents.length, "events");
const closedHours = scrapedEvents.map(scrapedEventToCalendarEntry);

const openingEventsWithCutouts = cutOpeningHoursByClosedHours(openingHours, closedHours).map(
    calendarEntryToEventAttributes
);

const closedEvents = closedHours.map(calendarEntryToEventAttributes);

const calendar = createCalendar([...openingEventsWithCutouts, ...closedEvents]);

await Bun.write(path, calendar);

console.log("Written to file", path);
