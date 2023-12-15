'use client';

import Image from 'next/image'
import styles from './page.module.css'
import { useEffect, useState } from 'react'
import FeedData, { Birthday } from './lib/FeedData'

interface DateMonth {
    /**
     * 0 to 11
     */
    month: number;
    /**
     * 1 to 31
     */
    date: number;
}

/**
 * 
 * @param today 
 * @param nextDateMonth 
 * @returns difference in ms between today and the date according to nextDateMonth either in the same year as today or the next year depending
 * on the fact if the date of the current year lies in the past or in the future.
 */
function difference(today: Date, nextDateMonth: DateMonth): number {
    today.setHours(0, 0, 0, 0);
    // today.setMilli  
    const month = today.getMonth();
    const year = today.getFullYear();
    const sameYear = new Date(year, nextDateMonth.month, nextDateMonth.date, 0, 0, 0, 0);

    if (sameYear >= today) return sameYear.getTime() - today.getTime();
    const nextYear = new Date(year + 1, nextDateMonth.month, nextDateMonth.date);
    return nextYear.getTime() - today.getTime();
}

function dateMonthOf(d: Date): DateMonth {
    return {
        month: d.getMonth(),
        date: d.getDate(),
    }
}

export default function Home() {
    const [feedData, setFeedData] = useState<FeedData | null>({
        birthdays: [
            {
                name: 'Irmgard',
                date: new Date(1955, 4, 31)
            },
            {
                name: 'Peter',
                date: new Date(1977, 5, 25)
            },
            {
                name: 'Georg',
                date: new Date(1979, 0, 23)
            },
            {
                name: 'Elisabeth',
                date: new Date(1980, 8, 4)
            },
            {
                name: 'Matthias',
                date: new Date(1988, 7, 3)
            },
        ],
        feedEntries: [
            {
                header: 'Beispiel 1',
                body: 'Lorem ipsum 1 ...\nnoch ne zeile'
            },
            {
                header: 'Beispiel 2',
                body: 'Lorem ipsum 2 ...'
            },
            {
                header: 'Beispiel 3',
                body: 'Lorem ipsum 3 ...'
            },
        ]
    })
    const [today, setToday] = useState<Date | null>(null);

    useEffect(() => {
        setToday(new Date());
    }, [])

    function Today() {
        return (
            <div className={`${styles.entry}`}>
                <h3>Heute: {today?.toLocaleString()}</h3>
            </div>
        )
    }

    function findNextBirthday() {
        if (feedData == null) {
            throw new Error('feedDate null');
        }
        const now = today;
        if (now == null) return null;
        interface BirthdayAndDiff {
            bd: Birthday;
            diff: number;
        }
        return feedData.birthdays.map(bd => ({
            bd: bd,
            diff: difference(now, dateMonthOf(bd.date))
        })).reduce<BirthdayAndDiff | null>((prev, cur) => (prev != null && cur != null && prev.diff < cur.diff ? prev : cur), null)
    }

    function BirthdayComp(props: { birthday: Birthday }) {
        const date = props.birthday.date.toLocaleDateString();
        const name = props.birthday.name;

        return (
            <tr>
                <td className={styles.birthdayDate}>{date}</td><td className={styles.birthdayName}> {name}</td>
            </tr>
        )
    }

    function NextBirthday() {
        const nextBirthday = findNextBirthday();
        return (
            <div className={`${styles.entry}`}>
                <h3>Nächster Geburtstag</h3>
                {nextBirthday?.bd != null && (
                    <table>
                        <tbody>
                            {nextBirthday != null && <BirthdayComp birthday={nextBirthday.bd} />}
                        </tbody>
                    </table>
                )}
            </div>
        )
    }

    function AllBirthdays() {
        if (feedData == null) return (
            <div>Noch nicht geladen ...</div>
        )

        const sorted = feedData.birthdays.slice().sort((a, b) => {
            const aMon = a.date.getMonth();
            const bMon = b.date.getMonth();
            if (aMon !== bMon) return aMon - bMon;
            const aDate = a.date.getDate();
            const bDate = b.date.getDate();
            return aDate - bDate;
        })
        return (
            <div className={`${styles.entry}`}>

                <h3>Alle Geburtstage</h3>
                <table>
                    <tbody>
                        {
                            sorted.map((bd, i) => (
                                <BirthdayComp key={`bd.${i}`} birthday={bd} />
                            ))
                        }
                    </tbody>
                </table>
            </div>
        )
    }

    return (
        <div>
            <h1>Infos</h1>
            <Today />
            <NextBirthday />
            <AllBirthdays />
            {
                feedData?.feedEntries.map((e, i) => (
                    <div key={`e.${i}`} className={`${styles.entry}`}>
                        <h3>{e.header}</h3>
                        <pre>{e.body}</pre>
                    </div>
                ))

            }
        </div>
    )
}
