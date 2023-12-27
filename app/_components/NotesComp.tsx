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
    state: 'idle' | 'fetching' | 'typingWhileFetching' | 'offlineIdle';
} | {
    state: 'typing';
    to: NodeJS.Timeout;
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

export default function NotesComp(props: NotesProps) {
    const [notes, setNotes] = useState<string>('');
    const [hint, setHint] = useState<string>('');
    const changeRef = useRef<ChangeData>(initialChangeData);

    useEffect(() => {
        const passwd = organizePasswd(props.feedId);
        if (passwd == null) return;

        const abortController = new AbortController();
        const req: LoadNotesReq = {
            id: props.feedId,
            passwd: passwd
        }
        fetch('/api/notes/load', {
            method: 'POST',
            body: JSON.stringify(req),
            signal: abortController.signal
        }).then(r => r.json()).then((res: LoadNotesResp) => {
            switch (res.type) {
                case 'success':
                    setNotes(res.notes);
                    break;
            }
        })
    }, [props.feedId])

    const setMyTimeout = (passwd: string, newNotes: string | null) => setTimeout(() => {
        const notesListStr = localStorage.getItem('notes');
        console.log('notes from localStorage in timeoutFunc', notesListStr);
        const notesList: string[] = notesListStr == null ? [] : JSON.parse(notesListStr);
        if (newNotes != null) notesList.push(newNotes);
        if (notesList.length > 8) notesList.splice(0, notesList.length - 8);
        const newNotesListStr = JSON.stringify(notesList);
        localStorage.setItem('notes', newNotesListStr);
        console.log('stored new notes', newNotesListStr);

        const req: UpdateNotesReq = {
            feedId: props.feedId,
            passwd: passwd,
            newNotesList: notesList
        }

        changeRef.current.state = 'fetching';
        setHint(hintFetching);

        console.log('req', req);

        fetch('/api/notes/update', {
            method: 'POST',
            body: JSON.stringify(req),
        }).then(r => r.json()).then((res: UpdateNotesResp) => {
            switch (res.type) {
                case 'success':
                    switch (changeRef.current.state) {
                        case 'fetching':
                            changeRef.current.state = 'idle';
                            localStorage.removeItem('notes');
                            setHint('');
                            break;
                        case 'typingWhileFetching':
                            localStorage.removeItem('notes');
                            changeRef.current = {
                                state: 'typing',
                                to: setMyTimeout(passwd, newNotes)
                            }
                            setHint(hintTyping);
                            break;
                    }
                    break;
                case 'error':
                    alert('Error in updateNotes: ' + res.error);
                    changeRef.current.state = 'offlineIdle';
                    setHint(hintOfflineIdle);
                    break;
            }
        }).catch(reason => {
            if (changeRef.current == null) throw new Error('Illegal state: changeDataRef.current null');
            console.log('fetch failed', reason);
            changeRef.current.state = 'offlineIdle';
            setHint(hintOfflineIdle);
        });
    }, 2000);

    function onChange(newNotes: string) {
        setNotes(newNotes);

        const passwd = organizePasswd(props.feedId);
        if (passwd == null) return;

        switch (changeRef.current.state) {
            case 'idle':
                changeRef.current = {
                    state: 'typing',
                    to: setMyTimeout(passwd, newNotes)
                };
                setHint(hintTyping);
                break;
            case 'offlineIdle':
                changeRef.current = {
                    state: 'typing',
                    to: setMyTimeout(passwd, newNotes),
                }
                break;
            case 'typing':
                clearTimeout(changeRef.current.to);
                changeRef.current.to = setMyTimeout(passwd, newNotes);
                break;
            case 'fetching':
                changeRef.current.state = 'typingWhileFetching';
                setHint(hintTypingWhileFetching);
                break;
            case 'typingWhileFetching':
                break;
        }
    }

    function onKeyDown() {
        const passwd = organizePasswd(props.feedId);
        if (passwd == null) return;

        switch (changeRef.current.state) {
            case 'typing':
                clearTimeout(changeRef.current.to);
                changeRef.current.to = setMyTimeout(passwd, null);
                break;
        }
    }

    return (
        <div className={`${props.entryClass} ${styles.notesContainer}`}>
            <h3>Eigene Notizen</h3>
            <textarea value={notes} className={styles.notes} onChange={(e) => {
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