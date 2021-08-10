// const fs = require('fs');
let extensions = new Map();
import downloader from './downloader';
import validator from "./validator";

(function updateModules() {
    // Allow us to dynamically require all Vuex module files.
    // https://webpack.js.org/guides/dependency-management/#require-context
    const requireModule = require.context(
        // Search for files in the modules directory.
        './modules',
        // Search for files in subdirectories.
        true,
        // Include any index.js file.
        /^(.)*\/index\.js$/
    );

    extensions.clear();

    // For every Vuex module...
    requireModule.keys().forEach(fileName => {
        const moduleDefinition = requireModule(fileName).default;

        extensions.set(moduleDefinition.info.id, moduleDefinition);

    });
})();

export default {
    initExtensions() {
        return this.listSources();
    },
    listSources: () => Array.from(extensions.values()).map(extension => extension.info),
    browseSeries : async (payload) => extensions.has(payload.id) ?
        validator.validateSeriesList(await extensions.get(payload.id).browseSeries(payload)) : null,
    searchSeries : async (payload) => extensions.has(payload.id) ?
        validator.validateSeriesList(await extensions.get(payload.id).searchSeries(payload)) : null,
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