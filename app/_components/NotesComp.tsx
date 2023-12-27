import { useEffect, useRef, useState } from 'react';
import styles from './NotesComp.module.css'
import { LoadNotesReq, LoadNotesResp, UpdateNotesReq, UpdateNotesResp } from '../_lib/Notes';

export interface NotesProps {
    entryClass: string;
    feedId: string;
    // onChange?: (feedId: string, s: string) => void;
    // onKeyDown?: () => void;
    // hint?: string;
}

type ChangeData = {
    state: 'idle' | 'fetching' | 'offlineIdle';
} | {
    state: 'typing';
    to: NodeJS.Timeout;
    lastVal: string;
} | {
    state: 'typingWhileFetching';
    lastVal: string;
}


const initialChangeData: ChangeData = {
    state: 'idle',
}

const hintTyping = 'lokal geändert';
const hintFetching = 'Sende an Server ...';
const hintTypingWhileFetching = 'Während des Sendens noch mal lokal geändert ...';
const hintOfflineIdle = 'lokal geändert und offline';

function organizePasswd(id: string) {
    let passwd = localStorage.getItem('passwd');
    if (passwd == null) {
        passwd = prompt('Passwort für ' + id);
    }

    return passwd;
}


function sendUpdate(id: string, passwd: string, notesList: string[], getChangeData: () => ChangeData, setChangeData: (changeData: ChangeData) => void, setHint: (hint: string) => void): void {
    const req: UpdateNotesReq = {
        feedId: id,
        passwd: passwd,
        newNotesList: notesList
    }

    setChangeData({
        state: 'fetching'
    });

    console.log('req', req);

    fetch('/api/notes/update', {
        method: 'POST',
        body: JSON.stringify(req),
    }).then(r => r.json()).then((res: UpdateNotesResp) => {
        const changeDataCurrent = getChangeData();
        switch (res.type) {
            case 'success':
                switch (changeDataCurrent.state) {
                    case 'fetching':
                        changeDataCurrent.state = 'idle';
                        localStorage.removeItem('notes');
                        setHint('');
                        break;
                    case 'typingWhileFetching':
                        localStorage.removeItem('notes');
                        setChangeData({
                            state: 'typing',
                            to: setMyTimeout(id, passwd, getChangeData, setChangeData, setHint),
                            lastVal: changeDataCurrent.lastVal
                        })
                        setHint(hintTyping);
                        break;
                }
                break;
            case 'error':
                alert('Error in updateNotes: ' + res.error);
                changeDataCurrent.state = 'offlineIdle';
                setHint(hintOfflineIdle);
                break;
        }
    }).catch(reason => {
        console.log('fetch failed', reason);
        setChangeData({
            state: 'offlineIdle'
        })
        setHint(hintOfflineIdle);
    });

}

const setMyTimeout = (id: string, passwd: string, getChangeData: () => ChangeData, setChangeData: (changeData: ChangeData) => void, setHint: (hint: string) => void) => setTimeout(() => {
    const notesListStr = localStorage.getItem('notes');
    console.log('notes from localStorage in timeoutFunc', notesListStr);
    const notesList: string[] = notesListStr == null ? [] : JSON.parse(notesListStr);
    const changeRefCurrent = getChangeData()
    if (changeRefCurrent.state !== 'typing') { 
        throw new Error('timeout when in state ' + changeRefCurrent.state);
    }
    notesList.push(changeRefCurrent.lastVal.substring(0, 4000));
    if (notesList.length > 8) notesList.splice(0, notesList.length - 8);
    const newNotesListStr = JSON.stringify(notesList);
    localStorage.setItem('notes', newNotesListStr);
    console.log('stored new notes', newNotesListStr);

    if (notesList.length === 0) return;

    sendUpdate(id, passwd, notesList, getChangeData, setChangeData, setHint);
}, 2000);


export default function NotesComp(props: NotesProps) {
    const [notes, setNotes] = useState<string>('');
    const [hint, setHint] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const changeRef = useRef<ChangeData>(initialChangeData);

    useEffect(() => {
        let aborted = false;
        const passwd = organizePasswd(props.feedId);
        if (passwd == null) return;

        const abortController = new AbortController();
        const req: LoadNotesReq = {
            id: props.feedId,
            passwd: passwd
        }
        {
            const notesFromStorageStr = localStorage.getItem('notes');
            if (notesFromStorageStr == null) return;
            const notesList = JSON.parse(notesFromStorageStr);
            if (notesList.length > 0) {
                setNotes(notesList[notesList.length - 1]);
                sendUpdate(props.feedId, passwd, notesList, () => {
                    return changeRef.current;
                }, (changeData: ChangeData) => {
                    changeRef.current = changeData
                }, (hint: string) => {
                    setHint(hint);
                });
                return;
            }
        }
        fetch('/api/notes/load', {
            method: 'POST',
            body: JSON.stringify(req),
            signal: abortController.signal
        }).then(r => r.json()).then((res: LoadNotesResp) => {
            if (aborted) return;
            switch (res.type) {
                case 'success':
                    setNotes(res.notes);
                    break;
                case 'error':
                    break;
            }
        }).catch(reason => {
            if (aborted) return;
            console.error('Fehler beim Laden der Notizen', reason);
            alert('Fehler beim Laden der Notizen: ' + JSON.stringify(reason));
        }).finally(() => {
            if (aborted) return;
            setLoading(false);
        })

        return () => {
            aborted = true;
            abortController.abort();
        }
    }, [props.feedId])


    function onChange(newNotes: string) {
        setNotes(newNotes);

        const passwd = organizePasswd(props.feedId);
        if (passwd == null) return;

        const getChangeData = () => changeRef.current;
        const setChangeData = (changeData: ChangeData) => {
            changeRef.current = changeData;
        }

        switch (changeRef.current.state) {
            case 'idle':
                changeRef.current = {
                    state: 'typing',
                    to: setMyTimeout(props.feedId, passwd, getChangeData, setChangeData, setHint),
                    lastVal: newNotes
                };
                setHint(hintTyping);
                break;
            case 'offlineIdle':
                changeRef.current = {
                    state: 'typing',
                    to: setMyTimeout(props.feedId, passwd, getChangeData, setChangeData, setHint),
                    lastVal: newNotes
                }
                break;
            case 'typing':
                clearTimeout(changeRef.current.to);
                changeRef.current.lastVal = newNotes;
                changeRef.current.to = setMyTimeout(props.feedId, passwd, getChangeData, setChangeData, setHint);
                break;
            case 'fetching':
                changeRef.current = {
                    state: 'typingWhileFetching',
                    lastVal: newNotes
                }
                setHint(hintTypingWhileFetching);
                break;
            case 'typingWhileFetching':
                changeRef.current.lastVal = newNotes;
                break;
        }
    }

    function onKeyDown() {
        const passwd = organizePasswd(props.feedId);
        if (passwd == null) return;

        const getChangeData = () => changeRef.current;
        const setChangeData = (changeData: ChangeData) => {
            changeRef.current = changeData;
        }

        switch (changeRef.current.state) {
            case 'typing':
                clearTimeout(changeRef.current.to);
                changeRef.current.to = setMyTimeout(props.feedId, passwd, getChangeData, setChangeData, setHint);
                break;
        }
    }

    return (
        <div className={`${props.entryClass} ${styles.notesContainer}`}>
            <h3>Eigene Notizen</h3>
            {loading && <span>Versuche, Notizen vom Server zu laden ...</span>}
            <textarea value={notes} readOnly={loading} className={styles.notes} onChange={(e) => {
                const newNotes = e.target.value;
                onChange(newNotes);
            }} onKeyDown={onKeyDown} />
            {
                <div className={styles.dirtyHint}>
                    {
                        <span>{hint}</span>
                    }
                </div>
            }
        </div>
    )
}