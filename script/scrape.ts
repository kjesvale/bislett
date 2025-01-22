import { load } from "cheerio";
import { DayOfWeek, type ClockTime, type ScrapedEvent, type TimeRange } from "./types";

export const ordinaryOpeningHours: Record<DayOfWeek, TimeRange[]> = {
    [DayOfWeek.Monday]: [
        { from: { hours: 8, minutes: 0 }, to: { hours: 17, minutes: 0 } },
        { from: { hours: 19, minutes: 30 }, to: { hours: 22, minutes: 0 } },
    ],
    [DayOfWeek.Tuesday]: [
        { from: { hours: 8, minutes: 0 }, to: { hours: 17, minutes: 0 } },
        { from: { hours: 19, minutes: 30 }, to: { hours: 22, minutes: 0 } },
    ],
    [DayOfWeek.Wednesday]: [{ from: { hours: 8, minutes: 0 }, to: { hours: 17, minutes: 0 } }],
    [DayOfWeek.Thursday]: [
        { from: { hours: 8, minutes: 0 }, to: { hours: 17, minutes: 0 } },
        { from: { hours: 19, minutes: 30 }, to: { hours: 22, minutes: 0 } },
    ],
    [DayOfWeek.Friday]: [{ from: { hours: 8, minutes: 0 }, to: { hours: 20, minutes: 0 } }],
    [DayOfWeek.Saturday]: [{ from: { hours: 10, minutes: 0 }, to: { hours: 16, minutes: 0 } }],
    [DayOfWeek.Sunday]: [{ from: { hours: 10, minutes: 0 }, to: { hours: 16, minutes: 0 } }],
};

export async function scrape(url: string): Promise<ScrapedEvent[]> {
    const response = await fetch(url);

    if (!response.ok) {
        console.error("Failed to fetch page");
    }

    const html = await response.text();
    const dom = load(html);

    const items = dom(".aktivitetskalender .w-dyn-item");
    const events: ScrapedEvent[] = [];

    items.each((_, item) => {
        const day = dom(item).find(".terminliste-dato").text();
        const month = dom(item).find(".terminliste-month").text();

        const title = dom(item).find(".aktivitet-navn").text();
        const details = dom(item).find(".aktivitet-overskrift-subpage").text();
        const parsed = parseDateAndTime(day, month, title, details);

        if (parsed) {
            events.push(parsed);
        }
    });

    return events;
}

function parseDateAndTime(
    day: string,
    month: string,
    title: string,
    details: string
): ScrapedEvent | null {
    const parsedMonth = getIndexedMonth(month);
    const parsedDay = parseInt(day);

    if (parsedMonth === null) {
        return null;
    }

    const timePeriod = getTimePeriod(details);
    if (timePeriod === null) {
        return {
            type: "whole-day",
            day: parsedDay,
            month: parsedMonth,
            title,
            details,
        };
    } else {
        return {
            type: "timed",
            title,
            details,
            month: parsedMonth,
            day: parsedDay,
            ...timePeriod,
        };
    }
}

function getTimePeriod(value: string): { from: ClockTime; to?: ClockTime } | null {
    const fromToRegex = /(\d{2}):(\d{2})-(\d{2}):(\d{2})/;
    const fromToMatches = value.match(fromToRegex);

    if (fromToMatches) {
        const [_, fromHours, fromMinutes, toHours, toMinutes] = fromToMatches;

        return {
            from: { hours: parseInt(fromHours), minutes: parseInt(fromMinutes) },
            to: { hours: parseInt(toHours), minutes: parseInt(toMinutes) },
        };
    }

    const fromRegex = /fra kl (\d{2}):(\d{2})/;
    const fromMatches = value.match(fromRegex);

    if (fromMatches) {
        const [_, fromHours, fromMinutes] = fromMatches;

        return {
            from: { hours: parseInt(fromHours), minutes: parseInt(fromMinutes) },
        };
    }

    return null;
}

function getIndexedMonth(value: string): number | null {
    const months: Record<string, number> = {
        Jan: 0,
        Feb: 1,
        Mar: 2,
        Apr: 3,
        Mai: 4,
        Jun: 5,
        Jul: 6,
        Aug: 7,
        Sep: 8,
        Okt: 9,
        Nov: 10,
        Des: 11,
    };

    return months[value];
}
