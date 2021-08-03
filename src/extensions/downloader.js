import Axios from 'axios';
const fs = require('fs');

function download(fileUrl, referer, outputLocationPath) {
    const writer = fs.createWriteStream(outputLocationPath);

    return Axios({
        method: 'get',
        url: fileUrl,
        responseType: 'stream',
        headers: {
            referer: referer  // without this, cloudflare will reject the request
        }
    }).then(response => {

        //ensure that the user can call `then()` only when the file has
        //been downloaded entirely.

        return new Promise((resolve, reject) => {
            response.data.pipe(writer);
            let error = null;
            writer.on('error', err => {
                error = err;
                writer.close();
                console.log(err);
                reject(err);
            });
            writer.on('close', () => {
                if (!error) {
                    resolve(outputLocationPath);
                }
                //no need to call the reject here, as it will have been called in the
                //'error' stream;
            });
        });
    });
}

export default function (fileUrl, fileName, targetLocation, referer, keepExtension = true){
    let tmp = fileUrl.split('.');
    let extension = keepExtension ? '.' + tmp[tmp.length - 1] : '';
    let path = targetLocation + '/' + fileName + extension;
    return download(fileUrl, referer ? referer : fileUrl, path)
}