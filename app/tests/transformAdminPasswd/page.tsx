'use client';

import { transformPasswd } from "@/app/_lib/hash";
import { useState } from "react";

export default function TransformAdminPasswd() {
    const [raw, setRaw] = useState<string>('');
    const [transformed, setTransformed] = useState<string>('');

    return (
        <div>
            <input value={raw} onChange={(e) => {
                setRaw(e.target.value);
            }}/>
            <button onClick={() => {
                setTransformed(transformPasswd('admin', raw));
            }}>Transform passwd</button>
            <input readOnly={true} value={transformed}/>
        </div>
    )
}