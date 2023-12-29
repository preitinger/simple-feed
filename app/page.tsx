'use client';

import { MutableRefObject, useRef, useState } from "react";
import FeedComp from "./_components/FeedComp";
import { useRouter } from "next/navigation";
import styles from './page.module.css';

export default function Page() {

    const router = useRouter();

    function onRepair() {
        localStorage.clear();
        router.refresh();
        alert('localStorage was reset')
    }

    return (
        <div>
            <div className={styles.topRight}>
                <button onClick={onRepair}>Repair</button>
            </div>
            <FeedComp />

        </div>
    );
}
