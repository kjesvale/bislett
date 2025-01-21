import { TZDate } from "@date-fns/tz";
import * as ics from "ics";
import { ordinaryOpeningHours } from "./scrape";
import type { DayOfWeek, ScrapedEvent } from "./types";

export function scrapedEventToIcsEvent(entry: ScrapedEvent): ics.EventAttributes | null {
    const assumedYear = new TZDate().getFullYear();
    const date = new TZDate(assumedYear, entry.month, entry.day, "Europe/Oslo");

    if (date.getTime() < Date.now()) {
        date.setFullYear(date.getFullYear() + 1);
    }

    if (entry.type === "whole-day") {
        const dayOfWeek = date.getDay() as DayOfWeek;
        const openingHours = ordinaryOpeningHours[dayOfWeek];
        const start = openingHours[0].from;
        const stop = openingHours[openingHours.length - 1].to;

        return {
            start: [
                date.getFullYear(),
                date.getMonth() + 1,
                date.getDate(),
                start.hours,
                start.minutes,
            ],
            end: [
                date.getFullYear(),
                date.getMonth() + 1,
                date.getDate(),
                stop.hours,
                stop.minutes,
            ],
            title: "Heldags: " + entry.title,
            description: entry.details,
        };
    } else if (entry.type === "timed") {
        const start = new TZDate(
            assumedYear,
            entry.month,
            entry.day,
            entry.from.hours,
            entry.from.minutes
        );

        let stop;
        if (entry.to) {
            stop = new TZDate(
                assumedYear,
                entry.month,
                entry.day,
                entry.to.hours,
                entry.to.minutes
            );
        } else {
            const dayOfWeek = date.getDay() as DayOfWeek;
            const openingHours = ordinaryOpeningHours[dayOfWeek];
            const endy = openingHours[openingHours.length - 1].to;

            stop = new TZDate(assumedYear, entry.month, entry.day, endy.hours, endy.minutes);
        }

        return {
            start: [
                start.getFullYear(),
                start.getMonth() + 1,
                start.getDate(),
                start.getHours(),
                start.getMinutes(),
            ],
            end: [
                stop.getFullYear(),
                stop.getMonth() + 1,
                stop.getDate(),
                stop.getHours(),
                stop.getMinutes(),
            ],
            title: "Hendelse: " + entry.title,
            description: entry.details,
        };
    } else {
        return null;
    }
}
