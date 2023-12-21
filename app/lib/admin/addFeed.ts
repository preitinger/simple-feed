import FeedData from "../FeedData";

export type AddFeedReq = {
    id: string;
    adminPasswd: string;
    feedPasswd: string;
}

export type AddFeedResp = {
    type: 'success';
    feedData: FeedData;
} | {
    type: 'idInUse';
} | {
    type: 'error';
    error: string;
}
