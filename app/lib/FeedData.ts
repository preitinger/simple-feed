export interface Birthday {
    name: string;
    date: Date;
}

export interface FeedEntry {
    header: string;
    body: string;
}

export default interface FeedData {
    birthdays: Birthday[];
    feedEntries: FeedEntry[];
}