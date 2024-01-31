'use client'

import BoxComp from "@/app/_components/BoxComp";
import ImgInputComp from "@/app/_components/ImgInputComp";
import { useState } from "react";

export default function Page() {
    const [testImgInput, setTestImgInput] = useState<string | null>(null);
    return (
        <BoxComp>
            <h2>Header</h2>
            <div>
                <img src='/icon-512x512.png' />

            </div>
            <p>1. bla bla</p>
            <ImgInputComp id='testImg' value={testImgInput} label='Testbildinput' onChange={setTestImgInput} />
            <p>2. bla bla</p>
        </BoxComp>
    )
}