const state = {
    series: [],
    scanning: false,
};
const getters = {
    get : state => state.series,
    isScanning : state => state.scanning,
};
const actions = {
    init : (context) => {
        // TODO: Implement function to scan a given directory for .md_data files
        if(context.rootGetters['getDirectory'])
            console.log('scanning ' + context.rootGetters['getDirectory']);
    },
};
const mutations = {
    setScanning : (state, isScanning = true) => {
        state.scanning = isScanning;
    }
};

export default {
    state,
    getters,
    actions,
    mutations
};