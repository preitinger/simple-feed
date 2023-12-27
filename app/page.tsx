'use client';

import { MutableRefObject, useRef, useState } from "react";
import FeedComp from "./_components/FeedComp";
import { UpdateNotesReq, UpdateNotesResp } from "./api/feed/updateNotes/route";

interface ChangeData {
    state: 'typing' | 'fetching' | 'typingWhileFetching' | 'offlineIdle';
    feedId: string;
    lastVal: string;
    lastTimeMillis: number;
    to: NodeJS.Timeout;
}

const timeoutFunc = (changeDataRef: MutableRefObject<ChangeData | null>, setNotesHint: (hint: string) => void) => {
    if (changeDataRef.current == null) throw new Error('changeDataRef.current null');
    const notesStr = localStorage.getItem('notes');
    console.log('notes from localStorage in timeoutFunc', notesStr);
    const notes: string[] = notesStr == null ? [] : JSON.parse(notesStr);
    notes.push(changeDataRef.current.lastVal);
    if (notes.length > 8) notes.splice(0, notes.length - 8);
    const newNotesStr = JSON.stringify(notes);
    localStorage.setItem('notes', newNotesStr);
    console.log('stored new notes', newNotesStr);
    let passwd = localStorage.getItem('passwd');
    if (passwd == null) {
        passwd = prompt('Passwort für diesen Feed');
        if (passwd == null) return;
        localStorage.setItem('passwd', passwd);
    }
    if (passwd == null) throw new Error('passwd in localStorage null');
    const req: UpdateNotesReq = {
        feedId: changeDataRef.current.feedId,
        passwd: passwd,
        newNotes: notes
    }

    changeDataRef.current.state = 'fetching';
    setNotesHint(hintFetching);

    fetch('/api/feed/updateNotes', {
        method: 'POST',
        body: JSON.stringify(req)
    }).then(r => r.json()).then((res: UpdateNotesResp) => {
        if (changeDataRef.current == null || changeDataRef.current.state === 'typing') throw new Error('Illegal state');
        switch (res.type) {
            case 'success':
                switch (changeDataRef.current.state) {
                    case 'fetching':
                        changeDataRef.current = null;
                        localStorage.removeItem('notes');
                        setNotesHint('');
                        break;
                    case 'typingWhileFetching':
                        localStorage.removeItem('notes');
                        changeDataRef.current.state = 'typing';
                        changeDataRef.current.to = setMyTimeout(changeDataRef, setNotesHint);
                        setNotesHint(hintTyping);
                        break;
                }
                break;
            case 'error':
                alert('Error in updateNotes: ' + res.error);
                let passwd = localStorage.getItem('passwd');
                passwd = prompt('Passwort für diesen Feed', passwd ?? '');
                if (passwd != null) {
                    localStorage.setItem('passwd', passwd);
                } else {
                    localStorage.removeItem('passwd');
                }
                changeDataRef.current.state = 'offlineIdle';
                setNotesHint(hintOfflineIdle);
                break;
        }
    }).catch(reason => {
        if (changeDataRef.current == null) throw new Error('Illegal state: changeDataRef.current null');
        console.log('fetch failed', reason);
        changeDataRef.current.state = 'offlineIdle';
        setNotesHint(hintOfflineIdle);
    })
}

const setMyTimeout = (changeDataRef: MutableRefObject<ChangeData | null>, setNotesHint: (hint: string) => void): NodeJS.Timeout => {
    return setTimeout(() => {
        timeoutFunc(changeDataRef, setNotesHint);
    }, 2000);
}

const continueEditing = (changeDataRef: MutableRefObject<ChangeData | null>, setNotesHint: (hint: string) => void, newVal?: string):void => {
    if (changeDataRef.current == null) throw new Error('Illegal state: changeDataRef.current null');

    switch (changeDataRef.current.state) {
        case 'offlineIdle':
            changeDataRef.current.state = 'typing';
            changeDataRef.current.to = setMyTimeout(changeDataRef, setNotesHint);
            setNotesHint(hintTyping);
            break;
        case 'typing':
            clearTimeout(changeDataRef.current.to);
            changeDataRef.current.to = setMyTimeout(changeDataRef, setNotesHint);
            break;
        case 'fetching':
            changeDataRef.current.state = 'typingWhileFetching';
            setNotesHint(hintTypingWhileFetching);
            break;
        case 'typingWhileFetching':
            break;
    }
    changeDataRef.current.lastTimeMillis = Date.now();
    if (newVal != null) {
        changeDataRef.current.lastVal = newVal;

    }

}

const hintTyping = 'lokal geändert';
const hintFetching = 'Sende an Server ...';
const hintTypingWhileFetching = 'Während des Sendens noch mal lokal geändert ...';
const hintOfflineIdle = 'lokal geändert und offline';

export default function Page() {
    const changeDataRef = useRef<ChangeData | null>(null);
    const [notesHint, setNotesHint] = useState<string>('');

    function onNotesChange(feedId: string, s: string) {

        if (changeDataRef.current == null) {
            changeDataRef.current = {
                state: 'typing',
                feedId: feedId,
                lastTimeMillis: Date.now(),
                lastVal: s,
                to: setMyTimeout(changeDataRef, setNotesHint)
            }
            setNotesHint(hintTyping);
        } else {
            continueEditing(changeDataRef, setNotesHint, s);
        }

    }

    function onNotesKeyDown() {
        if (changeDataRef.current == null) return;
        continueEditing(changeDataRef, setNotesHint);
    }

    return <FeedComp onNotesChange={onNotesChange} onNotesKeyDown={onNotesKeyDown} notesHint={
        notesHint
    } />;
}
