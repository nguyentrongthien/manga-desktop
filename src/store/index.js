import Vue from 'vue';
import Vuex from 'vuex';
import modules from './modules';

const fileName = '.md_data';

/**
 * Check registred module
 * @param {Array} aPath - path to module - ex: ['my', 'nested', 'module']
 * @return {Boolean}
 */
Vuex.Store.prototype.hasModule = function (aPath) {
    let m = this._modules.root;
    return aPath.every((p) => {
        m = m._children[p];
        return m
    })
};

Vue.use(Vuex);

const defaults = [
    {
        key: 'version',
        value: "0.0.1"
    },
    {
        key: 'directory',
        value: null
    },
    {
        key: 'cache',
        value: null
    },
];

const state = {
    busy: false,
    version: "0.0.1",
    placeholder_img: require('./../plugins/base64_img').default,
    data: {},
};
const mutations = {
    setData : (state, payload) => {
        state.data = payload;
    },
    setBusy : (state, isBusy = true) => {
        state.busy = isBusy;
    },
    setDataProp : (state, args) => {
        Vue.set(state.data, args.key, args.value);
    }
};
const getters = {
    isBusy : state => state.busy,
    getDirectory : state => state.data.directory,
    getCache : state => state.data.cache,
    placeholderImg : state => state.placeholder_img,
};
const actions = {
    initialize : (context, payload) => {
        if(!payload)
            window.ipcRenderer.send('from-renderer', {
                fn: 'readData', payload: './' + fileName, passThrough: {flag: 'initialize'}
            });
        else if (payload.hasOwnProperty.call(payload, 'result')) {
            let res = payload.result;
            if(typeof res === "undefined" || res === null) res = {};
            defaults.forEach(prop => {
                context.commit('setDataProp', {
                    key: prop.key,
                    value: res.hasOwnProperty.call(res, prop.key) ? res[prop.key] : prop.value
                });
            });
            context.dispatch('extensions/init').then();
            context.dispatch('series/init').then();
        }
    },
    writeData : (context) => {
        if(context.state.data.version) { // Check if data has already been initialized (might have concurrency issue)
            writeToDisc({ path: './', file: fileName, data: context.state.data });
        }
    },
    selectDirectory : (context, payload) => {
        if(!payload)
            window.ipcRenderer.send('from-renderer', {
                fn: 'getDir',
                passThrough: {flag: 'selectDirectory'}
            });
        else if (payload.result) {
            if(!payload.result.canceled) {
                context.commit('setDataProp', {
                    key: 'directory',
                    value: payload.result.filePaths[0]
                });
                context.dispatch('series/init').then();
            }
        }
    },
    selectCache : (context, payload) => {
        if(!payload)
            window.ipcRenderer.send('from-renderer', {
                fn: 'getDir',
                passThrough: {flag: 'selectCache'}
            });
        else if (payload.result) {
            if(!payload.result.canceled) {
                context.commit('setDataProp', {
                    key: 'cache',
                    value: payload.result.filePaths[0]
                });
            }
        }
    },
};

function writeToDisc(data) {
    window.ipcRenderer.send('from-renderer', {
        fn: 'writeData',
        payload: data
    });
}

const store = new Vuex.Store({
    state,
    mutations,
    actions,
    getters,
    modules,
});

export default store;
