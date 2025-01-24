import { TZDate } from "@date-fns/tz";
import { add, addDays, differenceInCalendarDays, isPast, startOfDay } from "date-fns";
import * as ics from "ics";
import { ordinaryOpeningHours } from "./scrape";
import { Timezone, type CalendarEntry, type DayOfWeek, type ScrapedEvent } from "./types";

const openingHoursUrl = "https://www.bislettstadion.no/om-oss/apningstider";

export function getOpeningHoursUntil(date: Date): CalendarEntry[] {
    const today = startOfDay(bislettTime());
    const numberOfDays = differenceInCalendarDays(date, today);

    return Array(numberOfDays)
        .fill(0)
        .flatMap((_, i) => {
            const day = addDays(today, i);
            const weekday = day.getDay() as DayOfWeek;
            const hours = ordinaryOpeningHours[weekday];

            return hours.flatMap(({ from, to }) => ({
                type: "ordinary",
                month: day.getMonth(),
                day: day.getDate(),
                title: "Ordinære åpningstider",
                description: "Se åpningstider på " + openingHoursUrl,
                from: add(day, { hours: from.hours, minutes: from.minutes }),
                to: add(day, { hours: to.hours, minutes: to.minutes }),
            }));
        });
}

export function scrapedEventToCalendarEntry(entry: ScrapedEvent): CalendarEntry {
    const assumedYear = bislettTime().getFullYear();
    const createDate = (hours = 0, minutes = 0) =>
        bislettTime(new TZDate(assumedYear, entry.month, entry.day, hours, minutes));

    let date = createDate();
    if (isPast(date)) date.setFullYear(date.getFullYear() + 1);

    const dayOfWeek = date.getDay() as DayOfWeek;
    const openingHours = ordinaryOpeningHours[dayOfWeek];
    const defaultStart = openingHours[0].from;
    const defaultStop = openingHours[openingHours.length - 1].to;
    const start = entry.type === "whole-day" ? defaultStart : entry.from;
    const stop = entry.type === "whole-day" || !entry.to ? defaultStop : entry.to;

    return {
        from: createDate(start.hours, start.minutes),
        to: createDate(stop.hours, stop.minutes),
        title: entry.title,
        description: entry.details,
        type: "closed",
    };
}

export function calendarEntryToEventAttributes(entry: CalendarEntry): ics.EventAttributes {
    const titlePrefix = entry.type === "closed" ? "Stengt" : "Åpent";

    return {
        title: `${titlePrefix}: ${entry.title}`,
        description: entry.description,
        start: [
            entry.from.getFullYear(),
            entry.from.getMonth() + 1,
            entry.from.getDate(),
            entry.from.getHours(),
            entry.from.getMinutes(),
        ],
        end: [
            entry.to.getFullYear(),
            entry.to.getMonth() + 1,
            entry.to.getDate(),
            entry.to.getHours(),
            entry.to.getMinutes(),
        ],
        startInputType: "utc",
        endInputType: "utc",
    };
}

export function cutOpeningHoursByClosedHours(
    openTimespans: CalendarEntry[],
    closedTimespans: CalendarEntry[]
) {
    const isOverlapping = (open: CalendarEntry, closed: CalendarEntry) => {
        return open.from < closed.to && open.to > closed.from;
    };

    const splitTimespan = (open: CalendarEntry, closed: CalendarEntry) => {
        let result = [];

        if (open.from < closed.from) {
            result.push({ ...open, from: open.from, to: closed.from });
        }

        if (open.to > closed.to) {
            result.push({ ...open, from: closed.to, to: open.to });
        }

        return result;
    };

    let adjustedTimespans: CalendarEntry[] = [];

    for (let open of openTimespans) {
        let splitResults = [open];

        for (let closed of closedTimespans) {
            let tempResults: any = [];
            for (let current of splitResults) {
                if (isOverlapping(current, closed)) {
                    tempResults = tempResults.concat(splitTimespan(current, closed));
                } else {
                    tempResults.push(current);
                }
            }
            splitResults = tempResults;
        }

        adjustedTimespans = adjustedTimespans.concat(splitResults);
    }

    return adjustedTimespans;
}

export function bislettTime(date: TZDate = new TZDate()) {
    return date.withTimeZone(Timezone.Bislett);
}
