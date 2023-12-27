import { editStart } from "@/app/_lib/FeedDataForServer";
import { EditStartReq, EditStartResp } from "@/app/_lib/admin/editStart";
import clientPromise from "@/app/_lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest): Promise<NextResponse<EditStartResp>> {
    const editStartReq: EditStartReq = await req.json();
    const editStartResult = await editStart(editStartReq.id, editStartReq.passwd, editStartReq.force);
    return NextResponse.json(editStartResult);
}