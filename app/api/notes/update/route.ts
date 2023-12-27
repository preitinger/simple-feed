import { updateNotes } from "@/app/_lib/NotesForServer";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    return NextResponse.json(await updateNotes(await req.json()));
}
