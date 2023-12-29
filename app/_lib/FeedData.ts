export interface BirthdayDate {
    /**
     * 1 to 31
     */
    date: number;
    /**
     * 1 to 12
     */
    month: number;
    /**
     * just to be optionally printed not to be processed
     */
    year?: number;
}

export function parseBirthdayDate(s: string): BirthdayDate | null {
    const res = /(\d+)\.(\d+)\.(\d*)/.exec(s);
    if (res == null) return null;
    const date = parseInt(res[1]);
    const month = parseInt(res[2]);
    const year = res[3] == null || res[3] == '' ? undefined : parseInt(res[3]);
    if (date < 1 || date > 31 || month < 1 || month > 12 || year == null || year < 0) return null;
    return {
        date: date,
        month: month,
        year: year
    };
}

function ensureLength(s: string, len: number, preFill: string): string {
    while (s.length < len) {
        s = preFill + s;
    }

    return s;
}

export function formatBirthdayDate(d: BirthdayDate): string {
    const el = (s: string, len: number) => ensureLength(s, len, '0');
    return el(d.date.toString(), 2) + '.' + el(d.month.toString(), 2) + '.' + (d.year?.toString() ?? '');
}

export function compareBirthdayDate(a: BirthdayDate, b: BirthdayDate): number {
    let d = a.month - b.month;
    return d !== 0 ? d : a.date - b.date;
}

export function birthdayDifference(today: Date, nextBirthdayDate: BirthdayDate): number {
    today = new Date(today);
    today.setHours(0, 0, 0, 0);
    const month = today.getMonth();
    const year = today.getFullYear();
    const sameYear = new Date(year, nextBirthdayDate.month - 1, nextBirthdayDate.date, 0, 0, 0, 0);

    if (sameYear >= today) return sameYear.getTime() - today.getTime();
    const nextYear = new Date(year + 1, nextBirthdayDate.month - 1, nextBirthdayDate.date);
    return nextYear.getTime() - today.getTime();
}


export interface Birthday {
    name: string;
    date: BirthdayDate;
}

export function compareBirthday(a: Birthday, b: Birthday): number {
    return compareBirthdayDate(a.date, b.date);
}

export interface FeedEntry {
    header: string;
    imgData?: string;
    body: string;
}

export default interface FeedData {
    _id: string;
    name: string;
    birthdays: Birthday[];
    feedEntries: FeedEntry[];
}

export interface LoadFeedDataReq {
    id: string;
    passwd: string;
}

export type LoadFeedDataResp = {
    type: 'success';
    feedData: FeedData;
} | {
    type: 'notFound'
} | {
    type: 'wrongPasswd'
} | {
    type: 'error';
    error: string;
}
