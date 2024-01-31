
export type MyResp<MySuccessResp> = MySuccessResp | {
    type: 'error';
    error: string;
}

export async function myFetchPost<MyReq, MySuccessResp>(
    url: string,
    req: MyReq,
    signal?: AbortSignal
): Promise<MyResp<MySuccessResp>> {
    return await fetch(url, {
        headers: { "Content-Type": "application/json" },        
        method: 'POST',
        body: JSON.stringify(req),
        signal: signal
    }).then(resp => resp.json());
}