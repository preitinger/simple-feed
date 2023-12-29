import { LoadNotesReq, LoadNotesResp } from "@/app/_lib/Notes";
import { loadNotes } from "@/app/_lib/NotesForServer";
import { myPOST } from "@/app/_lib/apiRoutesForServer";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    return myPOST<LoadNotesReq, LoadNotesResp>(req, loadNotes);
    // return NextResponse.json(await loadNotes(await req.json()));
}
