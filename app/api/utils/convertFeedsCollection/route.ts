import FeedData from "@/app/lib/FeedData";
import { FeedDataInDb } from "@/app/lib/FeedDataForServer";
import { transformPasswd } from "@/app/lib/hash";
import clientPromise from "@/app/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET(): Promise<NextResponse<{ done: boolean }>> {
    // const client = await clientPromise;
    // const db = client.db('simple-feed');
    // const oldCol = db.collection<FeedData>('feeds');
    // const cursor = oldCol.find();
    // const newCol = db.collection<FeedDataInDb>('feeds');

    // while (cursor.hasNext()) {
    //     const feedData = await cursor.next();
    //     if (feedData == null) break;
    //     const res = await newCol.replaceOne({
    //         _id: feedData._id
    //     }, {
    //         version: 0,
    //         data: feedData,
    //         editingSince: null,
    //         archive: [],
    //         passwd: transformPasswd('editor', '1234'),
    //     })
    //     console.log('result of replaceOne', res);
    // }

    return NextResponse.json({
        done: true
    })
}