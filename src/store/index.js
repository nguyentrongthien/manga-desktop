import Vue from 'vue';
import Vuex from 'vuex';
import modules from './modules';

const filePath = '.md_data';

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

const state = {
    busy: false,
    version: "0.0.1",
    data: {},
    defaults: [
        {
            key: 'version',
            value: "0.0.1"
        },
        {
            key: 'directory',
            value: null
        },
    ]
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
};
const actions = {
    initialize : (context, payload) => {
        if(!payload)
            window.ipcRenderer.send('from-renderer', {
                fn: 'readData', payload: './' + filePath, passThrough: {flag: 'initialize'}
            });
        else if (payload.hasOwnProperty.call(payload, 'result')) {
            let res = payload.result;
            if(typeof res === "undefined" || res === null) res = {};
            context.state.defaults.forEach(prop => {
                context.commit('setDataProp', {
                    key: prop.key,
                    value: res.hasOwnProperty.call(res, prop.key) ? res[prop.key] : prop.value
                });
            });
        }
    },
    writeData : (context) => {
        if(context.state.data.version) { // Check if data has already been initialized (might have concurrency issue)
            writeToDisc({ path: './' + filePath, data: context.state.data });
        }
    },
    selectDirectory : (context, payload) => {
        if(!payload)
            window.ipcRenderer.send('from-renderer', {
                fn: 'getDir',
                passThrough: {flag: 'selectDirectory'}
            });
        else if (payload.result) {
            if(!payload.result.canceled)
                context.commit('setDataProp', {
                    key: 'directory',
                    value: payload.result.filePaths[0]
                });
            context.dispatch('scanDirectory').then();
        }
    },
    scanDirectory : (context) => {
        // TODO: Implement function to scan a given directory for .md_data files
        console.log('scanning ' + context.state.data.directory);
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
