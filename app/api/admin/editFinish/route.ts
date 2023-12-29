import { editFinish } from "@/app/_lib/FeedDataForServer";
import { EditFinishReq, EditFinishResp } from "@/app/_lib/admin/editFinish";
import { myPOST } from "@/app/_lib/apiRoutesForServer";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    return myPOST<EditFinishReq, EditFinishResp>(req, editFinish);
}