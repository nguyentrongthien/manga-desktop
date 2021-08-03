import {createHash} from "crypto";

const fileName = '.md_series';

const state = {
    series: [],
    local: [], // Locally saved series
    current: [], // Currently loaded series
    pages: [], // Currently loaded pages of a single chapter
    scanning: false,
    loading: false,
    saving: false,
    selected: { // A single selected series either from local or current
        data: null,
        from: 'current',
        hash: null,
    },
    error: null,
};

const getters = {
    get : state => state.series,
    getCurrent : state => state.current,
    getLocal : state => state.local,
    isScanning : state => state.scanning,
    isLoading : state => state.loading,
    isSaving : state => state.saving,
    selectedSeries : state => getSelectedSeries(state),
    getError : state => state.error,
    currentChapter : state => {
        let series = getSelectedSeries(state, true);
        return series.chapters[series.reading];
    },
    getSeriesFromLocalByHash : state => (hash) => {
        return getSeriesByHash(state, hash, 'local');
    },
    getCurrentPages : state => state.pages,
};

const actions = {
    init : (context) => {
        context.commit('setScanning');
        window.ipcRenderer.send('from-renderer', {
            fn: 'scanDir',
            payload: {
                path: context.rootGetters['getDirectory'],
                fileName: fileName,
            },
            passThrough: {flag: 'series/initComplete'}
        });
    },
    initComplete : (context, payload) => {
        handleReply(context, payload,
            () => {
                payload.result.forEach(series => {
                    context.commit('addSeriesToLocal', series);
                })
                context.commit('setScanning', false);
            },
            () => {context.commit('setError', payload.error);}
        )
    },
    receiveSeries : (context, payload) => {
        handleReply(context, payload,
            () => {
                context.commit('setCurrent', payload.result);
            },
            () => {context.commit('setError', payload.error);}
        );
        context.commit('setLoading', false);
    },
    requestDetail : (context, url) => {
        context.commit('setLoading');
        context.commit('setError');

        // Check if this series is available on local
        let series = context.getters['getSeriesFromLocalByHash'](getHashFromString(url), true);
        if(series) {
            context.commit('setSelectedSeries', {data: series, from: 'local', hash: series.hash});
            context.commit('setLoading', false);
        } else {
            context.commit('setSelectedSeries', {data: null, from: 'current', hash: null});
            window.ipcRenderer.send('from-renderer', {
                fn: 'viewSeries', payload: url, passThrough: {flag: 'series/receiveDetail'}
            });
        }
    },
    receiveDetail : (context, payload) => {
        handleReply(context, payload,
            () => {context.commit('setSelectedSeries', {data: payload.result, from: 'current', hash: payload.result.hash});},
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
                context.commit('setImagesOfCurrentChapter', payload.result.imageUrls)
                context.commit('setCachedImages', payload.result.localImages)
            },
            () => {context.commit('setError', payload.error);}
        )
        context.commit('setLoading', false);
    },
    saveSelectedSeriesToDisk : (context) => {
        context.commit('setSaving');
        context.state.selected.data.isSaved = true;
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
        window.ipcRenderer.send('from-renderer', {
            fn: 'downloadFile',
            payload: {
                url: context.getters['selectedSeries'].img,
                fileName: 'cover',
                outputPath: context.rootGetters['getDirectory'] + '/' + context.getters['selectedSeries'].hash,
            },
            passThrough: {
                flag: 'series/coverDownloaded',
                hash: context.getters['selectedSeries'].hash
            }
        });
    },
    saveSelectedSeriesComplete : (context, payload) => {
        handleReply(context, payload,
            () => {
                context.commit('addSeriesToLocal', payload.passThrough.seriesInfo)
            },
            () => {context.commit('setError', payload.error);}
        )
        context.commit('setSaving', false);
    },
    coverDownloaded : (context, payload) => {
        handleReply(context, payload,
            () => {
                context.commit('updateLocalSeriesByHash', {
                    hash: payload.passThrough.hash,
                    key: 'img',
                    value: payload.result
                })
            },
            () => {context.commit('setError', payload.error);}
        )
    },
    writeSeriesInfoToDisk : (context, hash) => {
        let series = context.getters['getSeriesFromLocalByHash'](hash);
        if(series)
            window.ipcRenderer.send('from-renderer', {
                fn: 'writeData',
                payload: {
                    path: context.rootGetters['getDirectory'] + '/' + hash,
                    file: '/' + fileName,
                    data: series,
                }
            });
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
    setSelectedSeries : (state, payload) => {
        state.selected.data = payload.data;
        state.selected.from = payload.from;
        state.selected.hash = payload.hash;
    },
    setError : (state, error = null) => {
        state.error = error;
    },
    setCurrentChapter : (state, chapter) => {
        if(state.selected.from === 'current')
            state.selected.data.reading = chapter >= 0 && chapter < state.selected.data.chapters.length ? chapter : 0;
        else {
            let series = getSeriesByHash(state, state.selected.hash, state.selected.from);
            series.reading = chapter >= 0 && chapter < series.chapters.length ? chapter : 0;
        }
    },
    setImagesOfCurrentChapter : (state, images) => {
        let series = getSelectedSeries(state);
        series.chapters[series.reading].images.splice(0);
        series.chapters[series.reading].images = images;
    },
    setCachedImages : (state, images) => {
        let rnd = randomString(10);
        state.pages.splice(0);
        state.pages = images.map(file => file + '?rnd=' + rnd);
    },
    addSeriesToLocal : (state, series) => {
        state.local.push(series);
    },
    updateLocalSeriesByHash : (state, payload) => {
        for (let series of state.local) {
            if(series.hash.toString() === payload.hash.toString()) {
                series[payload.key] = payload.value;
                break;
            }
        }
    }
};

function getSelectedSeries(state, useDummy = false) {
    if(state.selected.from === 'current') return state.selected.data ? state.selected.data : (useDummy ? {} : null);
    else if(state.selected.from === 'local') {
        return getSeriesByHash(state,  state.selected.hash, 'local');
    }
    return useDummy ? {} : null;
}

function getSeriesByHash(state, hash, from) {
    let index = state[from].findIndex(series => series.hash.toString() === hash.toString());
    return index < 0 ? null : state[from][index];
}

function handleReply(context, payload, succeed, fail) {
    if (payload.hasOwnProperty.call(payload, 'result'))
        succeed(context, payload);
    else if (payload.hasOwnProperty.call(payload, 'error'))
        fail(context, payload);
}

function getHashFromString(string) {
    return createHash('sha256').update(string).digest('hex');
}

function randomString(length) {
    let result = '';
    let chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
    for (let i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}

export default {
    state,
    getters,
    actions,
    mutations
};