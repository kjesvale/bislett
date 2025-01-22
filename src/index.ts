import { addDays } from "date-fns";
import * as ics from "ics";
import {
    calendarEntryToEventAttributes,
    getOpeningHoursUntil,
    scrapedEventToCalendarEntry,
} from "./ics";
import { scrape } from "./scrape";

const eventsUrl = "https://www.bislettstadion.no/terminliste";
const path = "calendar/bislett.ics";

console.log(`Scraping URL «${eventsUrl}»`);
const scrapedEvents = await scrape(eventsUrl);

const openEvents = getOpeningHoursUntil(addDays(new Date(), 21)).map(
    calendarEntryToEventAttributes
);

console.log("Found", scrapedEvents.length, "events");
const closedEvents = scrapedEvents
    .map(scrapedEventToCalendarEntry)
    .map(calendarEntryToEventAttributes);

const events = ics.createEvents([...openEvents, ...closedEvents], {
    calName: "Bislett",
});

if (events.value) {
    await Bun.write(path, events.value);

    console.log("Written to file", path);
} else {
    console.error("Error when creating events:", events.error);
}
