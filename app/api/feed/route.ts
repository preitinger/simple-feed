import FeedData from "@/app/lib/FeedData";
import clientPromise from "@/app/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

type FeedDataOrNull = FeedData | null;

// /**
//  * fuegt entweder leeren oder Feed mit Daten in die feeds collection ein.
//  * nur verwendet um neuen Feed hinzuzufuegen.
//  * @param req 
//  * @returns 
//  */
// export async function POST(req: NextRequest): Promise<NextResponse<FeedDataOrNull>> {
//     const clientProm = clientPromise;
//     const j = await req.json();
//     let feed: FeedData;
//     if (typeof(j.id) === 'string') {
//         feed = {
//             _id: j.id,
//             name: j.id,
//             birthdays: [],
//             feedEntries: [],
//         }
//     } else {
//         feed = {
//             _id: j._id,
//             name: j.name,
//             birthdays: j.birthdays,
//             feedEntries: j.feedEntries
//         };
//     }

//     console.log('feed', feed);

//     // return (await clientProm).db('simple-feed').collection<FeedDataInDb>('feeds').insertOne(feed).then(res => {
//     //     if (res.acknowledged) {
//     //         return NextResponse.json(feed);
//     //     } else {
//             return NextResponse.json(null);
//     //     }
//     // })
// }
