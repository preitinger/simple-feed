'use client'

import { useState } from "react";
import TextInputComp from "../_components/TextInputComp";
import styles from './page.module.css'
import { useRouter } from "next/navigation";

export default function Page() {
    const [feedId, setFeedId] = useState<string>('');
    const router = useRouter();

    function onSetup() {
        localStorage.clear();
        localStorage.setItem('setupId', feedId);
        router.push(`/feed/${feedId}`);
    }

    return (
        <div className={styles.main}>
            <TextInputComp id='feedId' label='Feed ID' value={feedId} onChange={setFeedId} />
            <div>
                <button onClick={onSetup}>Einrichten</button>
            </div>
        </div>
    )
}