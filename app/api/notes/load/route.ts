import { loadNotes } from "@/app/_lib/NotesForServer";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    return NextResponse.json(await loadNotes(await req.json()));
}
