import axios from "axios";
const fs = require('fs');

function prepareDirectory(fileUrl, fileName, targetLocation) {
    if(!fs.existsSync(targetLocation)) fs.mkdirSync(targetLocation, {recursive: true});
    let tmp = fileUrl.split('.');
    let extension = '.' + tmp[tmp.length - 1];
    return targetLocation + '/' + fileName + extension;
}

function replyWithProgress(event, payload, obj) {
    if(obj.loaded !== obj.current) {
        event.reply('from-main', {
            result: { total: obj.total, loaded: obj.loaded },
            passThrough: payload.passThrough
        });
        obj.current = obj.loaded;
    }
}

export default function (event, payload) {
    let url = payload.url;
    let fileName = payload.fileName;
    let targetLocation = payload.targetLocation;
    let referer = payload.referer;
    let timer = null;

    axios({
        method: 'GET',
        url: url,
        responseType: 'stream',
        headers: {
            referer: referer,  // without this, cloudflare will reject the request
            "User-Agent": 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36'
        }
    }).then((response) => {
        //TODO: Find a way to pause/cancel an ongoing download
        let obj = {
            total: 0,
            loaded: 0,
            current: 0,
        }
        timer = setInterval(() => { replyWithProgress(event, payload, obj); }, 250);
        let filePath = prepareDirectory(url, fileName, targetLocation);
        response.data.pipe(fs.createWriteStream(filePath))
        response.data.on('data', (data) => {
            obj.total = response.headers['content-length'];
            obj.loaded += Buffer.byteLength(data);
        })
        response.data.on('end', () => {
            clearInterval(timer);
            replyWithProgress(event, payload, obj);
            event.reply('from-main', { result: {downloaded: filePath}, passThrough: payload.passThrough });
        })
        response.data.on('error', (error) => {
            event.reply('from-main', { error: error, passThrough: payload.passThrough });
        })
    }).catch((error) => {
        clearInterval(timer);
        event.reply('from-main', { error: error, passThrough: payload.passThrough });
    })
}