const state = {
    extensions: [],
    scanning: false,
};
const getters = {
    get : state => state.extensions,
    isScanning : state => state.scanning,
};
const actions = {
    init : (context) => {
        console.log('scanning for extensions...');
        context.commit('setScanning');
        window.ipcRenderer.send('from-renderer', {
            fn: 'initExtensions', payload: null, passThrough: {flag: 'extensions/finishInit'}
        });
    },
    finishInit : (context, payload) => {
        if (payload.hasOwnProperty.call(payload, 'result')) {
            context.commit('setExtensions', payload.result);
            context.commit('setScanning', false);
            console.log(context.getters['get']);
        }
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