import FeedData, { LoadFeedDataReq, LoadFeedDataResp } from "@/app/_lib/FeedData";
import { loadFeedData } from "@/app/_lib/FeedDataForServer";
import { MyResp } from "@/app/_lib/apiRoutes";
import { myPOST } from "@/app/_lib/apiRoutesForServer";
import { NextApiRequest, NextApiResponse } from "next";
import { NextRequest, NextResponse } from "next/server";

interface Params {
    id: string;
}

// the following GET produces an exception when it is canceled by a refresh in the client, so I move to POST because
// I cach int the localStorage in the client, anyway...

// export async function GET(req: NextRequest, {params}: { params: Params}): Promise<NextResponse<FeedData|null>> {
//     const id = params.id;
//     console.log('params', params);
//     console.log('id', id);
//     if (typeof(id) !== 'string') return NextResponse.json(null);
//     return NextResponse.json((await loadFeedData(params.id)) ?? null);
// }

// instead of GET i use POST which is never cached:

export async function POST(req: NextRequest): Promise<NextResponse<MyResp<LoadFeedDataResp>>> {
    // console.log('POST for /api/feed/load');
    const res = await myPOST<LoadFeedDataReq, LoadFeedDataResp>(req, loadFeedData);
    // console.log('/api/feed/load returning: ', res);
    return res;
}