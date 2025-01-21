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
