const fs = require('fs');
let extensions = new Map();
import downloader from './downloader';

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
    browseSeries : (extensionId) => extensions.has(extensionId) ? extensions.get(extensionId).fetch() : null,
    searchSeriesByKeyword() {

    },
    viewSeries(url) {
        for(let key of Array.from(extensions.keys())) {
            if(url.includes(key)) {
                return extensions.get(key).getSeriesInfo(url);
            }
        }
        throw('Extension for ' + url + ' could not be found');
    },
    viewChapter(payload) {
        for(let key of Array.from(extensions.keys())) {
            if(payload.url.includes(key)) {
                return extensions.get(key).getChapterImages(payload);
            }
        }
        throw('Extension for ' + payload.url + ' could not be found');
    },
    async downloadFile(payload) {
        return await downloader(
            payload.url,
            payload.fileName,
            payload.outputPath
        )
    }
}