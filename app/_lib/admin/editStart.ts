import { EditStartResult } from "../FeedDataForServer";

export type EditStartReq = {
    id: string;
    passwd: string;
    force: boolean;
}

export type EditStartResp = EditStartResult;
