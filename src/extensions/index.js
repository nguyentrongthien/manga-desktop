const fs = require('fs');
let extensions = new Map();
let externalExtensionIds = [];
import validator from "./validator";
import path from 'path';
import helper from "./helper";
// import {app} from 'electron';

(function updateModules() {
    // Allow us to dynamically require all internal extension modules.
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

//Load external extensions (aka plugins)
function _loadPlugins(pluginPath) {
    console.log('Loading plugins from ' + pluginPath);
    let directories = fs.readdirSync(pluginPath, { withFileTypes: true });

    // Clear all loaded external plugins
    externalExtensionIds.forEach(id => {
        if(extensions.has(id)) extensions.delete(id);
    })
    externalExtensionIds.splice(0);

    for (const dir of directories) {
        if(dir.isDirectory()) {
            let pluginPackageJsonPath = path.join(pluginPath, dir.name, 'package.json');
            if(fs.existsSync(pluginPackageJsonPath)) {
                let json = JSON.parse(fs.readFileSync(pluginPackageJsonPath))
                // eslint-disable-next-line no-undef
                let obj = __non_webpack_require__(path.join(pluginPath, dir.name, json.main));
                let extension = obj(helper);
                if(extension.info) {
                    externalExtensionIds.push(extension.info.id);
                    extensions.set(extension.info.id, extension);
                }
            }
        }
    }
}

export default {
    initExtensions(pluginPath) {
        if(pluginPath)
            _loadPlugins(pluginPath);
        else console.log('no plugin path');

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
    getAvailableFilters(id) {
        return extensions.get(id).getAvailableFilters();
    },
    async getChapterImageUrl(payload) {
        for(let key of Array.from(extensions.keys())) {
            if(payload.url.includes(key)) {
                return validator.validateChapter(await extensions.get(key).getChapterImageUrl(payload));
            }
        }
        throw('Extension for ' + payload.url + ' could not be found');
    },
}