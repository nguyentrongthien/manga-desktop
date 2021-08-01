const state = {
    extensions: [],
    scanning: false,
    pagination: {
        current: 1,
    }
};
const getters = {
    get : state => state.extensions,
    isScanning : state => state.scanning,
};
const actions = {
    init : (context) => {
        context.commit('setScanning');
        window.ipcRenderer.send('from-renderer', {
            fn: 'initExtensions', payload: null, passThrough: {flag: 'extensions/finishInit'}
        });
    },
    finishInit : (context, payload) => {
        if (payload.hasOwnProperty.call(payload, 'result')) {
            context.commit('setExtensions', payload.result);
            context.commit('setScanning', false);
        }
    },
    browse : (context, id) => {
        window.ipcRenderer.send('from-renderer', {
            fn: 'browseSeries', payload: id, passThrough: {flag: 'series/receiveSeries'}
        });
        context.commit('series/setLoading', true, {root: true});
    }
};
const mutations = {
    setScanning : (state, isScanning = true) => {
        state.scanning = isScanning;
    },
    setExtensions : (state, data) => {
        state.extensions = data;
    }
};

export default {
    state,
    getters,
    actions,
    mutations
};