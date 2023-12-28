import { FeedEntry } from "@/app/_lib/FeedData";
import { FeedDataInDb } from "@/app/_lib/FeedDataForServer";
import { transformPasswd } from "@/app/_lib/hash";
import clientPromise from "@/app/_lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

export type AddEntryReq = {
    id: string;
    passwd: string;
    header: string;
    imgData: string | null;
    body: string;
}

export type AddEntryResp = {
    type: 'adminActive';
} | {
    type: 'success';
} | {
    type: 'error';
    error: string;
}

export async function POST(req1: NextRequest): Promise<NextResponse<AddEntryResp>> {
    const reqProm: Promise<AddEntryReq> = req1.json();
    const client = await clientPromise;
    const db = client.db('simple-feed');
    const col = db.collection<FeedDataInDb>('feeds');

    const req = await reqProm;

    // laden, version merken
    // updaten mit check auf version und editing


    let tries = 7;

    while (--tries >= 0) {
        const findRes = await col.findOne({
            _id: req.id
        }, {
            projection: {
                version: 1,
                editingSince: 1,
                passwd: 1,
                data: 1,
                feedArchive: 1
            }
        })
    
        if (findRes == null) {
            return NextResponse.json({
                type: 'error',
                error: 'Feed with that id not found'
            })
        }
    
        const transformedPw = transformPasswd('editor', req.passwd);
    
        if (findRes.passwd !== transformedPw) {
            return NextResponse.json({
                type: 'error',
                error: 'Wrong password'
            })
        }
    
        if (findRes.editingSince != null) {
            return NextResponse.json({
                type: 'adminActive'
            })
        }
    
        const newFeedArchive = findRes.feedArchive.slice();
        if (newFeedArchive.length > 7) {
            newFeedArchive.splice(0, newFeedArchive.length - 7)
        }
        newFeedArchive.push(findRes.data);

        const updateRes = await col.updateOne({
            _id: req.id,
            passwd: transformedPw,
            editingSince: null,
            version: findRes.version
        }, {
            $push: {
                'data.feedEntries': {
                    header: req.header,
                    imgData: req.imgData ?? undefined,
                    body: req.body
                }
            },
            $set: {
                feedArchive: newFeedArchive
            },
            $inc: {
                version: 1
            }
        });
    
        if (!updateRes.acknowledged) continue;
        if (updateRes.matchedCount !== 1) continue;

        return NextResponse.json({
            type: 'success'
        })
     
    }

   
    return NextResponse.json({
        type: 'error',
        error: 'Datenbank-Update wiederholt fehlgeschlagen'
    });
}