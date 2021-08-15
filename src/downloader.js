import axios from "axios";
const fs = require('fs');

function prepareDirectory(fileUrl, fileName, targetLocation) {
    if(!fs.existsSync(targetLocation)) fs.mkdirSync(targetLocation, {recursive: true});
    let tmp = fileUrl.split('.');
    let extension = '.' + tmp[tmp.length - 1];
    return targetLocation + '/' + fileName + extension;
}

export default function (event, payload) {
    let url = payload.url;
    let fileName = payload.fileName;
    let targetLocation = payload.targetLocation;
    let referer = payload.referer

    axios({
        method: 'GET',
        url: url,
        responseType: 'stream',
        headers: {
            referer: referer  // without this, cloudflare will reject the request
        }
    }).then((response) => {
        let filePath = prepareDirectory(url, fileName, targetLocation);
        response.data.pipe(fs.createWriteStream(filePath))
        let downloaded = 0
        response.data.on('data', (data) => {
            downloaded += Buffer.byteLength(data)
            event.reply('from-main', {
                result: {
                    total: response.headers['content-length'],
                    loaded: downloaded
                },
                passThrough: payload.passThrough
            });
        })
        response.data.on('end', () => {
            event.reply('from-main', { result: {downloaded: filePath}, passThrough: payload.passThrough });
        })
        response.data.on('error', (error) => {
            event.reply('from-main', { error: error, passThrough: payload.passThrough });
        })
    }).catch((error) => {
        event.reply('from-main', { error: error, passThrough: payload.passThrough });
    })
}