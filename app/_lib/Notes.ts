export type LoadNotesReq = {
    id: string;
    passwd: string;
}

export type LoadNotesResp = {
    type: 'success';
    notes: string;
} | {
    type: 'error';
    error: string;
}

export type UpdateNotesReq = {
    feedId: string;
    passwd: string;
    newNotesList: string[];
}

export type UpdateNotesResp = {
    type: 'success';
} | {
    type: 'error';
    error: string;
}

