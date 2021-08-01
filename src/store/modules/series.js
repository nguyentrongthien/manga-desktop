import {createHash} from "crypto";

const fileName = '.md_series';

const state = {
    series: [],
    local: [],
    current: [],
    scanning: false,
    loading: false,
    saving: false,
    selected: {},
    error: null,
};
const getters = {
    get : state => state.series,
    getCurrent : state => state.current,
    getLocal : state => state.local,
    isScanning : state => state.scanning,
    isLoading : state => state.loading,
    isSaving : state => state.saving,
    selectedSeries : state => state.selected,
    getError : state => state.error,
    currentChapter : state => state.selected.chapters[state.selected.reading],
    getSeriesFromLocalByHash : state => (hash, returnObject = false) => {
        console.log(hash);
        for (let series of state.local) {
            if(series.hash.toString() === hash.toString())
                return returnObject ? series : true;
        }

        return null;
    }
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
    requestDetail : (context, url) => {
        context.commit('setLoading');
        context.commit('setError');
        let series = context.getters['getSeriesFromLocalByHash'](
            getHashFromString(url), true
        );
        if(series) {
            context.commit('setSelectedSeries', series);
            context.commit('setLoading', false);
        } else
            window.ipcRenderer.send('from-renderer', {
                fn: 'viewSeries', payload: url, passThrough: {flag: 'series/receiveDetail'}
            });
    },
    receiveDetail : (context, payload) => {
        handleReply(context, payload,
            () => {context.commit('setSelectedSeries', payload.result);},
            () => {context.commit('setError', payload.error);}
        )
        context.commit('setLoading', false);
    },
    requestChapter : (context, index) => {
        context.commit('setLoading');
        context.commit('setError');
        context.commit('setCurrentChapter', index);
        window.ipcRenderer.send('from-renderer', {
            fn: 'viewChapter',
            payload: {
                url: context.getters['currentChapter'].url,
                outputPath: context.rootGetters['getCache']
            },
            passThrough: {
                flag: 'series/receiveChapter',
                index: index
            }
        });
    },
    receiveChapter : (context, payload) => {
        handleReply(context, payload,
            () => {
                context.commit('setImagesOfCurrentChapter', payload.result)
            },
            () => {context.commit('setError', payload.error);}
        )
        context.commit('setLoading', false);
    },
    saveSelectedSeriesToDisk : (context) => {
        context.commit('setSaving');
        context.state.selected.isSaved = true;
        window.ipcRenderer.send('from-renderer', {
            fn: 'writeData',
            payload: {
                path: context.rootGetters['getDirectory'] + '/' + context.getters['selectedSeries'].hash,
                file: '/' + fileName,
                data: context.getters['selectedSeries'],
            },
            passThrough: {
                flag: 'series/saveSelectedSeriesComplete',
                seriesInfo: context.getters['selectedSeries']
            }
        });
    },
    saveSelectedSeriesComplete : (context, payload) => {
        handleReply(context, payload,
            () => {
                console.log(payload.passThrough.seriesInfo);
                context.commit('addSeriesToLocal', payload.passThrough.seriesInfo)
            },
            () => {context.commit('setError', payload.error);}
        )
        context.commit('setSaving', false);
    }
};

const mutations = {
    setScanning : (state, isScanning = true) => {
        state.scanning = isScanning;
    },
    setLoading : (state, isLoading = true) => {
        state.loading = isLoading;
    },
    setSaving : (state, isSaving = true) => {
        state.saving = isSaving;
    },
    setCurrent : (state, series) => {
        state.current = series;
    },
    setSelectedSeries : (state, detail) => {
        state.selected = detail;
    },
    setError : (state, error = null) => {
        state.error = error;
    },
    setCurrentChapter : (state, chapter) => {
        state.selected.reading = chapter >= 0 && chapter < state.selected.chapters.length ? chapter : 0;
    },
    setImagesOfCurrentChapter : (state, images) => {
        state.selected.chapters[state.selected.reading].images = images;
    },
    addSeriesToLocal : (state, series) => {
        state.local.push(series);
    }
};

function handleReply(context, payload, succeed, fail) {
    if (payload.hasOwnProperty.call(payload, 'result'))
        succeed(context, payload);
    else if (payload.hasOwnProperty.call(payload, 'error'))
        fail(context, payload);
}

function getHashFromString(string) {
    return createHash('sha256').update(string).digest('hex');
}

export default {
    state,
    getters,
    actions,
    mutations
};