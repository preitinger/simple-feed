import { FeedEntry } from "@/app/_lib/FeedData";
import { FeedDataInDb } from "@/app/_lib/FeedDataForServer";
import { AddEntryReq, AddEntryResp } from "@/app/_lib/admin/addEntry";
import { myPOST } from "@/app/_lib/apiRoutesForServer";
import { transformPasswd } from "@/app/_lib/hash";
import clientPromise from "@/app/_lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

async function addEntry(req: AddEntryReq): Promise<AddEntryResp> {
    const client = await clientPromise;
    const db = client.db('simple-feed');
    const col = db.collection<FeedDataInDb>('feeds');


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
            return {
                type: 'error',
                error: 'Feed with that id not found'
            }
        }
    
        const transformedPw = transformPasswd('editor', req.passwd);
    
        if (findRes.passwd !== transformedPw) {
            return ({
                type: 'error',
                error: 'Wrong password'
            })
        }
    
        if (findRes.editingSince != null) {
            return ({
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
                    $each: [{
                        header: req.header,
                        imgData: req.imgData ?? undefined,
                        body: req.body
                    }],
                    $position: 0
                }
            } ,
            $set: {
                feedArchive: newFeedArchive
            },
            $inc: {
                version: 1
            }
        });
    
        if (!updateRes.acknowledged) continue;
        if (updateRes.matchedCount !== 1) continue;

        return ({
            type: 'success'
        })
     
    }

   
    return ({
        type: 'error',
        error: 'Datenbank-Update wiederholt fehlgeschlagen'
    });

}

export async function POST(req: NextRequest) {
    return myPOST<AddEntryReq, AddEntryResp>(req, addEntry);
}
