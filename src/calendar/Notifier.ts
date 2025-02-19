import { ordinaryOpeningHours } from "./scrape";
import { type CalendarEntry, DayOfWeek, NtfyTopic } from "./definitions";

import fetch from 'node-fetch';

export async function getPreviousNotifications() {
    const notifiedEntries = new Set<string>();
    const topics = Object.values(NtfyTopic);
    for (const topic of topics) {
        try {
            const response = await fetch(`https://ntfy.sh/${topic}/json?poll=1`);
            const data = await response.text();
            const entries = data.trim().split('\n').filter(line => line).map((line: string) => JSON.parse(line));
            entries.forEach((entry: { message: string; }) => {
                if (entry && entry.message.startsWith('Closed')) {
                    notifiedEntries.add(entry.message)
                }
            });
        } catch (error) {
            console.error(error);
        }
    }
    return notifiedEntries;
}

export async function createNotifications(closedHours: CalendarEntry[], notifiedEntries: Set<string>): Promise<void> {
    for (const closedEntry of closedHours) {
        if (closedEntry.to && closedEntry.to > new Date()) {
            const weekday = closedEntry.from.getDay() as keyof typeof ordinaryOpeningHours;
            const openingHours = ordinaryOpeningHours[weekday];

            for (const openingHour of openingHours) {
                if (isOverlapping(openingHour, closedEntry)) {
                    const entryKey = generateClosedMessage(closedEntry);
                    if (!notifiedEntries.has(entryKey)) {
                        await postNotification(closedEntry);
                        notifiedEntries.add(entryKey);
                    }
                }
            }
        }
    }
}

async function postNotification(closedEntry: CalendarEntry): Promise<void> {
    const ntfyTopic = NtfyTopic[DayOfWeek[closedEntry.from.getDay()] as keyof typeof DayOfWeek];
    const response = await fetch(`https://ntfy.sh/${ntfyTopic}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: generateClosedMessage(closedEntry),
    });

    if (!response.ok) {
        console.error("Failed to send notification", response.statusText);
    }
}

function generateClosedMessage(closedEntry: CalendarEntry): string {
    const weekday = DayOfWeek[closedEntry.from.getDay()] as keyof typeof DayOfWeek;
    return `Closed ${weekday} ${closedEntry.from.getDate()}/${closedEntry.from.getMonth() + 1} from ${closedEntry.from.getHours()}:${closedEntry.from.getMinutes().toString().padStart(2, '0')} to ${closedEntry.to.getHours()}:${closedEntry.to.getMinutes().toString().padStart(2, '0')} - ${closedEntry.title}`;
}

function isOverlapping(openingHour: {
    from: { hours: number; minutes: number };
    to: { hours: number; minutes: number }
}, closedEntry: CalendarEntry): boolean {
    const openingFrom = new Date(closedEntry.from);
    openingFrom.setHours(openingHour.from.hours, openingHour.from.minutes, 0, 0);

    const openingTo = new Date(closedEntry.from);
    openingTo.setHours(openingHour.to.hours, openingHour.to.minutes, 0, 0);

    return (
        (closedEntry.from <= openingTo && closedEntry.from >= openingFrom) ||
        (closedEntry.to <= openingTo && closedEntry.to >= openingFrom)
    );
}