import { editFinish } from "@/app/_lib/FeedDataForServer";
import { EditFinishReq, EditFinishResp } from "@/app/_lib/admin/editFinish";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest): Promise<NextResponse<EditFinishResp>> {
    const editFinishReq: EditFinishReq = await req.json();
    return NextResponse.json(await editFinish(editFinishReq.feedData, editFinishReq.passwd));
}