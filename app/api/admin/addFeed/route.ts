import FeedData from "@/app/lib/FeedData";
import { FeedDataInDb } from "@/app/lib/FeedDataForServer";
import { AddFeedReq, AddFeedResp } from "@/app/lib/admin/addFeed";
import { transformPasswd } from "@/app/lib/hash";
import clientPromise from "@/app/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest): Promise<NextResponse<AddFeedResp>> {
    const clientProm = clientPromise;    
    const addFeedReq: AddFeedReq = await req.json();
    
    if (transformPasswd('admin', addFeedReq.adminPasswd) !== 'b0d2d3d54dad26ccae9eb9c1c0c6ed62eb1bf89813b99a9124705a3b478439909b476af377e6a07a2661932449ee3ae6c378af16f216dbd9701903db9b92cc86') {
        return NextResponse.json({
            type: 'error',
            error: 'Wrong admin password'
        });
    }

    const client = await clientProm;
    const col = client.db('simple-feed').collection<FeedDataInDb>('feeds');
    const newFeedData: FeedData = {
        _id: addFeedReq.id,
        name: addFeedReq.id,
        birthdays: [],
        feedEntries: []
    }
    const newFeed: FeedDataInDb = {
        _id: addFeedReq.id,
        version: 0,
        editingSince: null,
        data: newFeedData,
        passwd: transformPasswd('editor', addFeedReq.feedPasswd),
        archive: []
    }
    try {
        const insertRes = await col.insertOne(newFeed);
        if (!insertRes.acknowledged) {
            return NextResponse.json({
                type: 'error',
                error: 'insert was not acknowledged by MongoDB'
            });
        }
        if (insertRes.insertedId !== addFeedReq.id) {
            return NextResponse.json({
                type: 'error',
                error: 'insert did not return expected id'
            });
        }

    } catch (reason: any) {
        if (reason.code === 11000) {
            return NextResponse.json({
                type: 'idInUse'
            });
        }
        console.log('caught reason', reason);
        return NextResponse.json({
            type: 'error',
            error: JSON.stringify(reason)
        });
    }
    return NextResponse.json({
        type: 'success',
        feedData: newFeedData
    });
}

// transform('admin', passwd) === 'b0d2d3d54dad26ccae9eb9c1c0c6ed62eb1bf89813b99a9124705a3b478439909b476af377e6a07a2661932449ee3ae6c378af16f216dbd9701903db9b92cc86'