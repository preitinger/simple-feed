export interface Birthday {
    name: string;
    date: Date;
}

export default interface FeedData {
    birthdays: Birthday[];
}