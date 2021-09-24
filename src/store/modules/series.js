import { codes } from "../../errors";
import helper from "../../extensions/helper";
import Vue from "vue";
const path = require('path');

const seriesDataFileName = '.md_series';
const chapterDataFileName = '.md_chapter';

const state = {
    series: [],
    localSeries: [], // Locally saved series
    webSeries: [], // Currently loaded series
    pages: [], // Currently loaded pages of a single chapter
    scanning: false,
    loading: false,
    saving: false,
    updating: 0,
    selected: { // A single selected series either from local or current
        data: null,
        from: 'current',
        hash: null,
    },
    error: null,
    processingSeries: [],
    processingChapters: [],
    selectedSeries: {},
    downloadQueue: [],
    downloadQueueRunning: false,
};

const getters = {
    isScanning : state => state.scanning,
    isLoading : state => state.loading,
    isSaving : state => state.saving,
    isUpdating : state => state.updating,
    selectedSeries : state => state.selectedSeries,
    localSeries : state => state.localSeries,
    webSeries : state => state.webSeries,
    isSeriesBeingProcessed : state => urlOrHash => {
        if(urlOrHash.includes('/')) urlOrHash = helper.getHashFromString(urlOrHash);
        let index = state.processingSeries.findIndex(hash => hash === urlOrHash);
        return index >= 0;
    },
    isChapterBeingProcessed : state => urlOrHash => {
        if(urlOrHash.includes('/')) urlOrHash = helper.getHashFromString(urlOrHash);
        let index = state.processingChapters.findIndex(hash => hash === urlOrHash);
        return index >= 0;
    },
    getCurrentPages : state => state.pages,
    getError : state => state.error,
    isDownloadQueueRunning : state => state.downloadQueueRunning,
    seriesHasNewChapter : state => urlOrHash => {
        if(urlOrHash.includes('/')) urlOrHash = helper.getHashFromString(urlOrHash);
        let index = state.localSeries.findIndex(item => item.hash === urlOrHash);
        return index >= 0 ? (state.localSeries[index].newChapters ? state.localSeries[index].newChapters : 0) : 0;
    },
}

const mutations = {
    setScanning : (state, isScanning = true) => {state.scanning = isScanning},
    setLoading : (state, isLoading = true) => {state.loading = isLoading},
    setSaving : (state, isSaving = true) => {state.saving = isSaving},
    incrementUpdating : state => {state.updating += 1},
    decrementUpdating : state => {state.updating -= 1},
    setWebSeries : (state, webSeries) => {
        state.webSeries.splice(0);
        webSeries.forEach(series => {
            state.webSeries.push(series);
        })
    },
    addSeriesToLocalList : (state, newSeries) => {
        let index = state.localSeries.findIndex(series => series.hash.toString() === newSeries.hash.toString());
        if(index < 0) state.localSeries.push(newSeries);
        else state.localSeries[index] = newSeries;
    },
    removeAllSeriesFromLocalList : state => {state.localSeries.splice(0);},
    setSelectedSeries : (state, seriesData) => {state.selectedSeries = seriesData;},
    setSelectedSeriesCurrentChapter : (state, index) => {state.selectedSeries.reading = index;},
    setChapterInProcessingList : (state, url) => {
        let hash = helper.getHashFromString(url);
        if(state.processingChapters.findIndex(item => item === hash) < 0)
            state.processingChapters.push(hash);
    },
    removeChapterFromProcessingList : (state, url) => {
        let index = state.processingChapters.findIndex(item => item === helper.getHashFromString(url));
        if(index >= 0) state.processingChapters.splice(index, 1);
    },
    setSeriesInProcessingList : (state, url) => {
        let hash = helper.getHashFromString(url);
        if(state.processingSeries.findIndex(item => item === hash) < 0)
            state.processingSeries.push(hash);
    },
    removeSeriesFromProcessingList : (state, url) => {
        let index = state.processingSeries.findIndex(item => item === helper.getHashFromString(url));
        if(index >= 0) state.processingSeries.splice(index, 1);
    },
    setCachedImages : (state, images) => {
        let rnd = helper.randomString(10);
        state.pages.splice(0);
        state.pages = images.map(file => file + '?rnd=' + rnd);
    },
    setError : (state, error = null) => {state.error = error;},
    pushChapterToDownloadQueue : (state, payload) => {
        state.downloadQueue.push(payload);
    },
    popChapterFromDownloadQueue : (state, index) => {
        state.downloadQueue.splice(index, 1);
    },
    setDownloadQueueRunning : (state, running = true) => { state.downloadQueueRunning = running; },
}

const actions = {
    init : (context) => {
        if(context.rootGetters['getDirectory']) {
            context.commit('setScanning');
            window.ipcRenderer.send('from-renderer', {
                fn: 'scanDir',
                payload: {path: context.rootGetters['getDirectory'], fileName: seriesDataFileName},
                passThrough: {flag: 'series/initComplete'}
            });
        }
    },
    initComplete : (context, payload) => {
        handleReply(context, payload,
            () => {
                context.commit('removeAllSeriesFromLocalList');
                payload.result.forEach(series => {context.commit('addSeriesToLocalList', series);});
            }, () => {context.commit('setError', payload.error);}
        )
        context.commit('setScanning', false);
    },
    receiveSeries : (context, payload) => {
        handleReply(context, payload,
            () => {
                context.commit('setWebSeries', payload.result);
            }, () => {context.commit('setError', payload.error);}
        );
        context.commit('setLoading', false);
    },
    requestSeriesDetail : (context, url) => {
        context.commit('setLoading');
        context.commit('setError');

        // Attempt to load series data from local file
        window.ipcRenderer.send('from-renderer', {
            fn: 'readData', payload: context.rootGetters['getDirectory'] + '/' +
                helper.getHashFromString(url) + '/' + seriesDataFileName,
            passThrough: {flag: 'series/receiveSeriesDetail', url: url, hash: helper.getHashFromString(url)}
        });
    },
    receiveSeriesDetail : (context, payload) => {
        handleReply(context, payload,
            () => {
                context.commit('setSelectedSeries', payload.result);
                context.dispatch('checkForLocalChaptersOfSelectedSeries').then();
                _setSeriesNewChaptersToZero(context, payload.result.hash);
                context.commit('setLoading', false);
            }, () => {
                if(payload.error.includes(codes.FileNotFoundException)) { // This means series isn't available locally
                    console.log('requesting from source')
                    context.commit('setSelectedSeries', {});
                    context.commit('setLoading');
                    window.ipcRenderer.send('from-renderer', { // Request it from the remote host
                        fn: 'viewSeries', payload: payload.passThrough.url, passThrough: {flag: 'series/receiveSeriesDetail'}
                    });
                } else {
                    context.commit('setError', payload.error);
                    context.commit('setLoading', false);
                }
            }
        );
    },
    updateAllLocalSeries : (context) => {
        context.state.localSeries.forEach(series => {
            _updateSeriesDetails(context, series.url, 'series/updateSeriesDetail');
        })
    },
    updateSeriesDetail : (context, payload) => {
        _updateSeriesDetails(context, payload, 'series/updateSeriesDetail');
    },
    requestChapterDetail : (context, payload) => { // payload = {index, hash}
        context.commit('setError');

        let series = _getSeriesByHash(context, payload.hash);

        series.reading = payload.index;

        if(series.isSaved) _writeSeriesLocalData(context, series.hash, series);

        let selectedChapter = series.chapters[payload.index];

        if(series.isSaved && selectedChapter.isDownloaded) {
            // the series is saved and chapter is downloaded, we attempt to load chapter from local
            window.ipcRenderer.send('from-renderer', {
                fn: 'readData', payload: context.rootGetters['getDirectory'] + '/' +
                    series.hash + '/' + helper.getHashFromString(selectedChapter.url) + '/' + chapterDataFileName,
                passThrough: {flag: 'series/receiveChapterDetail', chapterUrl: selectedChapter.url, hash: selectedChapter.hash}
            });
        } else { // Otherwise, we request it to cache directory
            if(!context.rootGetters['getCache']) return;
            _requestChapterImagesUrlsForReaderCache(context, selectedChapter, payload.index, 'series/receiveChapterDetail')
        }
    },
    receiveChapterDetail : (context, payload) => {
        handleReply(context, payload,
            () => {
                if(payload.result.imageUrls && payload.result.imageUrls.length)
                    context.commit('downloads/populateReadersQueue', payload.result.localImages.map((item, index) => ({
                            url: payload.result.imageUrls[index],
                            localPath: path.join(context.rootGetters['getDirectory'], item)
                        })), {root : true})
                else {
                    context.commit('downloads/populateReadersQueue',
                        payload.result.map((item) => ({url: item, localPath: null})), {root : true})
                }
                context.dispatch('downloads/runReadersQueue', null, {root: true}).then();
            }, () => { context.commit('setError', payload.error); }
        );
    },
    saveSelectedSeriesToLocal : (context, payload) => {
        if(!context.rootGetters['getDirectory']) return;
        context.commit('setSaving');
        if(!payload) { // First we download the cover image
            window.ipcRenderer.send('download-request', {
                url: context.getters['selectedSeries'].img,
                fileName: 'cover',
                targetLocation: context.rootGetters['getDirectory'] + '/' + context.getters['selectedSeries'].hash,
                referer: context.rootGetters['getDirectory'] + '/' + context.getters['selectedSeries'].hash,
                passThrough: {
                    flag: 'series/saveSelectedSeriesToLocal',
                    hash: context.getters['selectedSeries'].hash,
                    coverDownloaded: true
                },
            });
        } else { // Then we write the series data to local
            if(payload.passThrough.coverDownloaded)
                handleReply(context, payload,
                    () => {
                        if(payload.passThrough.hash === context.getters['selectedSeries'].hash) {
                            context.state.selectedSeries.isSaved = true;
                            context.state.selectedSeries.img = payload.result.downloaded; // local path to cover image
                            context.commit('addSeriesToLocalList', context.state.selectedSeries);
                            writeSelectedSeriesLocalData(context);
                        }
                    }, () => {context.commit('setError', payload.error);}
                );
            context.commit('setSaving', false);
        }
    },
    saveChapterOfCurrentSeriesToLocal : (context, chapterUrl) => {
        if(!context.rootGetters['getDirectory']) return;
        let index = context.getters['selectedSeries'].chapters
            .findIndex(chapter => chapter.hash === helper.getHashFromString(chapterUrl))
        let chapter = context.getters['selectedSeries'].chapters[index];

        if(!context.getters['selectedSeries'].isSaved) context.dispatch('saveSelectedSeriesToLocal').then();

        _requestChapterImagesUrlsToSaveToLocal(context, chapter, index);
    },
    saveAllChaptersOfCurrentSeriesToLocal : (context, forceReDownload = false) => {
        if(!context.rootGetters['getDirectory']) return;
        if(!context.getters['selectedSeries'].isSaved) context.dispatch('saveSelectedSeriesToLocal').then();
        for (let [index, chapter] of context.getters['selectedSeries'].chapters.entries()) {
            if(!chapter.isDownloaded || forceReDownload)
                _requestChapterImagesUrlsToSaveToLocal(context, chapter, index);
        }
    },
    receiveChapterImageUrls : (context, payload) => {
        handleReply(context, payload,
            () => { // We construct a push download queue object into downloads module
                context.dispatch('downloads/downloadMultiple', {
                    urls: payload.result,
                    hash: payload.passThrough.chapterHash,
                    outputPath: payload.passThrough.outputPath,
                    name: payload.passThrough.chapterTitle,
                    passThrough: payload.passThrough
                }, {root:true}).then();
                context.dispatch('downloads/startQueue', null, {root:true}).then();
            }, () => {
                context.commit('setError', payload.error);
                context.commit('removeChapterFromProcessingList', payload.passThrough.chapterUrl);
            }
        );
    },
    completeSavingChapterImages : (context, payload) => {
        context.commit('removeChapterFromProcessingList', payload.passThrough.chapterUrl);
        let series = _getSeriesByHash(context, helper.getHashFromString(payload.passThrough.parentUrl))
        series.chapters[payload.passThrough.chapterIndex].isDownloaded = true;

        payload.result.localImages = payload.result.localImages.map(item => path.join(
            helper.getHashFromString(payload.passThrough.parentUrl),
            helper.getHashFromString(payload.passThrough.chapterUrl),
            path.basename(item)
        ))

        window.ipcRenderer.send('from-renderer', { fn: 'writeData',
            payload: {path: payload.passThrough.outputPath, file: '/' + chapterDataFileName,
                data: payload.result
        } });
    },
    checkForLocalChaptersOfSelectedSeries : (context, payload) => {
        if(!payload) {
            let series = _getSelectedSeries(context);
            if(series.isSaved) // If series if from local, check for series within its dir
                for (let [index, chapter] of series.chapters.entries()) {
                    window.ipcRenderer.send('from-renderer', {
                        fn: 'readData', payload: context.rootGetters['getDirectory'] + '/' +
                            helper.getHashFromString(series.url) + '/' +
                            chapter.hash + '/' + chapterDataFileName,
                        passThrough: {
                            flag: 'series/checkForLocalChaptersOfSelectedSeries', seriesHash: series.hash, url: chapter.url, index: index
                        }
                    });
                    context.commit('setChapterInProcessingList', chapter.url);
                }
        } else {
            let series = _getSeriesByHash(context, payload.passThrough.seriesHash)
            handleReply(context, payload,
                () => {
                    series.chapters[payload.passThrough.index].isDownloaded = true;
                }, () => {
                    series.chapters[payload.passThrough.index].isDownloaded = false;
                }
            );
            context.commit('removeChapterFromProcessingList', payload.passThrough.url);
        }
    },
    addSeriesToCollection : (context, payload) => { // payload = {seriesHashes, collections}
        context.state.localSeries.filter(series => payload.seriesHashes.includes(series.hash)).forEach(series => {
            Vue.set(series, 'collectionNames', payload.collections);
            _writeSeriesLocalData(context, series.hash, series);
        });
    }
}

function _setSeriesNewChaptersToZero(context, urlOrHash) {
    if(urlOrHash.includes('/')) urlOrHash = helper.getHashFromString(urlOrHash);
    let index = context.state.localSeries.findIndex(series => series.hash === urlOrHash);
    if(index >= 0) {
        context.state.localSeries[index].newChapters = 0;
        _writeSeriesLocalData(context, urlOrHash, context.state.localSeries[index]);
    }
}

function _requestChapterImagesUrls(context, chapterUrl, passThrough) { // Request urls of pages of a chapter
    window.ipcRenderer.send('from-renderer', {
        fn: 'getChapterImageUrl', payload: {url: chapterUrl}, passThrough: passThrough
    });
}

function _requestChapterImagesUrlsToSaveToLocal(context, chapter, index) {
    context.commit('setChapterInProcessingList', chapter.url);
    _requestChapterImagesUrls(context, chapter.url, {
        flag: 'series/receiveChapterImageUrls',
        chapterIndex: index,
        chapterUrl: chapter.url,
        chapterHash: chapter.hash,
        chapterTitle: chapter.title,
        parentUrl: context.getters['selectedSeries'].url,
        outputPath: context.rootGetters['getDirectory'] + '/' +
            helper.getHashFromString(context.getters['selectedSeries'].url) + '/' + helper.getHashFromString(chapter.url),
        postProcessor: 'series/completeSavingChapterImages'
    });
}

function _requestChapterImagesUrlsForReaderCache(context, chapter, index, flag) {
    _requestChapterImagesUrls(context, chapter.url, {
        flag: flag,
        chapterIndex: index,
        chapterUrl: chapter.url,
        chapterHash: chapter.hash,
        chapterTitle: chapter.title,
        parentUrl: context.getters['selectedSeries'].url,
        postProcessor: 'series/completeSavingChapterImages'
    });

}

function _updateSeriesDetails(context, payload, flag) {
    context.commit('setError');
    if(!payload.result && !payload.error) { // expecting payload to be the url
        window.ipcRenderer.send('from-renderer', { // Request it from the remote host
            fn: 'viewSeries', payload: payload, passThrough: {flag: flag, url: payload}
        });
        context.commit('setSeriesInProcessingList', payload);
        context.commit('incrementUpdating');
    } else { // expecting payload.result to be the series data
        handleReply(context, payload,
            () => {
                let index = context.state.localSeries.findIndex(item => item.hash === payload.result.hash);
                if(index >= 0) {
                    let localSeries = context.state.localSeries[index];

                    //TODO: Persist additional information
                    payload.result.reading = context.state.localSeries[index].reading;
                    payload.result.collectionNames = context.state.localSeries[index].collectionNames;
                    payload.result.isSaved = true;

                    if(context.getters['selectedSeries'].hash === payload.result.hash) {
                        context.commit('setSelectedSeries', payload.result);
                        context.dispatch('checkForLocalChaptersOfSelectedSeries').then();
                    } else {
                        let prevNewChapters = localSeries.newChapters ? localSeries.newChapters : 0;
                        payload.result.newChapters = prevNewChapters +
                            payload.result.chapters.length - localSeries.chapters.length;
                    }
                    context.state.localSeries.splice(index, 1, payload.result);
                    _writeSeriesLocalData(context, payload.result.hash, payload.result);
                }
            }, () => {context.commit('setError', payload.error);}
        );
        context.commit('removeSeriesFromProcessingList', payload.passThrough.url);
        context.commit('decrementUpdating');
    }
}

function _getSeriesByHash(context, hash) {
    let index = context.getters['localSeries']
        .findIndex(series => series.hash === hash);
    return index >= 0 ? context.getters['localSeries'][index] : context.getters['selectedSeries'];
}

function _getSelectedSeries(context) {
    return _getSeriesByHash(context, context.getters['selectedSeries'].hash);
}

function _writeSeriesLocalData(context, seriesHash, data, passThrough) {
    window.ipcRenderer.send('from-renderer', {
        fn: 'writeData',
        payload: {
            path: context.rootGetters['getDirectory'] + '/' + seriesHash,
            file: '/' + seriesDataFileName,
            data: data,
        },
        passThrough: passThrough
    });
}

function writeSelectedSeriesLocalData(context, passThrough) {
    _writeSeriesLocalData(context, context.getters['selectedSeries'].hash,
        context.getters['selectedSeries'], passThrough);
}

function handleReply(context, payload, succeed, fail) {
    if (payload.hasOwnProperty.call(payload, 'result'))
        succeed(context, payload);
    else if (payload.hasOwnProperty.call(payload, 'error'))
        fail(context, payload);
}

export default {
    state,
    getters,
    actions,
    mutations
};