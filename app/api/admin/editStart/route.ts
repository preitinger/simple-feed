import { editStart } from "@/app/lib/FeedDataForServer";
import { EditStartReq, EditStartResp } from "@/app/lib/admin/editStart";
import clientPromise from "@/app/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest): Promise<NextResponse<EditStartResp>> {
    const editStartReq: EditStartReq = await req.json();
    const editStartResult = await editStart(editStartReq.id, editStartReq.passwd, editStartReq.force);
    return NextResponse.json(editStartResult);
}