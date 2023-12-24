import { UpdateNotesResult, updateNotes } from "@/app/lib/FeedDataForServer"
import { NextRequest, NextResponse } from "next/server"

export type UpdateNotesReq = {
    feedId: string;
    passwd: string;
    newNotes: string[];
}
export type UpdateNotesResp = UpdateNotesResult

export async function POST(req: NextRequest): Promise<NextResponse<UpdateNotesResp>> {
    const unReq: UpdateNotesReq = await req.json()
    const resp: UpdateNotesResp = await updateNotes(unReq.feedId, unReq.passwd, unReq.newNotes);
    return NextResponse.json(resp)
}