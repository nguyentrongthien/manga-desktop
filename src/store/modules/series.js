const state = {
    series: [],
    local: [],
    current: [],
    scanning: false,
    loading: false,
    selected: {},
    error: null,
};
const getters = {
    get : state => state.series,
    getCurrent : state => state.current,
    isScanning : state => state.scanning,
    isLoading : state => state.loading,
    selectedSeries : state => state.selected,
    getError : state => state.error,
};
const actions = {
    init : (context) => {
        // TODO: Implement function to scan a given directory for .md_data files
        if(context.rootGetters['getDirectory'])
            console.log('scanning ' + context.rootGetters['getDirectory']);
    },
    receiveSeries : (context, payload) => {
        if (payload.hasOwnProperty.call(payload, 'result')) {
            context.commit('setCurrent', payload.result);
            context.commit('setLoading', false);
        }
    },
    view : (context, url) => {
        context.commit('setLoading');
        context.commit('setError');
        console.log(context.state.loading);
        window.ipcRenderer.send('from-renderer', {
            fn: 'viewSeries', payload: url, passThrough: {flag: 'series/receiveDetail'}
        });
    },
    receiveDetail : (context, payload) => {
        if (payload.hasOwnProperty.call(payload, 'result')) {
            context.commit('setSelectedSeries', payload.result);
        } else if (payload.hasOwnProperty.call(payload, 'error')) {
            context.commit('setError', payload.error);
        }
        context.commit('setLoading', false);
    }
};
const mutations = {
    setScanning : (state, isScanning = true) => {
        state.scanning = isScanning;
    },
    setLoading : (state, isLoading = true) => {
        state.loading = isLoading;
    },
    setCurrent : (state, series) => {
        state.current = series;
    },
    setSelectedSeries : (state, detail) => {
        state.selected = detail;
    },
    setError : (state, error = null) => {
        state.error = error;
    }
};

export default {
    state,
    getters,
    actions,
    mutations
};