import FeedData from "../FeedData";
import { EditFinishResult } from "../FeedDataForServer"

export type EditFinishReq = {
    feedData: FeedData;
    passwd: string;
}

export type EditFinishResp = EditFinishResult;
