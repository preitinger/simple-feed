
export type MyResp<MySuccessResp> = MySuccessResp | {
    type: 'error';
    error: string;
}
