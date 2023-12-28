'use client';

import { useEffect, useState } from 'react';
import styles from './page.module.css'
import { resizeImage } from '@/app/_lib/image';
import { AddEntryReq, AddEntryResp } from '@/app/api/admin/addEntry/route';
import { useRouter } from 'next/navigation';

interface TextInputProps {
    id: string;
    area?: boolean;
    type?: string;
    label: string;
    value: string;
    onChange: (newValue: string) => void;
}
function TextInputComp(props: TextInputProps) {
    return (
        <div>
            <label htmlFor={props.id}>{props.label}</label>
            {
                props.area ?
                    <textarea value={props.value} onChange={(e) => props.onChange(e.target.value)} />
                    :
                    <input type={props.type ?? 'text'} id={props.id} value={props.value}
                        onChange={(e) => {
                            props.onChange(e.target.value);
                        }}
                    />

            }
        </div>
    )
}

interface ImgInputProps {
    id: string;
    label: string;
    value: string | null;
    onChange: (newValue: string | null) => void;
}

function ImgInputComp(props: ImgInputProps) {
    return (
        <div>
            <label>{props.label}</label>
            {
                props.value != null &&
                <img src={props.value} alt='bla' />
            }
            <label className={styles.imgUploadLabel} htmlFor={props.id}><span>Bild suchen ...</span>
                <input type='file' id={props.id} onChange={async (e) => {
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
                        props.onChange(newImg);
                    }

                }} />
            </label>
            {
                props.value != null &&
                <button onClick={() => props.onChange(null)}>Bild entfernen</button>
            }
        </div>
    )
}

export default function Page({ params }: { params: { feedId: string } }) {
    const [header, setHeader] = useState<string>('');
    const [imgData, setImgData] = useState<string | null>(null);
    const [body, setBody] = useState<string>('');
    const [passwd, setPasswd] = useState<string>('');
    const router = useRouter();

    function onSend() {
        const req: AddEntryReq = {
            id: params.feedId,
            passwd: passwd,
            header: header,
            imgData: imgData,
            body: body
        }
        fetch(`/api/admin/addEntry`, {
            method: 'POST',
            body: JSON.stringify(req)
        }).then(res => res.json()).then((resp: AddEntryResp) => {
            const key = `addingFeed-${params.feedId}`;

            switch (resp.type) {
                case 'success':
                    alert('Eintrag hinzugefügt.');
                    setHeader('');
                    setImgData(null);
                    setBody('');
                    localStorage.removeItem(key);
                    break;
                case 'adminActive':
                    alert(`Der Eintrag kann gerade nicht hinzugefügt werden, da der Feed ${params.feedId} gerade gewartet wird.`);
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
        const reqStr = localStorage.getItem(`addingFeed-${params.feedId}`);
        if (reqStr != null) {
            const req = JSON.parse(reqStr);
            setPasswd(req.passwd);
            setHeader(req.header);
            setImgData(req.imgData);
            setBody(req.body);
        }
    }, [params.feedId]);

    return (
        <div className={styles.main}>
            <h1>Neuer Eintrag für Feed {'"'}{params.feedId}{'"'}</h1>
            <TextInputComp id='header' label='Überschrift' value={header} onChange={setHeader} />
            <ImgInputComp id='img' label='Optionales Bild' value={imgData} onChange={setImgData} />
            <TextInputComp id='body' label='Textkörper' value={body} onChange={setBody} area={true} />
            <TextInputComp id='passwd' type='password' label={`Passwort für "${params.feedId}"`} value={passwd} onChange={setPasswd} />
            <div>
                <button onClick={onSend}>Senden</button>
            </div>
        </div>
    )
}