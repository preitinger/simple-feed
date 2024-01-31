'use client';

import { useEffect, useState } from 'react';
import styles from './page.module.css'
import { useRouter } from 'next/navigation';
import { myFetchPost } from '@/app/_lib/apiRoutes';
import { AddEntryReq, AddEntryResp } from '@/app/_lib/admin/addEntry';
import TextInputComp from '@/app/_components/TextInputComp';
import ImgInputComp from '@/app/_components/ImgInputComp';

export default function Page({ params }: { params: { feedId: string } }) {
    const [header, setHeader] = useState<string>('');
    const [imgData, setImgData] = useState<string | null>(null);
    const [body, setBody] = useState<string>('');
    const [passwd, setPasswd] = useState<string>('');
    const router = useRouter();

    const feedId = decodeURIComponent(params.feedId);

    function onSend() {
        const req: AddEntryReq = {
            id: feedId,
            passwd: passwd,
            header: header,
            imgData: imgData,
            body: body
        }
        myFetchPost<AddEntryReq, AddEntryResp>(`/api/admin/addEntry`, req).then((resp) => {
            const key = `addingFeed-${feedId}`;

            switch (resp.type) {
                case 'success':
                    alert('Eintrag hinzugefügt.');
                    setHeader('');
                    setImgData(null);
                    setBody('');
                    localStorage.removeItem(key);
                    break;
                case 'adminActive':
                    alert(`Der Eintrag kann gerade nicht hinzugefügt werden, da der Feed ${feedId} gerade gewartet wird.`);
                    localStorage.setItem(key, JSON.stringify(req));
                    break;
                case 'error':
                    alert('Fehler beim Speichern: ' + resp.error);
                    localStorage.setItem(key, JSON.stringify(req));
                    break;
            }
        })
    }

    useEffect(() => {
        const reqStr = localStorage.getItem(`addingFeed-${feedId}`);
        if (reqStr != null) {
            const req = JSON.parse(reqStr);
            setPasswd(req.passwd);
            setHeader(req.header);
            setImgData(req.imgData);
            setBody(req.body);
        }
    }, [feedId]);

    return (
        <div className={styles.main}>
            <h1>Neuer Eintrag für Feed {'"'}{feedId}{'"'}</h1>
            <TextInputComp id='header' label='Überschrift' value={header} onChange={setHeader} />
            <ImgInputComp id='img' label='Optionales Bild' value={imgData} onChange={setImgData} />
            <TextInputComp id='body' label='Textkörper' value={body} onChange={setBody} area={true} />
            <TextInputComp id='passwd' type='password' label={`Passwort für "${feedId}"`} value={passwd} onChange={setPasswd} />
            <div>
                <button onClick={onSend}>Senden</button>
            </div>
        </div>
    )
}