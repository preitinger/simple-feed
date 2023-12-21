import FeedData from "./FeedData";
import { transformPasswd } from "./hash";
import clientPromise from "./mongodb";


export interface FeedDataInDb {
    _id: string;
    version: number;
    data: FeedData;
    editingSince: Date | null;
    archive: FeedData[];
    passwd: string;
}

export async function loadFeedData(id: string): Promise<FeedData | null> {
    const client = await clientPromise;
    return (await client.db('simple-feed').collection<FeedDataInDb>('feeds').findOne({
         _id: id }, {
            projection: {
                data: 1
            }
         }))?.data ?? null;
}

/**
 * @deprecated da Editierung exklusiv sein muss um aergerliche unspeicherbare
 * Aenderungen zu vermeiden!
 * @param feedData 
 */
export async function saveFeedData(feedData: FeedDataInDb): Promise<void> {
    (await clientPromise).db('simple-feed').collection<FeedDataInDb>('feeds').findOneAndReplace({ _id: feedData._id }, feedData, {
        upsert: true
    })
}

export type EditStartResult = {
    type: 'success';
    data: FeedData;
} | {
    type: 'error';
    error: string;
} | {
    type: 'notFound';
} | {
    type: 'wrongPasswd';
} | {
    type: 'alreadyEdited'
}

export async function editStart(id: string, passwd: string, force: boolean): Promise<EditStartResult> {
    const transformedPasswd = transformPasswd('editor', passwd);

    // TODO id, passwd und editing === false pruefen, dabei editing auf true updaten

    while (true) {
        const client = await clientPromise;
        const now = Date.now();
        try {
            const col = client.db('simple-feed').collection<FeedDataInDb>('feeds');
            const res = await col.findOne({
                _id: id
            });
            if (res == null) return {
                type: 'notFound'
            };
            if (transformedPasswd !== res.passwd) return {
                type: 'wrongPasswd'
            };
            if (!force && res.editingSince != null && res.editingSince.getTime() >= now - 60 * 61 * 1000) {
                // geringfuegig oefter erfuellt als die bedingung direkt in der update anweisung unten:
                return {
                    type: 'alreadyEdited'
                };
            }
            const queryDoc: any = {
                _id: id,
                version: res.version,
            }
            if (!force) {
                queryDoc['$or'] = [ // editingSince must be null or older than 1 hour.
                    {
                        editingSince: null,
                    },
                    {
                        editingSince: {
                            $lt: new Date(now - 60 * 60 * 1000)
                        }
                    }
                ]
            }
            const resUpdate = await col.updateOne(queryDoc, {
                $set: {
                    editingSince: new Date(),
                },
            });

            if (!resUpdate.acknowledged) {
                return {
                    type: 'error',
                    error: 'MongoDB did not acknowledge the feed update'
                }
            }

            if (resUpdate.matchedCount !== 1) {
                return {
                    type: 'error',
                    error: 'MongoDB did not return matchedCount 1 on feed update'
                }
            }

            if (resUpdate.modifiedCount !== 1) {
                return {
                    type: 'error',
                    error: 'MongoDB did not return modifiedCount 1 on feed update'
                }
            }

            return {
                type: 'success',
                data: res.data
            }
        } catch (reason) {
            console.error(reason);
            return {
                type: 'error',
                error: 'MongoDB threw exception on update: ' + JSON.stringify(reason),
            }
        }

    }
}

export type EditFinishResult = {
    type: 'success' | 'notFound' | 'wrongPasswd'
} | {
    type: 'error';
    error: string;
}

// TODO
export async function editFinish(feedData: FeedData, passwd: string): Promise<EditFinishResult> {
    const client = await clientPromise;
    // TODO hier erst nur findOne und version sowie alte daten dann verwenden in query bzw. $push: archive...
    const col = client.db('simple-feed').collection<FeedDataInDb>('feeds');
    const numTries = 7;
    let tries: number = numTries;

    while (--tries >= 0) {
        const findRes = await col.findOne<{ data: FeedData; version: number; }>({
            _id: feedData._id
        }, {
            projection: {
                data: 1,
                version: 1,
            }
        });
        console.log('findRes', findRes);

        if (findRes == null) {
            return {
                type: 'notFound'
            }
        }

        const oldFeedData = findRes.data;

        const updateRes = await col.updateOne({
            _id: feedData._id,
            passwd: transformPasswd('editor', passwd),
            version: findRes.version
        }, {
            $set: {
                editingSince: null,
                data: feedData,
            },
            $inc: {
                version: 1
            },
            $push: {
                archive: oldFeedData
            }
        })
        if (!updateRes.acknowledged) {
            return {
                type: 'error',
                error: 'MongoDB did not acknowledge update'
            }
        }
        if (updateRes.matchedCount !== 1) {
            continue;
        }
        if (updateRes.modifiedCount !== 1) {
            return {
                type: 'error',
                error: 'MongoDB did return inconsistent matchedCount and modifiedCount on update'
            }
        }

        return {
            type: 'success'
        };
    }
    return {
        type: 'error',
        error: 'MongoDB failed ' + numTries + ' times when trying to update the feed. Maybe your password is wrong?'
    };
}
