import * as ics from "ics";
import { scrapedEventToIcsEvent } from "./ics";
import { scrape } from "./scrape";

const eventsUrl = "https://www.bislettstadion.no/terminliste";
const path = "bislett.ics";

console.log(`Scraping URL «${eventsUrl}»`);
const scrapedEvents = await scrape(eventsUrl);

console.log("Found", scrapedEvents.length, "events");
const closedEvents = scrapedEvents.map(scrapedEventToIcsEvent).filter(v => v !== null);

const events = ics.createEvents(closedEvents);

if (events.value) {
    await Bun.write(path, events.value);

    console.log("Written to file", path);
} else {
    console.error("Error when creating events:", events.error);
}
