import FeedData from "../FeedData";

export type EditFinishReq = {
    feedData: FeedData;
    passwd: string;
}

export type EditFinishResp = {
    type: 'success' | 'notFound' | 'wrongPasswd'
} | {
    type: 'error';
    error: string;
}
