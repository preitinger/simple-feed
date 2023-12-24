// process.env.MONGODB_URI = 'not checked-in here for security reasons'

import { transformPasswd } from "../lib/hash";
import clientPromise from "../lib/mongodb"

import FeedData from "../lib/FeedData"
import { FeedDataInDb } from "../lib/FeedDataForServer";


test.skip('test update for editStart', async () => {
    // should throw this test away... ;-)
    const bla: FeedData = {
        _id: 'bla',
        birthdays: [],
        feedEntries: [],
        name: 'bla'
    }
    const client = await clientPromise;

    const col = client.db('feeds').collection<FeedDataInDb>('feedsForTesting');
    const testId = 'test update for editStart';
    const insertRes = await col.insertOne({
        _id: testId,
        data: {
            _id: testId,
            birthdays: [],
            feedEntries: [],
            name: 'bla',
        },
        feedArchive: [],
        editingSince: new Date(Date.now()),
        passwd: transformPasswd('editor', '123'),
        version: 1
    });
    expect(insertRes.acknowledged).toBe(true);
    expect(insertRes.insertedId).toBe(testId);

    // TODO

    try {
        const dateLimit = Date.now() - 60 * 60 * 1000;
        const updateRes = await col.updateOne({
            _id: testId,
            version: 1,
            $or: [
                {
                    editingSince: null,
                },
                {
                    editingSince: {
                        $lt: new Date(dateLimit)
                    }
                }
            ]
        }, {
            $set: {
                willNotBeSet: 'bla'
            }
        })
        console.log('updateRes', updateRes);
        expect(updateRes.acknowledged).toBe(true);
        expect(updateRes.modifiedCount).toBe(0);
        expect(updateRes.matchedCount).toBe(0);
    } catch (reason) {
        console.error('update 1', reason);
        expect(false).toBe(true);
    }

    try {
        const dateLimit = Date.now() - 60 * 60 * 1000;
        const updateRes = await col.updateOne({
            _id: testId,
            version: 1,
            editingSince: {
                $lt: new Date(dateLimit)
            }
        }, {
            $set: {
                willBeSet: 'bla'
            }
        })
        console.log('updateRes', updateRes);
        expect(updateRes.acknowledged).toBe(true);
        expect(updateRes.modifiedCount).toBe(1);
        expect(updateRes.matchedCount).toBe(1);
    } catch (reason) {
        console.error('update 2', reason);
        expect(false).toBe(true);
    }

    await col.deleteOne({
        _id: testId
    })
}, 500000)

// just skipped because MONGODB_URI
test.skip('editingSince null', async () => {
    const bla: FeedData = {
        _id: 'bla',
        birthdays: [],
        feedEntries: [],
        name: 'bla'
    }
    const client = await clientPromise;

    const col = client.db('feeds').collection<FeedDataInDb>('feedsForTesting');
    const testId = 'test update for editStart';
    const insertRes = await col.insertOne({
        _id: testId,
        data: {
            _id: testId,
            birthdays: [],
            feedEntries: [],
            name: 'bla',
        },
        feedArchive: [],
        editingSince: null,
        passwd: transformPasswd('editor', '123'),
        version: 1
    });
    expect(insertRes.acknowledged).toBe(true);
    expect(insertRes.insertedId).toBe(testId);
    try {
        const dateLimit = Date.now() - 60 * 60 * 1000;
        const updateRes = await col.updateOne({
            _id: testId,
            version: 1,
            $or: [
                {
                    editingSince: {
                        $lt: new Date(dateLimit)
                    }
                }, {
                    editingSince: null
                }
            ]
        }, {
            $set: {
                willBeSet: 'bla'
            }
        })
        console.log('updateRes', updateRes);
        expect(updateRes.acknowledged).toBe(true);
        expect(updateRes.modifiedCount).toBe(1);
        expect(updateRes.matchedCount).toBe(1);
    } catch (reason) {
        console.error('update 2', reason);
        expect(false).toBe(true);
    }

    await col.deleteOne({
        _id: testId
    })

})

// just skipped because MONGODB_URI
test.skip('editingSince old', async () => {
    const bla: FeedData = {
        _id: 'bla',
        birthdays: [],
        feedEntries: [],
        name: 'bla'
    }
    const client = await clientPromise;

    const col = client.db('feeds').collection<FeedDataInDb>('feedsForTesting');
    const testId = 'test update for editStart';
    const insertRes = await col.insertOne({
        _id: testId,
        data: {
            _id: testId,
            birthdays: [],
            feedEntries: [],
            name: 'bla',
        },
        feedArchive: [],
        editingSince: new Date(Date.now() - 60 * 61 * 1000 - 1),
        passwd: transformPasswd('editor', '123'),
        version: 1
    });
    expect(insertRes.acknowledged).toBe(true);
    expect(insertRes.insertedId).toBe(testId);
    try {
        const dateLimit = Date.now() - 60 * 60 * 1000;
        const updateRes = await col.updateOne({
            _id: testId,
            version: 1,
            $or: [
                {
                    editingSince: {
                        $lt: new Date(dateLimit)
                    }
                }, {
                    editingSince: null
                }
            ]
        }, {
            $set: {
                willBeSet: 'bla'
            }
        })
        console.log('updateRes', updateRes);
        expect(updateRes.acknowledged).toBe(true);
        expect(updateRes.modifiedCount).toBe(1);
        expect(updateRes.matchedCount).toBe(1);
    } catch (reason) {
        console.error('update 2', reason);
        expect(false).toBe(true);
    }

    await col.deleteOne({
        _id: testId
    })

})

// just skipped because MONGODB_URI
test.skip('editingSince new', async () => {
    const bla: FeedData = {
        _id: 'bla',
        birthdays: [],
        feedEntries: [],
        name: 'bla'
    }
    const client = await clientPromise;

    const dateLimit = Date.now() - 60 * 60 * 1000;
    const col = client.db('feeds').collection<FeedDataInDb>('feedsForTesting');
    const testId = 'test update for editStart';
    const insertRes = await col.insertOne({
        _id: testId,
        data: {
            _id: testId,
            birthdays: [],
            feedEntries: [],
            name: 'bla',
        },
        feedArchive: [],
        editingSince: new Date(dateLimit + 60 * 60 * 1000),
        passwd: transformPasswd('editor', '123'),
        version: 1
    });
    expect(insertRes.acknowledged).toBe(true);
    expect(insertRes.insertedId).toBe(testId);
    try {
        const updateRes = await col.updateOne({
            _id: testId,
            version: 1,
            $or: [
                {
                    editingSince: {
                        $lt: new Date(dateLimit)
                    }
                }, {
                    editingSince: null
                }
            ]
        }, {
            $set: {
                mustNotBeSet: 'blubb'
            }
        })
        console.log('updateRes', updateRes);
        expect(updateRes.acknowledged).toBe(true);
        expect(updateRes.modifiedCount).toBe(0);
        expect(updateRes.matchedCount).toBe(0);
    } catch (reason) {
        console.error('update 2', reason);
        expect(true).toBe(false);
    }

    await col.deleteOne({
        _id: testId
    })

}, 500000)
