const state = {
    extensions: [],
    scanning: false,
    currentId: null,
    params: {
        search: '',
        page: 1,
        filter: null,
    }
};
const getters = {
    get : state => state.extensions,
    isScanning : state => state.scanning,
    currentExtension : state => state.extensions[state.extensions.findIndex(ext => ext.id === state.currentId)],
    searchTerm : state => state.params.search,
    pageNumber : state => state.params.page,
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
        if(id) context.commit('setCurrentId', id);
        context.commit('setPageNumber', 1);
        context.commit('setSearchTerm', '');
        _requestSeries(context);
    },
    search : (context, search) => {
        context.commit('setSearchTerm', search);
        context.commit('setPageNumber', 1);
        _requestSeries(context, 'searchSeries');
    },
    changePage : (context, pageNumber) => {
        context.commit('setPageNumber', pageNumber > 1 ? pageNumber : 1);
        _requestSeries(context, context.getters['searchTerm'] ? 'searchSeries' : 'browseSeries');
    }
};
const mutations = {
    setScanning : (state, isScanning = true) => {
        state.scanning = isScanning;
    },
    setExtensions : (state, data) => { state.extensions = data; },
    setCurrentId : (state, id) => { state.currentId = id; },
    setSearchTerm : (state, search) => { state.params.search = search },
    setPageNumber : (state, page) => { state.params.page = page },
};

function _requestSeries(context, fn = 'browseSeries') {
    window.ipcRenderer.send('from-renderer', {
        fn: fn, payload: {
            id: context.state.currentId,
            ...context.state.params,
        }, passThrough: {flag: 'series/receiveSeries'}
    });
    context.commit('series/setLoading', true, {root: true});
    context.commit('series/setError', null, {root: true});
}

export default {
    state,
    getters,
    actions,
    mutations
};