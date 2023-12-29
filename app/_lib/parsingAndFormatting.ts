// mit regexp ueberfluessig:
// export function parseDigitSeq(s: string, position: number): number {
//     s.match(/d/).forEach(m => {
//         m.
//     })

//     return 0;
// }

const weekdaysDe = [
    'Montag',
    'Dienstag',
    'Mittwoch',
    'Donnerstag',
    'Freitag',
    'Samstag',
    'Sonntag'
]

const formatWeekDay = (weekDays: string[]) => (day: number | undefined | null) => day === null ? null : day === undefined ? undefined : weekDays[day];

export function formatWeekdayDe(day: number | undefined | null) {
    return formatWeekDay(weekdaysDe)(day);
}