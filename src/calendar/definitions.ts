export const eventsUrl = "https://www.bislettstadion.no/terminliste";
export const path = "kalender.ics";
export const url = "https://bislett.stadion.run";

export enum Timezone {
    Oslo = "Europe/Oslo",
}

export enum DayOfWeek {
    Monday = 1,
    Tuesday = 2,
    Wednesday = 3,
    Thursday = 4,
    Friday = 5,
    Saturday = 6,
    Sunday = 0,
}

export type TimeRange = {
    from: ClockTime;
    to: ClockTime;
};

export type ClockTime = {
    hours: number;
    minutes: number;
};

export type ScrapedWholeDayEvent = {
    type: "whole-day";
};

export type ScrapedTimedEvent = {
    type: "timed";
    from: ClockTime;
    to?: ClockTime;
};

export type ScrapedEvent = {
    title: string;
    details: string;
    month: number;
    day: number;
} & (ScrapedWholeDayEvent | ScrapedTimedEvent);

export type CalendarEntry = {
    type: "ordinary" | "closed";
    title: string;
    description: string;
    from: Date;
    to: Date;
};

export const timezoneInformation = `
BEGIN:VTIMEZONE
TZID:${Timezone.Oslo}
BEGIN:STANDARD
DTSTART:19701025T030000
TZOFFSETFROM:+0200
TZOFFSETTO:+0100
RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU
END:STANDARD
BEGIN:DAYLIGHT
DTSTART:19700329T020000
TZOFFSETFROM:+0100
TZOFFSETTO:+0200
RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU
END:DAYLIGHT
END:VTIMEZONE

`;
