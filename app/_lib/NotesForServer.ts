import { LoadNotesReq, LoadNotesResp, UpdateNotesReq, UpdateNotesResp } from "./Notes";
import { transformPasswd } from "./hash";
import clientPromise from "./mongodb";

export interface NotesInDb {
    /**
     * same as for the corresponding feed
     */
    _id: string;
    version: number;
    passwd: string;
    notes: string;
    /**
     * bis zu 8 Eintraege
     */
    notesArchive: string[];
}

export async function loadNotes({id, passwd}: LoadNotesReq): Promise<LoadNotesResp> {
    const entry = await (await clientPromise).db('simple-feed').collection<NotesInDb>('notes').findOne({
        _id: id
    }, {
        projection: {
            notes: 1,
            passwd: 1
        }
    });

    if (entry == null) {
        return {
            type: 'error',
            error: 'id not found'
        }
    }

    if (entry.passwd !== transformPasswd('editor', passwd)) {
        return {
            type: 'error',
            error: 'Wrong password'
        }
    }

    return {
        type: 'success',
        notes: entry.notes
    }
}

export async function updateNotes({feedId, passwd, newNotesList}: UpdateNotesReq): Promise<UpdateNotesResp> {
    // console.log('vor sleep');
    // await sleep(3000); // TODO just for debugging
    // console.log('nach sleep');
    await new Promise<void>((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, 3000)
    });
    
    if (newNotesList.length === 0) {
        return {
            type: 'error',
            error: 'newNotes empty'
        }
    }
    const client = await clientPromise;
    const col = client.db('simple-feed').collection<NotesInDb>('notes');
    const numTries = 7;
    let tries: number = numTries;

    while (--tries >= 0) {
        const findRes = await col.findOne<{ notes: string; version: number; notesArchive: string[] }>({
            _id: feedId
        }, {
            projection: {
                notes: 1,
                version: 1,
                notesArchive: 1
            }
        });
        // console.log('findRes', findRes);

        if (findRes == null) {
            return {
                type: 'error',
                error: 'id not found'
            }
        }

        const oldNotes = findRes.notes;
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
                notes: newNotes,
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
        };
    }
    return {
        type: 'error',
        error: 'MongoDB failed ' + numTries + ' times when trying to update the feed. Maybe your password is wrong?'
    };
}
