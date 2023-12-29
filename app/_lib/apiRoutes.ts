
export type MyResp<MySuccessResp> = MySuccessResp | {
    type: 'error';
    error: string;
}

export function myFetchPost<MyReq, MySuccessResp>(
    url: string,
    req: MyReq,
    signal?: AbortSignal
): Promise<MyResp<MySuccessResp>> {
    return fetch(url, {
        method: 'POST',
        body: JSON.stringify(req),
        signal: signal
    }).then(resp => resp.json());
}