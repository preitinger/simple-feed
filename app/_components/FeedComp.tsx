/* eslint-disable @next/next/no-img-element */
'use client';

import Image from 'next/image'
import styles from './FeedComp.module.css'
import { ChangeEvent, ChangeEventHandler, forwardRef, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import FeedData, { Birthday, BirthdayDate, FeedEntry, LoadFeedDataReq, LoadFeedDataResp, birthdayDifference, compareBirthday, formatBirthdayDate, parseBirthdayDate } from '../_lib/FeedData'
import { EditStartReq } from '../_lib/admin/editStart';
import { useRouter } from 'next/navigation';
import { resizeImage } from '../_lib/image';
import NotesComp from './NotesComp';
import { formatWeekdayDe } from '../_lib/parsingAndFormatting';
import { MyResp, myFetchPost } from '../_lib/apiRoutes';
import ImgInputComp from './ImgInputComp';
import BoxComp from './BoxComp';
import RowComp from './RowComp';


const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = function () {
            if (typeof (reader.result) === 'string') {
                const res: string = reader.result
                resolve(res);
            } else {
                reject({
                    error: 'Unexpected type of result: ' + typeof (reader.result)
                })
            }
        };
    });
};

interface EntryBodyProps {
    body: string;
}

function EntryBodyComp(props: EntryBodyProps) {
    return (
        <>
            {
                props.body.split('\n').map((e, i) => (<p key={i}>{e}</p>))
            }
        </>
    )
}

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
                props.admin && !props.noEdit &&
                <td>
                    <RowComp>
                        <button onClick={props.onEdit}>Bearbeiten</button>
                        <button onClick={props.onDelete}>Löschen</button>
                    </RowComp>
                </td>
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
        <BoxComp>

            <h2>Alle Geburtstage.</h2>
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
                <RowComp>
                    <button id='addBirthdayButton' onClick={(e) => {
                        e.stopPropagation();
                        e.bubbles = false;
                        addBirthday();
                    }}>Geburtstag hinzufügen</button>
                </RowComp>
            )
            }
        </BoxComp>
    )
})

type FeedEntryProps = EditProps & {
    onImgChanged: (newImgData: string | null) => void;
}

const FeedEntryComp = forwardRef<HTMLInputElement | null, FeedEntryProps>(function FeedEntryComp(props, ref) {
    const entry = props.feedData?.feedEntries[props.idx];
    return (
        <BoxComp selected={props.editState.type === 'moveEntry' && props.editState.index === props.idx}>
            {
                props.admin &&
                <div className={styles.floatRight}>
                    <RowComp>
                        <button onClick={props.onEdit}>Bearbeiten</button>
                        <button onClick={props.onDelete}>Löschen</button>
                        <button onClick={props.onMove}>Verschieben</button>
                    </RowComp>
                </div>
            }
            {
                props.editState.type === 'entry' && props.editState.idx === props.idx && props.editState.editing === 'header'
                    ? <>
                        <Input ref={ref} key='editingInput' value={props.editedText} onChange={(e) => {
                            props.setEditedText(e.target.value);
                        }} onEnter={props.onEnter} onCancel={props.onCancel} />
                        <span>{entry?.ms != null ? ' - ' + formatDate(new Date(entry?.ms)) : ''}</span>
                    </>
                    : props.editState.type === 'entry' && props.editState.idx === props.idx && props.editState.editing === 'date' ?
                        <>
                            <span>{entry?.header} - </span>
                            <Input ref={ref} key='editingInput' value={props.editedText} onChange={(e) => {
                                props.setEditedText(e.target.value);
                            }} onEnter={props.onEnter} onCancel={props.onCancel} />
                        </>
                        :
                        <>
                            <h2>{entry?.header} {entry?.ms != null ? ' - ' + formatDate(new Date(entry?.ms)) : ''}</h2>
                        </>
            }
            {
                !props.admin && entry?.imgData != null &&
                <div>
                    <img src={entry?.imgData} alt='Bild' />
                </div>
            }

            {/* {
                entry?.imgData != null &&
                <div className={styles.imgDiv}>
                    <img src={entry?.imgData} alt='Bild' className={styles.img} />
                </div>
            }
            {
                props.admin && entry?.imgData != null &&
                <div>
                    <button onClick={() => {
                        props.onImgChanged(null);
                    }}>Bild entfernen</button>
                </div>
            } */}
            {
                props.admin && (
                    <div>
                        {/* <label className={styles.imgUploadLabel} htmlFor={`${props.idx}-uploadImg`}>Bild hochladen ...</label> */}
                        <ImgInputComp id='img' label='Optionales Bild' value={entry?.imgData ?? null} onChange={props.onImgChanged} />

                        {/* <input id={`${props.idx}-uploadImg`} type='file' onChange={async (e) => {
                            const files = e.target.files;
                            if (files != null && files.length >= 1) {
                                const file: File | null = files.item(0)
                                if (file == null) return
                                // if (file.size > (128 << 10)) {
                                //     alert('Bitte keine Dateien größer als 128kB.');
                                //     return;
                                // }
                                // const newImg = await blobToBase64(file);
                                const newImg = await resizeImage(file, 400)
                                props.onImgChanged(newImg);
                            }
                        }} name='name' /> */}
                    </div>
                )
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
                    <EntryBodyComp body={entry?.body ?? ''} />
            }
        </BoxComp>
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
        <BoxComp>
            <h2>Nächster Geburtstag</h2>
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
        </BoxComp>
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

async function loadFeedData(id: string, passwd: string, signal?: AbortSignal): Promise<MyResp<LoadFeedDataResp>> {
    const url = `/api/feed/load`;
    const t = typeof (id);
    console.log('typeof id: ', t);
    if (t !== 'string') {
        return {
            type: 'error',
            error: `Unexpected id: ${JSON.stringify(id)}`
        }
    }
    const body: LoadFeedDataReq = {
        id: id,
        passwd: passwd
    }
    console.log('fetchFeed: url=', url, 'body', body);
    return await myFetchPost<LoadFeedDataReq, LoadFeedDataResp>(url, body, signal);

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
    editing: 'header' | 'date' | 'body';
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
            <RowComp>
                <button onClick={onUp}>Hoch</button>
                <button onClick={onDown}>Runter</button>
                <button onClick={onFinish}>Fertig</button>
                <button onClick={onCancel}>Abbrechen</button>
            </RowComp>
        </div>
    )
}

interface State {
    feedData: FeedData | null;
    editState: EditState;
}

function organizePasswd(id: string) {
    let passwd = localStorage.getItem('passwd');
    if (passwd == null) {
        passwd = prompt(`Passwort für Feed ${id}`, '');
        if (passwd != null) localStorage.setItem('passwd', passwd);
    }

    return passwd;
}

interface FeedCompProps {
    id: string;
    admin?: boolean;
    onNotFound?: () => void;
    onAbort?: () => void;
    onSave?: (feed: FeedData) => void;
    onNotesChange?: (feedId: string, newNotes: string) => void;
    onNotesKeyDown?: () => void;
    notesHint?: string;
    dirtyData?: FeedData;
}

export default function FeedComp({ id, admin, onNotFound, onAbort, onSave, onNotesChange, onNotesKeyDown, notesHint, dirtyData }: FeedCompProps) {
    const [state, setState] = useState<State>({
        feedData: dirtyData ?? null,
        editState: {
            type: 'none',
            dirty: dirtyData != null,
        }
    })
    const [usedSpace, setUsedSpace] = useState<number>(0);
    const [editedText, setEditedText] = useState<string>('');
    const [today, setToday] = useState<Date | null>(null);
    // const [settingUp, setSettingUp] = useState<boolean>(false);
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
        console.log('useEffect: admin', admin, 'id', id, 'dirtyData', dirtyData);
        const today1 = new Date();
        // console.log('today1', today1.toLocaleString());
        setToday(today1);
        const abortController = new AbortController();
        abortControllerRef.current = abortController;

        console.log('in effect: state.feedData:', state.feedData);
        // console.log('typeof(localStorage)', typeof (localStorage));

        if (admin) {
            if (dirtyData == null) {
                console.log('useEffect: in if');
                const passwd = organizePasswd(id);
                if (passwd == null) return;

                ///////
                loadFeedData(id, passwd, abortController.signal).then(j => {
                    if (abortController.signal.aborted) {
                        return;
                    }
                    switch (j.type) {
                        case 'error':
                            handleError(j.error);
                            if (onNotFound != null) {
                                onNotFound();
                            }
                            return;
                        case 'notFound':
                            alert('Feed mit dieser ID nicht gefunden!')
                            if (onNotFound != null) {
                                onNotFound();
                            }
                            return;
                        case 'success':
                            try {
                                localStorage.setItem('feed', JSON.stringify(j.feedData));
                            } catch (reason) {
                                console.log(reason);
                            }
                            setUsedSpace(localStorage.length);
                            setState(s => ({
                                ...s,
                                feedData: j.feedData
                            }));
                            return;
                        case 'wrongPasswd':
                            alert('Falsches Passwort!');
                            localStorage.removeItem('passwd');
                            if (onNotFound != null) {
                                onNotFound();
                            }
                            return;
                    }
                }).catch(reason => {
                    if (abortController.signal.aborted) return;
                    alert('Unerwarteter Fehler: ' + JSON.stringify(reason));
                })
                ///////

                // loadFeedData(id, passwd, abortController.signal).then(feed => {
                //     if (abortController.signal.aborted) return;
                //     if (feed == null) {
                //         console.log('alerting in "start effect"');
                //         alert(`Es wurde kein Feed mit folgender ID gefunden: "${id}" Tippfehler?`)
                //         setState(s => ({
                //             ...s,
                //             feedData: null
                //         }))
                //         if (onNotFound != null) {
                //             onNotFound();
                //         }
                //         return;
                //     }
                //     try {
                //         localStorage.setItem('feed', JSON.stringify(feed));
                //     } catch (reason) {
                //         console.log(reason);
                //     }
                //     setUsedSpace(localStorage.length);
                //     setState(s => ({
                //         ...s,
                //         feedData: feed
                //     }));
                // })

            }
        } else if (typeof (localStorage) !== 'undefined') {
            const feedJson = localStorage.getItem('feed');
            // console.log('feedJson1', feedJson);
            // console.log('feedJson == null', feedJson == null);
            if (feedJson == null) {
                console.log('before startSetup() in effect when no admin');
                startSetup();
                // console.log('settingUp to true');
            } else {
                // console.log('feedJson', feedJson);
                const feed: FeedData = JSON.parse(feedJson);
                if (feed._id !== id) {
                    localStorage.removeItem('feed');
                    localStorage.removeItem('passwd');
                    startSetup();
                    return;
                }
                setState(s => ({
                    ...s,
                    feedData: feed
                }));

                const passwd = organizePasswd(id);
                if (passwd == null) return;
                loadFeedData(id, passwd, abortController.signal).then(j => {
                    if (abortController.signal.aborted) return;
                    switch (j.type) {
                        case 'error':
                            handleError(j.error);
                            break;
                        case 'notFound':
                            alert(`Feed "${id}" nicht auf dem Server gefunden!`);
                            startSetup();
                            break;
                        case 'wrongPasswd':
                            alert(`Falsches Passwort für Feed "${id}"!`);
                            startSetup();
                            break;
                        case 'success': {
                            const feed = j.feedData;
                            try {
                                localStorage.setItem('feed', JSON.stringify(feed));
                            } catch (reason) {
                                console.log(reason);
                            }
                            setState(s => ({
                                ...s,
                                feedData: feed
                            }))
                            break;
                        }
                    }
                }).catch(reason => {
                    // Wahrscheinlich gerade einfach nur offline, keine verwirrende Fehlermeldung!
                    // if (abortController.signal.aborted) {
                    //     // console.warn('abgefangen', reason);
                    //     return;
                    // }
                    // alert('Unerwarteter Fehler: ' + JSON.stringify(reason));
                })
            }
        }

        return () => {
            console.log('aborting effect when today1', today1);
            abortController.abort();
        }
    },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [admin, id, onNotFound, dirtyData]
    )

    function handleError(error: string) {
        alert(`Fehler beim Laden der News: ${error}`);
    }

    function startSetup() {
        if (typeof (localStorage) !== 'object') return;

        const passwd = organizePasswd(id);
        if (passwd == null) return;
        const signal = abortControllerRef.current?.signal;
        loadFeedData(id, passwd, signal).then(j => {
            if (signal?.aborted) return;
            switch (j.type) {
                case 'error':
                    handleError(j.error);
                    break;
                case 'notFound':
                    alert(`Feed "${id}" nicht gefunden!`);
                    setState({
                        feedData: null,
                        editState: {
                            type: 'none',
                            dirty: false
                        }
                    })
                    break;
                case 'wrongPasswd':
                    alert(`Falsches Passwort für Feed "${id}"!`);
                    localStorage.removeItem('passwd');
                    setState({
                        feedData: null,
                        editState: {
                            type: 'none',
                            dirty: false
                        }
                    })
                    startSetup();
                    break;
                case 'success':
                    const feed = j.feedData;
                    try {
                        localStorage.setItem('feed', JSON.stringify(feed));
                    } catch (reason) {
                        console.log(reason);
                    }
                    localStorage.setItem('passwd', passwd); // fuer updateNotes in app/page.tsx
                    setState(s => ({
                        ...s,
                        feedData: feed
                    }))
                    break;
                default:
                    alert('Nicht fertig implementiert?!');
                    break;
            }
        }).catch(reason => {
            if (signal?.aborted) return;
            alert('Unerwarteter Fehler: ' + JSON.stringify(reason));
        })

    }

    useEffect(() => {
        const interval = setInterval(() => {
            setToday(new Date());
        }, 1000)
        setUsedSpace(localStorage.length);

        return () => {
            clearInterval(interval);
        }
    }, [])

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
        return (
            <BoxComp>
                {
                    today != null ?
                        <h2>Heute: {formatWeekdayDe(today?.getDay())}, der {today?.toLocaleString()}</h2>
                        : <span>Lade Daten ...</span>
                }
            </BoxComp>
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
                                    ...e,
                                    header: editedText,
                                }) : e)
                            },
                            editState: {
                                type: 'entry',
                                idx: editState.idx,
                                editing: 'date',
                                dirty: true
                            }
                        })
                        const ms = feedData.feedEntries[editState.idx].ms;
                        setEditedText(ms == null || isNaN(ms) ? new Date().toJSON() : new Date(ms).toJSON());
                        break;
                    case 'date':
                        setState({
                            ...state,
                            feedData: {
                                ...feedData,
                                feedEntries: feedData.feedEntries.map((e, i) => i === editState.idx ? ({
                                    ...e,
                                    ms: Date.parse(editedText)
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
                                    ...e,
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

    const res = (
        <div className={styles.feedComp}>
            {
                state.editState.type === 'moveEntry' &&
                <MoveDialog onUp={onUp} onDown={onDown} onFinish={onFinishMove} onCancel={onCancelMove} />
            }
            {
                editState.dirty &&
                <RowComp>
                    <button onClick={onSaveClicked}>Änderungen speichern</button>
                </RowComp>
            }
            <h1>Infos {feedData?.name}</h1>
            {
                admin && <RowComp><button onClick={onFeedRename}>Feed umbenennen</button></RowComp>
            }
            <Today />
            <NextBirthday admin={admin ?? false} feedData={feedData} editState={editState} editedText={editedText} setEditedText={setEditedText} today={today} />
            {
                feedData != null &&
                <NotesComp entryClass='' feedId={id} />
            }
            {
                admin && <RowComp><button id='addEntryButton' onClick={onAddEntry}>Eintrag hinzufügen</button></RowComp>
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
                        onImgChanged={(newImg) => {
                            if (state.feedData == null) return;
                            setState({
                                ...state,
                                feedData: {
                                    ...state.feedData,
                                    feedEntries: state.feedData.feedEntries.map((e, i1) => (
                                        i1 === i ? {
                                            ...e,
                                            imgData: newImg ?? undefined
                                        } : e
                                    ))
                                },
                                editState: {
                                    ...state.editState,
                                    dirty: true
                                }
                            })
                        }}
                    />
                ))

            }
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
        </div>
    )

    return res;
}
