const fs = require('fs');
let extensions = new Map();
import downloader from './downloader';
import validator from "./validator";

export default {
    async initExtensions() {
        let directories = fs.readdirSync('./src/extensions', { withFileTypes: true });
        for (const dir of directories) {
            if(dir.isDirectory()) {
                try {
                    let tmp = await import('./' + dir.name);
                    extensions.set(tmp.default.info.id, tmp.default);
                } catch (e) { console.log(e); }
            }
        }
        return this.listSources();
    },
    listSources: () => Array.from(extensions.values()).map(extension => extension.info),
    browseSeries : async (extensionId) => extensions.has(extensionId) ?
        validator.validateSeriesList(await extensions.get(extensionId).fetch()) : null,
    searchSeriesByKeyword() {

    },
    async viewSeries(url) {
        for(let key of Array.from(extensions.keys())) {
            if(url.includes(key)) {
                return validator.validateSeries(await extensions.get(key).getSeriesInfo(url));
            }
        }
        throw('Extension for ' + url + ' could not be found');
    },
    async viewChapter(payload) {
        for(let key of Array.from(extensions.keys())) {
            if(payload.url.includes(key)) {
                return validator.validateChapter(await extensions.get(key).getChapterImages(payload));
            }
        }
        throw('Extension for ' + payload.url + ' could not be found');
    },
    downloadFile(payload) {
        return downloader(
            payload.url,
            payload.fileName,
            payload.outputPath
        )
    }
}