import FeedData from "@/app/_lib/FeedData";
import { loadFeedData } from "@/app/_lib/FeedDataForServer";
import { NextApiRequest, NextApiResponse } from "next";
import { NextRequest, NextResponse } from "next/server";

interface Params {
    id: string;
}

export async function GET(req: NextRequest, {params}: { params: Params}): Promise<NextResponse<FeedData|null>> {
    const id = params.id;
    console.log('params', params);
    console.log('id', id);
    if (typeof(id) !== 'string') return NextResponse.json(null);
    return NextResponse.json((await loadFeedData(params.id)) ?? null);
}