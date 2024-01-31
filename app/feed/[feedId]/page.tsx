'use client';

import { MutableRefObject, useRef, useState } from "react";
import FeedComp from "../../_components/FeedComp";
import { useRouter } from "next/navigation";
import styles from './page.module.css';
import simpleFeedVersion from "../../_lib/simpleFeedVersion";

export default function Page({ params }: { params: { feedId: string } }) {
    const router = useRouter();
    const feedId = decodeURIComponent(params.feedId);

    function onRepair() {
        localStorage.clear();
        router.refresh();
        alert('localStorage was reset')
    }

    return (
        <div>
            <div className={styles.topRight}>
                v{simpleFeedVersion} <button onClick={onRepair}>Repair</button>
            </div>
            <FeedComp id={feedId} />

        </div>
    );
}
