import { UpdateNotesReq, UpdateNotesResp } from "@/app/_lib/Notes";
import { updateNotes } from "@/app/_lib/NotesForServer";
import { myPOST } from "@/app/_lib/apiRoutesForServer";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    return myPOST<UpdateNotesReq, UpdateNotesResp>(req, updateNotes);


    // let myJson: UpdateNotesReq;

    // try {
    //     myJson = await req.json();
    // } catch (reason) {
    //     console.warn('caught in /api/notes/update - req.json: ', reason);
    //     const resp: UpdateNotesResp = {
    //         type: 'error',
    //         error: JSON.stringify(reason)
    //     }
    //     return NextResponse.json(resp);
    // }

    // let myResp: UpdateNotesResp;

    // try {
    //     myResp = await updateNotes(myJson);
    // } catch (reason) {
    //     console.warn('caught in /api/notes/update - updateNotes(): ', reason);
    //     const resp: UpdateNotesResp = {
    //         type: 'error',
    //         error: JSON.stringify(reason)
    //     }
    //     return NextResponse.json(resp);
    // }

    // try {
    //     return NextResponse.json(myResp);
    // } catch (reason) {
    //     console.warn('caught in /api/notes/update - NextResponse.json: ', reason);
    //     const resp: UpdateNotesResp = {
    //         type: 'error',
    //         error: JSON.stringify(reason)
    //     }
    //     return NextResponse.json(resp);
    // }

    // // try {
    // //     return NextResponse.json(await updateNotes(await req.json()));
    // // } catch (reason) {
    // //     console.warn('caught in /api/notes/update', reason);
    // //     const resp: UpdateNotesResp = {
    // //         type: 'error',
    // //         error: JSON.stringify(reason)
    // //     }
    // //     return NextResponse.json(resp);
    // // }
}
