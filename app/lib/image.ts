
export const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = function () {
            if (typeof (reader.result) === 'string') {
                const res: string = reader.result
                resolve(res);
            } else {
                reject({
                    error: 'Unexpected type of result: ' + typeof (reader.result)
                })
            }
        };
    });
};

export function resizeImage(blob: Blob, widthPx: number): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = ((e) => {
            if (e.loaded !== e.total) {
                console.error('loaded', e.loaded, 'total', e.total);
                reject('unexpected loaded and total values');
                return;
            }
            if (typeof (reader.result) !== 'string') {
                reject(new Error('could not load image (type of result is ' + typeof (reader.result) + ')'));
                return;
            }

            const img = new Image();
            img.src = reader.result;
            img.onload = (el) => {
                const target: any = el.target;
                if (typeof (target.width) === 'number' && typeof (target.height) === 'number') {
                    const wi = widthPx;
                    const he = target.height * widthPx / target.width;
                    const canvas = new OffscreenCanvas(wi, he);
                    const ctx = canvas.getContext('2d');
                    if (ctx == null) {
                        reject(new Error('Could not create 2d context for offscreen canvas'));
                        return;
                    }
                    ctx.drawImage(img, 0, 0, wi, he);
                    ctx.canvas.convertToBlob().then(resBlob => {
                        blobToBase64(resBlob).then(dataStr => {
                            resolve(dataStr)
                        }).catch(reason => {
                            reject(reason);
                        })
                    }).catch(reason => {
                        reject(reason);
                    })

                } else {
                    reject(new Error('el.target.width and height types not as expected'));
                    return;
                }
            }

        });
    });
}
