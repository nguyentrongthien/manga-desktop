const state = {
    series: [],
    local: [],
    current: [],
    scanning: false,
    loading: false,
};
const getters = {
    get : state => state.series,
    getCurrent : state => state.current,
    isScanning : state => state.scanning,
    isLoading : state => state.loading,
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
    }
};

export default {
    state,
    getters,
    actions,
    mutations
};