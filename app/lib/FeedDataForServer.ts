import FeedData from "./FeedData";
import { transformPasswd } from "./hash";
import clientPromise from "./mongodb";


export interface FeedDataInDb {
    _id: string;
    version: number;
    data: FeedData;
    editingSince: Date | null;
    /**
     * bis zu 8 Eintraege
     */
    feedArchive: FeedData[];
    /**
     * bis zu 8 Eintraege
     */
    notesArchive: string[];
    passwd: string;
}

export async function loadFeedData(id: string): Promise<FeedData | null> {
    const client = await clientPromise;
    return (await client.db('simple-feed').collection<FeedDataInDb>('feeds').findOne({
        _id: id
    }, {
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

    // id, passwd und editing === false pruefen, dabei editing auf true updaten

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

export async function editFinish(feedData: FeedData, passwd: string): Promise<EditFinishResult> {
    const client = await clientPromise;
    const col = client.db('simple-feed').collection<FeedDataInDb>('feeds');
    const numTries = 7;
    let tries: number = numTries;

    while (--tries >= 0) {
        const findRes = await col.findOne<{ data: FeedData; version: number; feedArchive: FeedData[] }>({
            _id: feedData._id
        }, {
            projection: {
                data: 1,
                version: 1,
                feedArchive: 1,
            }
        });
        // console.log('findRes', findRes);

        if (findRes == null) {
            return {
                type: 'notFound'
            }
        }

        const oldFeedData = findRes.data;
        const oldFeedArchive = findRes.feedArchive;
        const newFeedArchive = oldFeedArchive.length >= 8
            ? [...oldFeedArchive.slice(oldFeedArchive.length - 8), oldFeedData]
            : [...oldFeedArchive, oldFeedData]

        const updateRes = await col.updateOne({
            _id: feedData._id,
            passwd: transformPasswd('editor', passwd),
            version: findRes.version
        }, {
            $set: {
                editingSince: null,
                data: feedData,
                feedArchive: newFeedArchive
            },
            $inc: {
                version: 1
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

export type UpdateNotesResult = {
    type: 'success';
    num: number;
} | {
    type: 'error';
    error: string;
}

async function sleep(ms: number): Promise<void> {
    return new Promise((res) => {
        const to = setTimeout(() => {
            res();
        }, ms)
    })
}

export async function updateNotes(feedId: string, passwd: string, newNotesList: string[]): Promise<UpdateNotesResult> {
    // console.log('vor sleep');
    // await sleep(3000); // TODO just for debugging
    // console.log('nach sleep');
    if (newNotesList.length === 0) {
        return {
            type: 'error',
            error: 'newNotes empty'
        }
    }
    const client = await clientPromise;
    const col = client.db('simple-feed').collection<FeedDataInDb>('feeds');
    const numTries = 7;
    let tries: number = numTries;

    while (--tries >= 0) {
        const findRes = await col.findOne<{ data: {notes: string}; version: number; notesArchive: string[] }>({
            _id: feedId
        }, {
            projection: {
                'data.notes': 1,
                version: 1,
                notesArchive: 1
            }
        });
        // console.log('findRes', findRes);

        if (findRes == null) {
            return {
                type: 'error',
                error: 'feedId not found'
            }
        }

        const oldNotes = findRes.data.notes;
        const oldNotesArchive = findRes.notesArchive;
        const newNotes = newNotesList[newNotesList.length - 1];
        const newNotesArchive = newNotesList.length >= 9
            ? [...newNotesList.slice(newNotesList.length - 9, newNotesList.length - 1)] :
            newNotesList.length + oldNotesArchive.length > 8
            ? [...oldNotesArchive.slice(oldNotesArchive.length - (8 - newNotesList.length)), oldNotes, ...newNotesList.slice(0, newNotesList.length - 1)]
            : [...oldNotesArchive, oldNotes, ...newNotesList.slice(0, newNotesList.length - 1)];

        const updateRes = await col.updateOne({
            _id: feedId,
            passwd: transformPasswd('editor', passwd),
            version: findRes.version
        }, {
            $set: {
                editingSince: null,
                'data.notes': newNotes,
                notesArchive: newNotesArchive
            },
            $inc: {
                version: 1
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
            type: 'success',
            num: newNotesList.length
        };
    }
    return {
        type: 'error',
        error: 'MongoDB failed ' + numTries + ' times when trying to update the feed. Maybe your password is wrong?'
    };
}