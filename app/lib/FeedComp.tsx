'use client';

import Image from 'next/image'
import styles from './FeedComp.module.css'
import { ChangeEventHandler, forwardRef, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import FeedData, { Birthday, BirthdayDate, FeedEntry, birthdayDifference, compareBirthday, formatBirthdayDate, parseBirthdayDate } from './FeedData'
import { EditStartReq } from './admin/editStart';
import { useRouter } from 'next/navigation';

interface InputProps {
    value: string;
    onChange: ChangeEventHandler<HTMLInputElement>;
    onEnter: () => void;
    onCancel: () => void;
}
const Input = forwardRef<HTMLInputElement | null, InputProps>(function Input(props: InputProps, ref) {
    return <input ref={ref} value={props.value} onChange={props.onChange} onKeyUp={(e) => {
        if (e.key === 'Enter') {
            e.stopPropagation();
            props.onEnter();
        } else if (e.key === 'Escape') {
            e.stopPropagation();
            props.onCancel();
        }
    }} onBlur={(e) => {
        e.stopPropagation();
        props.onEnter();
    }} />
})

function asDigit(s: string) {
    const n = s.charCodeAt(0) - '0'.charCodeAt(0);
    if (isNaN(n)) return NaN;
    if (n < 0 || n >= 10) return NaN;
    return n;
}

function isDot(s: string) {
    return s === '.';
}


function ensureLength(s: string, len: number, preFill: string): string {
    while (s.length < len) {
        s = preFill + s;
    }

    return s;
}

function formatDate(d: Date) {
    const el = (s: string, len: number) => ensureLength(s, len, '0');
    const date = el(d.getDate().toString(), 2);
    const month = el((d.getMonth() + 1).toString(), 2);
    const year = el(d.getFullYear().toString(), 4);

    return `${date}.${month}.${year}`;
}

interface EditProps {
    admin: boolean;
    feedData: FeedData | null;
    idx: number;
    editState: EditState;
    editedText: string;
    setEditedText: (val: string) => void;
    noEdit?: boolean;
    onEnter: () => void;
    onCancel: () => void
    onEdit?: () => void;
    onDelete?: () => void;
    onMove?: () => void;
}

const BirthdayComp = forwardRef<HTMLInputElement | null, EditProps>(function BirthdayComp(props, ref) {
    const feedData = props.feedData;
    if (feedData == null) return <td>null</td>;
    const editState = props.editState;
    const editedText = props.editedText;
    const setEditedText = props.setEditedText;

    const birthday = feedData.birthdays[props.idx];
    const date = formatBirthdayDate(birthday.date);
    const name = birthday.name;

    return (
        <tr>
            <td className={styles.birthdayDate}>
                {
                    !props.noEdit && editState.type === 'birthday' && editState.idx === props.idx && editState.editing === 'date'
                        ? <Input ref={ref} key='editingInput' value={editedText} onChange={(e) => {
                            setEditedText(e.target.value);
                        }} onEnter={props.onEnter} onCancel={props.onCancel} />
                        : <span>{date}</span>
                }
            </td>
            <td className={styles.birthdayName}>
                {
                    !props.noEdit && editState.type === 'birthday' && editState.idx === props.idx && editState.editing === 'name' ?
                        <Input ref={ref} key='editingInput' value={editedText} onChange={(e) => {
                            setEditedText(e.target.value);
                        }} onEnter={props.onEnter} onCancel={props.onCancel} />
                        :
                        <span>{name}</span>

                }
            </td>
            {
                props.admin && !props.noEdit && <>
                    <td>
                        <button onClick={props.onEdit}>Bearbeiten</button>
                    </td>
                    <td>
                        <button onClick={props.onDelete}>Löschen</button>
                    </td>
                </>
            }
        </tr>
        // <tr>
        //     {
        //         (editState.type === 'birthday' && editState.idx === props.idx) ?
        //             <>
        //             {
        //                 editState.editing === 'date' ? <td><input value={date} onChange={(e) => {
        //                     updateDateFromString(e.target.value);
        //                     setFeedData(d => (d == null ? null : ({
        //                         ...d,
        //                         birthdays: (d.birthdays.map((b, i) => i === props.idx ? {
        //                             name: d.birthdays[props.idx].name,
        //                             date: new Date(e.target.value)
        //                         } : b))
        //                     })))
        //                 }} ></input></td>
        //                 :
        //                 <td className={styles.birthdayDate}>{date}</td>
        //             }
        //             </>
        //             :
        //             <>
        //                 <td className={styles.birthdayDate}>{date}</td><td className={styles.birthdayName}> {name}</td>
        //                 {
        //                     admin && <td><button onClick={() => {
        //                         setEditState({
        //                             type: 'birthday',
        //                             idx: props.idx,
        //                             editing: 'date'
        //                         });
        //                     }}>
        //                         Edit
        //                     </button></td>
        //                 }
        //             </>
        //         // :
        //         // <>
        //         // <td>Jahr <input/> Monat (1-12) <input/> Tag (1-31)</td><td>Name</td>
        //         // </>
        //     }
        // </tr>
    )
})

interface AllBirthdaysProps {
    feedData: FeedData | null;
    editState: EditState;
    editedText: string;
    setEditedText: (t: string) => void;
    admin: boolean;
    addBirthday: () => void;
    onEnter: () => void;
    onCancel: () => void;
    onEdit: (i: number) => () => void;
    onDelete: (i: number) => () => void;
}

interface BirthdayWithIdx extends Birthday {
    index: number;
}

const AllBirthdays = forwardRef<HTMLInputElement | null, AllBirthdaysProps>(function AllBirthdays(props, ref) {
    const feedData = props.feedData;
    if (feedData == null) return (
        <div>Noch nicht geladen ...</div>
    )

    const editState = props.editState;
    const editedText = props.editedText;
    const setEditedText = props.setEditedText;
    const admin = props.admin;
    const addBirthday = props.addBirthday;

    const birthdaysWithIdx: BirthdayWithIdx[] = feedData.birthdays.map((bd, i) => ({
        ...bd,
        index: i
    }))

    birthdaysWithIdx.sort(compareBirthday)

    return (
        <div className={`${styles.entry}`}>

            <h3>Alle Geburtstage.</h3>
            <table>
                <tbody>
                    {
                        birthdaysWithIdx.map((bd) => (
                            <BirthdayComp
                                ref={ref}
                                admin={admin}
                                key={`bd.${bd.index}`}
                                feedData={feedData}
                                editState={editState}
                                editedText={editedText}
                                setEditedText={setEditedText}
                                idx={bd.index}
                                onEnter={props.onEnter}
                                onCancel={props.onCancel}
                                onEdit={props.onEdit(bd.index)}
                                onDelete={props.onDelete(bd.index)}
                            />
                        ))
                    }
                </tbody>
            </table>
            {admin && (
                <button id='addBirthdayButton' onClick={(e) => {
                    e.stopPropagation();
                    e.bubbles = false;
                    addBirthday();
                }}>Geburtstag hinzufügen</button>
            )
            }
        </div>
    )
})

const FeedEntryComp = forwardRef<HTMLInputElement | null, EditProps>(function FeedEntryComp(props, ref) {
    const entry = props.feedData?.feedEntries[props.idx];
    return (
        <div className={`${styles.entry} ${props.editState.type === 'moveEntry' && props.editState.index === props.idx ? styles.entryMoving : ''}`}>
            {
                props.admin &&
                <div className={styles.floatRight}>
                    <button onClick={props.onEdit}>Bearbeiten</button>
                    <button onClick={props.onDelete}>Löschen</button>
                    <button onClick={props.onMove}>Verschieben</button>
                </div>
            }
            {
                props.editState.type === 'entry' && props.editState.idx === props.idx && props.editState.editing === 'header'
                    ? <Input ref={ref} key='editingInput' value={props.editedText} onChange={(e) => {
                        props.setEditedText(e.target.value);
                    }} onEnter={props.onEnter} onCancel={props.onCancel} />
                    :
                    <>
                        <h3>{entry?.header}</h3>
                    </>
            }
            {
                props.editState.type === 'entry' && props.editState.idx === props.idx && props.editState.editing === 'body'
                    ? <textarea id='editingTa' key='editingTa' value={props.editedText} onChange={(e) => {
                        props.setEditedText(e.target.value);
                    }} onKeyUp={(e) => {
                        if (e.key === 'Enter' && e.ctrlKey) {
                            props.onEnter();
                        } else if (e.key === 'Escape') {
                            props.onCancel();
                        }
                    }}
                        onBlur={(e) => {
                            props.onEnter();
                        }}
                    />

                    :
                    <pre>{entry?.body}</pre>
            }
        </div>
    )
});


function findNextBirthday(today: Date | null, feedData: FeedData | null) {
    if (feedData == null) {
        return null;
    }
    const now = today;
    if (now == null) return null;
    interface BirthdayAndDiff {
        idx: number;
        diff: number;
    }
    return feedData.birthdays.map((bd, i) => ({
        idx: i,
        diff: birthdayDifference(now, bd.date)
    })).reduce<BirthdayAndDiff | null>((prev, cur) => (prev != null && cur != null && prev.diff < cur.diff ? prev : cur), null)
}

interface NextBirthdayProps {
    admin: boolean;
    today: Date | null;
    feedData: FeedData | null;
    editState: EditState;
    editedText: string;
    setEditedText: (t: string) => void;
}

function NextBirthday(props: NextBirthdayProps) {
    const admin = props.admin;
    const feedData = props.feedData;
    const editState = props.editState;
    const editedText = props.editedText;
    const setEditedText = props.setEditedText;
    const nextBirthday = findNextBirthday(props.today, feedData);
    return (
        <div className={`${styles.entry}`}>
            <h3>Nächster Geburtstag</h3>
            {nextBirthday?.idx != null && (
                <table>
                    <tbody>
                        {
                            nextBirthday != null
                            && <BirthdayComp
                                admin={admin}
                                feedData={feedData}
                                editState={editState}
                                editedText={editedText}
                                setEditedText={setEditedText}
                                noEdit={true}
                                idx={nextBirthday.idx}
                                onEnter={() => { }}
                                onCancel={() => { }}
                            />}
                    </tbody>
                </table>
            )}
        </div>
    )
}


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

// /**
//  * 
//  * @param today 
//  * @param nextDateMonth 
//  * @returns difference in ms between today and the date according to nextDateMonth either in the same year as today or the next year depending
//  * on the fact if the date of the current year lies in the past or in the future.
//  */
// function difference(today: Date, nextDateMonth: DateMonth): number {
//     today = new Date(today);
//     today.setHours(0, 0, 0, 0);
//     const month = today.getMonth();
//     const year = today.getFullYear();
//     const sameYear = new Date(year, nextDateMonth.month, nextDateMonth.date, 0, 0, 0, 0);

//     if (sameYear >= today) return sameYear.getTime() - today.getTime();
//     const nextYear = new Date(year + 1, nextDateMonth.month, nextDateMonth.date);
//     return nextYear.getTime() - today.getTime();
// }

function dateMonthOf(d: Date): DateMonth {
    return {
        month: d.getMonth(),
        date: d.getDate(),
    }
}

async function fetchFeed(id: string, signal?: AbortSignal): Promise<FeedData | null> {
    const url = `/api/feed/${id}`;
    console.log('fetchFeed: url=', url);
    return fetch(url, { signal: signal }).then(
        res => res.json()
    ).then(j => {
        if (signal?.aborted) return null;
        const feedData: FeedData | null = j;
        return feedData;
    }).catch(reason => {
        // probably fetch aborted by abort signal or device offline
        return null;
    })
}

interface EditNoneState {
    type: 'none';
}

interface EditBirthdayState {
    type: 'birthday';
    idx: number;
    editing: 'name' | 'date';
}

interface EditEntryState {
    type: 'entry';
    idx: number;
    editing: 'header' | 'body';
}

interface MoveEntryState {
    type: 'moveEntry';
    index: number;
    /**
     * position where the moving started for reset on canceled moving
     */
    origPos: number;
}

type EditState = (
    (
        EditNoneState
        | EditBirthdayState
        | EditEntryState
        | MoveEntryState
    ) & {
        dirty: boolean
    }
);

interface MoveDialogProps {
    onUp: () => void;
    onDown: () => void;
    onFinish: () => void;
    onCancel: () => void;
}

function MoveDialog({ onUp, onDown, onFinish, onCancel }: MoveDialogProps) {
    return (
        <div className={styles.moveDialog}>
            <button className={styles.button} onClick={onUp}>Hoch</button>
            <button className={styles.button} onClick={onDown}>Runter</button>
            <button className={styles.button} onClick={onFinish}>Fertig</button>
            <button className={styles.button} onClick={onCancel}>Abbrechen</button>
        </div>
    )
}

interface State {
    feedData: FeedData | null;
    editState: EditState;
}

interface FeedCompProps {
    admin?: boolean;
    editedId?: string;
    onNotFound?: () => void;
    onAbort?: () => void;
    onSave?: (feed: FeedData) => void;
}

export default function FeedComp({ admin, editedId, onNotFound, onAbort, onSave }: FeedCompProps) {
    const [state, setState] = useState<State>({
        feedData: {
            _id: 'Georg Reitinger',
            name: 'Georg Reitinger',
            birthdays: [
                {
                    name: 'Irmgard',
                    date: { year: 1955, month: 5, date: 31 }
                },
                {
                    name: 'Peter',
                    date: { year: 1977, month: 6, date: 25 }
                },
                {
                    name: 'Georg',
                    date: { year: 1979, month: 1, date: 23 }
                },
                {
                    name: 'Elisabeth',
                    date: { year: 1980, month: 9, date: 4 }
                },
                {
                    name: 'Matthias',
                    date: { year: 1988, month: 8, date: 3 }
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
        }, editState: {
            type: 'none',
            dirty: false,
        }
    })
    const [editedText, setEditedText] = useState<string>('');
    const [today, setToday] = useState<Date | null>(null);
    const [settingUp, setSettingUp] = useState<boolean>(false);
    const [editedBirthdayIdx, setEditedBirthdayIdx] = useState<number>(-1);
    const abortControllerRef = useRef<AbortController | null>(null);
    const editedTextRef = useRef<HTMLInputElement | null>(null);
    const addBirthdayRef = useRef<HTMLButtonElement | null>(null);
    const router = useRouter();

    // function fetchAndUpdateFeed(id: string): Promise<FeedData | null> {
    //     return fetchFeed(id).then(feedData1 => {
    //         setFeedData(feedData1);
    //         const feedJson = JSON.stringify(feedData1);
    //         console.log('feedData', feedData, 'feedJson', feedJson);
    //         localStorage.setItem('feed', feedJson);
    //         return feedData;
    //     })
    // }

    // const setup = async () => {
    //     // console.log
    //     // const id = prompt('Feed id', '');
    //     const id = null;
    //     if (id == null) return;
    //     fetchAndUpdateFeed(id).then((feedData: FeedData|null) => {
    //         setSettingUp(false);
    //     });
    // }

    useEffect(() => {
        console.log('useEffect: admin', admin, 'editedId', editedId);
        const today1 = new Date();
        console.log('today1', today1.toLocaleString());
        setToday(today1);
        const abortController = new AbortController();
        abortControllerRef.current = abortController;

        console.log('typeof(localStorage)', typeof (localStorage));

        if (admin && editedId != null) {
            fetchFeed(editedId, abortController.signal).then(feed => {
                if (abortController.signal.aborted) return;
                if (feed == null) {
                    console.log('alerting in "start effect"');
                    alert(`Feed ${editedId} not found!`);
                    setState(s => ({
                        ...s,
                        feedData: null
                    }))
                    if (onNotFound != null) {
                        onNotFound();
                    }
                    return;
                }
                localStorage.setItem('feed', JSON.stringify(feed));
                setState(s => ({
                    ...s,
                    feedData: feed
                }));
            })
        } else if (typeof (localStorage) !== 'undefined') {
            const feedJson = localStorage.getItem('feed');
            console.log('feedJson1', feedJson);
            console.log('feedJson == null', feedJson == null);
            if (feedJson == null) {
                setSettingUp(true);
                console.log('settingUp to true');
            } else {
                console.log('feedJson', feedJson);
                const feed: FeedData = JSON.parse(feedJson);
                setState(s => ({
                    ...s,
                    feedData: feed
                }));
                if (feed == null) {
                    setSettingUp(true);
                    console.log('settingUp to true ([b])');
                    return;
                }
                fetchFeed(feed._id, abortController.signal).then(feed => {
                    if (abortController.signal.aborted) return;
                    if (feed == null) {
                        return;
                    }
                    localStorage.setItem('feed', JSON.stringify(feed));
                    setState(s => ({
                        ...s,
                        feedData: feed
                    }))
                })
            }
        }

        return () => {
            console.log('aborting effect when today1', today1);
            abortController.abort();
        }
    }, [admin, editedId, onNotFound])

    useEffect(() => {
        function startSetup() {
            if (typeof (localStorage) !== 'object') return;

            const id = prompt('Feed id', '');
            if (id == null) return;
            fetchFeed(id, abortControllerRef.current?.signal).then((feed: FeedData | null) => {
                if (feed == null) {
                    startSetup();
                } else {
                    localStorage.setItem('feed', JSON.stringify(feed));
                    setState(s => ({
                        ...s,
                        feedData: feed
                    }))
                    setSettingUp(false);
                }
            });
        }
        console.log('useEffect for setup');
        if (settingUp) {
            startSetup();
        }
    }, [settingUp])

    useLayoutEffect(() => {
        if (editedTextRef.current != null) {
            editedTextRef.current.focus();
            console.log('editedTextRef has been focussed')
            editedTextRef.current.select();
        } else {
            const ta = document.getElementById('editingTa');
            if (ta != null) {
                ta.focus();
                if (ta instanceof HTMLTextAreaElement) {
                    (ta as HTMLTextAreaElement).select();
                }
            }
        }
    }, [state.editState])

    function Today() {
        console.log('Today(): today=', today);
        return (
            <div className={`${styles.entry}`}>
                <h3>Heute: {today?.toLocaleString()}</h3>
            </div>
        )
    }





    function addBirthday() {
        if (state.feedData == null) return;
        const newDate = { date: 1, month: 1 }
        setState(s => {
            if (s.feedData == null) return s;
            return {
                ...s,
                feedData: {
                    ...s.feedData,
                    birthdays: [
                        ...s.feedData.birthdays,
                        {
                            name: 'Name?',
                            date: newDate
                        }
                    ]
                },
                editState: {
                    ...s.editState,
                    type: 'birthday',
                    idx: s.feedData.birthdays.length,
                    editing: 'date',
                    dirty: true,
                }
            }
        })
        setEditedText(formatBirthdayDate(newDate))
    }

    function onEditEnter() {
        if (state.feedData == null) return;
        const feedData = state.feedData;
        const editState = state.editState;
        switch (editState.type) {
            case 'birthday':
                switch (editState.editing) {
                    case 'date':
                        const parsedDate: BirthdayDate | null = parseBirthdayDate(editedText);
                        if (parsedDate == null) return;
                        setState({
                            ...state,
                            feedData: {
                                ...feedData,
                                birthdays: feedData.birthdays.map((bd, i) => i === editState.idx ? ({
                                    date: parsedDate,
                                    name: bd.name
                                }) : bd)
                            },
                            editState: {
                                type: 'birthday',
                                idx: editState.idx,
                                editing: 'name',
                                dirty: true
                            }
                        })
                        setEditedText(feedData.birthdays[editState.idx].name);
                        break;
                    case 'name':
                        const newName = editedText;
                        setState({
                            ...state,
                            feedData: {
                                ...feedData,
                                birthdays: feedData.birthdays.map((bd, i) => i === editState.idx ? ({
                                    date: bd.date,
                                    name: newName
                                }) : bd)
                            }, editState: {
                                type: 'none',
                                dirty: true
                            }
                        })
                        const b = document.getElementById('addBirthdayButton');
                        if (b != null) {
                            b.focus();
                        }
                        break;
                }
                break;
            case 'entry':
                switch (editState.editing) {
                    case 'header':
                        setState({
                            ...state,
                            feedData: {
                                ...feedData,
                                feedEntries: feedData.feedEntries.map((e, i) => i === editState.idx ? ({
                                    header: editedText,
                                    body: e.body
                                }) : e)
                            },
                            editState: {
                                type: 'entry',
                                idx: editState.idx,
                                editing: 'body',
                                dirty: true
                            }
                        })
                        setEditedText(feedData.feedEntries[editState.idx].body);
                        break;
                    case 'body':
                        setState({
                            ...state,
                            feedData: {
                                ...feedData,
                                feedEntries: feedData.feedEntries.map((e, i) => i === editState.idx ? ({
                                    header: e.header,
                                    body: editedText
                                }) : e)
                            }, editState: {
                                type: 'none',
                                dirty: true
                            }
                        });
                        const b = document.getElementById('addEntryButton');
                        if (b != null) {
                            b.focus();
                        }
                        break;
                }
                break;
            default:
                break;
        }
    }

    function onEditCancel() {
        setState(s => ({
            ...s,
            editState: {
                type: 'none',
                dirty: s.editState.dirty
            }
        }))
    }

    const onBirthdayEdit = (i: number) => () => {
        const s = state;
        if (s.feedData == null) return;
        setState({
            ...s,
            editState: {
                ...s.editState,
                type: 'birthday',
                idx: i,
                editing: 'date'

            }
        })
        setEditedText(formatBirthdayDate(s.feedData.birthdays[i].date))
    }

    const onBirthdayDelete = (i: number) => () => {
        const s = state;
        if (s.feedData == null) return;
        setState({
            ...s,
            feedData: {
                ...s.feedData,
                birthdays: [...s.feedData.birthdays.slice(0, i), ...s.feedData.birthdays.slice(i + 1)]
            },
            editState: {
                type: 'none',
                dirty: true
            }
        })
    }

    const onAddEntry = () => {
        const feedData = state.feedData;
        const editState = state.editState;
        if (feedData == null) return;
        const newHeader = '<new header>';
        setState({
            ...state,
            feedData: {
                ...feedData,
                feedEntries: [{
                    header: newHeader,
                    body: '<new body>',
                }, ...feedData.feedEntries]
            }, editState: {
                ...editState,
                type: 'entry',
                idx: 0,
                editing: 'header',
                dirty: true

            }
        })
        setEditedText(newHeader);
    }


    const onEntryEdit = (i: number) => () => {
        const feedData = state.feedData;
        const editState = state.editState;
        if (feedData == null) return;

        setState({
            ...state,
            editState: {
                ...editState,
                type: 'entry',
                idx: i,
                editing: 'header',
            }
        })
        setEditedText(feedData.feedEntries[i].header);
    }

    const onEntryDelete = (i: number) => () => {
        const feedData = state.feedData;
        const editState = state.editState;
        if (feedData == null) return;
        setState({
            ...state,
            feedData: {
                ...feedData,
                feedEntries: [...feedData.feedEntries.slice(0, i), ...feedData.feedEntries.slice(i + 1)]
            }, editState: {
                type: 'none',
                dirty: true,
            }
        })
    }

    const onEntryMove = (i: number) => () => {
        const feedData = state.feedData;
        if (feedData == null) return;
        onEditEnter();
        setState(d => ({
            ...d,
            editState: {
                type: 'moveEntry',
                index: i,
                origPos: i,
                dirty: d.editState.dirty
            }
        }))
    }

    function onSaveClicked() {
        if (state.feedData == null) return;
        onEditEnter();
        if (onSave != null) onSave(state.feedData);
    }

    function onUp() {
        setState(s => {
            if (s.feedData == null) return s;
            if (s.editState.type !== 'moveEntry') return s;
            if (s.editState.index === 0) return s;
            return {
                ...s,
                feedData: {
                    ...s.feedData,
                    feedEntries: [
                        ...s.feedData.feedEntries.slice(0, s.editState.index - 1),
                        s.feedData.feedEntries[s.editState.index],
                        s.feedData.feedEntries[s.editState.index - 1],
                        ...s.feedData.feedEntries.slice(s.editState.index + 1)
                    ]
                },
                editState: {
                    ...s.editState,
                    index: s.editState.index - 1

                }
            }
        })
    }

    function onDown() {
        setState(s => {
            if (s.feedData == null) return s;
            if (s.editState.type !== 'moveEntry') return s;
            if (s.editState.index === s.feedData.feedEntries.length - 1) return s;
            return {
                ...s,
                feedData: {
                    ...s.feedData,
                    feedEntries: [
                        ...s.feedData.feedEntries.slice(0, s.editState.index),
                        s.feedData.feedEntries[s.editState.index + 1],
                        s.feedData.feedEntries[s.editState.index],
                        ...s.feedData.feedEntries.slice(s.editState.index + 2)
                    ]
                },
                editState: {
                    ...s.editState,
                    index: s.editState.index + 1

                }
            }
        })
    }

    function onFinishMove() {
        setState(s => ({
            ...s,
            editState: {
                type: 'none',
                dirty: true
            }
        }))
    }

    function onCancelMove() {
        // reset orig position
        setState(s => s.feedData == null ? s : {
            ...s,
            feedData: {
                ...s.feedData,
                feedEntries: s.editState.type !== 'moveEntry' || s.editState.index === s.editState.origPos ? s.feedData.feedEntries
                    : s.editState.index < s.editState.origPos ? [
                        ...s.feedData.feedEntries.slice(0, s.editState.index),
                        ...s.feedData.feedEntries.slice(s.editState.index + 1, s.editState.origPos + 1),
                        s.feedData.feedEntries[s.editState.index],
                        ...s.feedData.feedEntries.slice(s.editState.origPos + 1)
                    ] : /* s.editState.index > s.editState.origPos */[
                        ...s.feedData.feedEntries.slice(0, s.editState.origPos),
                        s.feedData.feedEntries[s.editState.index],
                        ...s.feedData.feedEntries.slice(s.editState.origPos, s.editState.index),
                        ...s.feedData.feedEntries.slice(s.editState.index + 1)
                    ]
            },
            editState: {
                type: 'none',
                dirty: s.editState.dirty
            }
        })
    }

    function onFeedRename() {
        if (state.feedData == null) return;
        const newName = prompt('Neuer Feedname', state.feedData.name);
        if (newName == null) return;
        onEditEnter();

        setState({
            ...state,
            feedData: {
                ...state.feedData,
                name: newName
            }, editState: {
                ...state.editState,
                dirty: true
            }
        })
    }

    const editState = state.editState;
    const feedData = state.feedData;

    return (
        <div >
            {
                state.editState.type === 'moveEntry' &&
                <MoveDialog onUp={onUp} onDown={onDown} onFinish={onFinishMove} onCancel={onCancelMove} />
            }
            {
                editState.dirty &&
                <div className={styles.saveDiv}>
                    <button onClick={onSaveClicked}>Auf dem Server speichern</button>
                </div>
            }
            <h1>Infos {feedData?.name}</h1>
            {
                admin && <button onClick={onFeedRename}>Feed umbenennen</button>
            }
            <Today />
            <NextBirthday admin={admin ?? false} feedData={feedData} editState={editState} editedText={editedText} setEditedText={setEditedText} today={today} />
            <AllBirthdays
                ref={editedTextRef}
                feedData={feedData}
                editState={editState}
                editedText={editedText}
                setEditedText={setEditedText}
                admin={admin ?? false}
                addBirthday={addBirthday}
                onEnter={onEditEnter}
                onCancel={onEditCancel}
                onEdit={onBirthdayEdit}
                onDelete={onBirthdayDelete}
            />
            {
                admin && <button id='addEntryButton' onClick={onAddEntry}>Eintrag hinzufügen</button>
            }

            {
                feedData?.feedEntries.map((e, i) => (
                    <FeedEntryComp
                        ref={editedTextRef}
                        key={`e.${i}`}
                        admin={admin ?? false}
                        feedData={feedData}
                        idx={i}
                        editState={editState}
                        editedText={editedText}
                        setEditedText={setEditedText}
                        onEnter={onEditEnter}
                        onCancel={onEditCancel}
                        onEdit={onEntryEdit(i)}
                        onDelete={onEntryDelete(i)}
                        onMove={onEntryMove(i)}
                    />
                ))

            }
        </div>
    )
}
