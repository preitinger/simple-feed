
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
