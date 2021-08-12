import {createHash} from "crypto";

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
    selectedSeries : state => state.selectedSeries,
    localSeries : state => state.localSeries,
    webSeries : state => state.webSeries,
    isSeriesBeingProcessed : state => urlOrHash => {
        if(urlOrHash.includes('/')) urlOrHash = getHashFromString(urlOrHash);
        let index = state.processingSeries.findIndex(hash => hash === urlOrHash);
        return index < 0;
    },
    isChapterBeingProcessed : state => urlOrHash => {
        if(urlOrHash.includes('/')) urlOrHash = getHashFromString(urlOrHash);
        let index = state.processingChapters.findIndex(hash => hash === urlOrHash);
        return index >= 0;
    },
    getCurrentPages : state => state.pages,
    getError : state => state.error,
    isDownloadQueueRunning : state => state.downloadQueueRunning,
}

const mutations = {
    setScanning : (state, isScanning = true) => {state.scanning = isScanning;},
    setLoading : (state, isLoading = true) => {state.loading = isLoading;},
    setSaving : (state, isSaving = true) => {state.saving = isSaving;},
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
        let hash = getHashFromString(url);
        if(state.processingChapters.findIndex(item => item === hash) < 0)
            state.processingChapters.push(hash);
    },
    removeChapterFromProcessingList : (state, url) => {
        let index = state.processingChapters.findIndex(item => item === getHashFromString(url));
        if(index >= 0) state.processingChapters.splice(index, 1);
    },
    setSeriesInProcessingList : (state, url) => {
        let hash = getHashFromString(url);
        if(state.processingSeries.findIndex(item => item === hash) < 0)
            state.processingSeries.push(hash);
    },
    removeSeriesFromProcessingList : (state, url) => {
        let index = state.processingSeries.findIndex(item => item === getHashFromString(url));
        if(index >= 0) state.processingSeries.splice(index, 1);
    },
    setCachedImages : (state, images) => {
        let rnd = randomString(10);
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
    setDownloadQueueRunning : (state, running = true) => { state.downloadQueueRunning = running; }
}

const actions = {
    init : (context) => {
        context.commit('setScanning');
        window.ipcRenderer.send('from-renderer', {
            fn: 'scanDir',
            payload: {path: context.rootGetters['getDirectory'], fileName: seriesDataFileName},
            passThrough: {flag: 'series/initComplete'}
        });
    },
    initComplete : (context, payload) => {
        handleReply(context, payload,
            () => {
                context.commit('removeAllSeriesFromLocalList');
                payload.result.forEach(series => {context.commit('addSeriesToLocalList', series);});
                context.commit('setScanning', false);
            }, () => {context.commit('setError', payload.error);context.commit('setScanning', false);}
        )
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
                getHashFromString(url) + '/' + seriesDataFileName,
            passThrough: {flag: 'series/receiveSeriesDetail', url: url, hash: getHashFromString(url)}
        });
    },
    receiveSeriesDetail : (context, payload) => {
        handleReply(context, payload,
            () => {
                context.commit('setSelectedSeries', payload.result);
                context.dispatch('checkForLocalChaptersOfSelectedSeries').then();
            }, () => {
                if(payload.error.includes('no such file or directory') &&
                    payload.error.includes(payload.passThrough.hash)) { // This means series isn't available locally
                    window.ipcRenderer.send('from-renderer', { // Request it from the remote host
                        fn: 'viewSeries', payload: payload.passThrough.url, passThrough: {flag: 'series/receiveSeriesDetail'}
                    });
                } else context.commit('setError', payload.error);
            }
        );
        context.commit('setLoading', false);
    },
    requestChapterDetail : (context, index) => { // Requesting chapter's details of the currently selected series
        context.commit('setLoading');
        context.commit('setError');
        context.commit('setSelectedSeriesCurrentChapter', index);

        if(context.getters['selectedSeries'].isSaved)
            writeSelectedSeriesLocalData(context);

        let selectedChapter = context.getters['selectedSeries'].chapters[index];
        context.commit('setChapterInProcessingList', selectedChapter.url);
        if(context.getters['selectedSeries'].isSaved && selectedChapter.isDownloaded) {
            // the series is saved and chapter is downloaded, we attempt to load chapter from local
            window.ipcRenderer.send('from-renderer', {
                fn: 'readData', payload: context.rootGetters['getDirectory'] + '/' +
                    getHashFromString(context.getters['selectedSeries'].url) + '/' +
                    getHashFromString(selectedChapter.url) + '/' + chapterDataFileName,
                passThrough: {flag: 'series/receiveChapterDetail', url: selectedChapter.url, hash: selectedChapter.hash,
                    updateCachedImages: true}
            });
        } else { // Otherwise, we request it to cache directory
            window.ipcRenderer.send('from-renderer', {
                fn: 'viewChapter',
                payload: {
                    url: selectedChapter.url,
                    outputPath: context.rootGetters['getCache']
                },
                passThrough: {flag: 'series/receiveChapterDetail', url: selectedChapter.url,
                    updateCachedImages: true}
            });

        }
    },
    receiveChapterDetail : (context, payload) => {
        handleReply(context, payload,
            () => {
                context.commit('removeChapterFromProcessingList', payload.passThrough.url);
                if(payload.passThrough.updateCachedImages) {
                    // context.commit('setImagesOfCurrentChapter', payload.result.imageUrls)
                    context.commit('setCachedImages', payload.result.localImages)
                }

                if(payload.passThrough.writeDataFile) // writeDataFile flag is set, write chapter data to local
                    window.ipcRenderer.send('from-renderer', {
                        fn: 'writeData',
                        payload: {
                            path: payload.passThrough.chapterFilePath,
                            file: '/' + chapterDataFileName,
                            data: payload.result,
                        },
                    });

                if(payload.passThrough.startNextDownload) { // Passthroughs from downloadChaptersToLocalSequentially()
                    context.dispatch('downloadChaptersToLocalSequentially').then()
                    if(getHashFromString(context.getters['selectedSeries'].url) === getHashFromString(payload.passThrough.parentUrl)) {
                        context.state.selectedSeries.chapters[payload.passThrough.chapterIndex].isDownloaded = true;
                    }
                }
            }, () => {
                // This error was caused by attempting to load chapter after isDownloaded flag was checked.
                // Likely corrupted or missing data file, we re-download the chapter and rewrite data file.
                if(payload.error.includes('no such file or directory') &&
                    payload.error.includes(payload.passThrough.hash)) {
                    window.ipcRenderer.send('from-renderer', {
                        fn: 'viewChapter',
                        payload: {
                            url: payload.passThrough.url,
                            outputPath: context.rootGetters['getDirectory'] + '/' +
                                getHashFromString(context.getters['selectedSeries'].url) + '/' + payload.passThrough.hash
                        },
                        passThrough: {
                            flag: 'series/receiveChapterDetail',
                            chapterFilePath: context.rootGetters['getDirectory'] + '/' +
                                getHashFromString(context.getters['selectedSeries'].url) + '/' + payload.passThrough.hash,
                            writeDataFile: true,
                            updateCachedImages: true,
                            url: payload.passThrough.url
                        }
                    });
                } else context.commit('setError', payload.error);
            }
        );
        context.commit('setLoading', false);
    },
    saveSelectedSeriesToLocal : (context, payload) => {
        context.commit('setSaving');
        if(!payload) { // First we download the cover image
            window.ipcRenderer.send('from-renderer', {
                fn: 'downloadFile',
                payload: {
                    url: context.getters['selectedSeries'].img,
                    fileName: 'cover',
                    outputPath: context.rootGetters['getDirectory'] + '/' + context.getters['selectedSeries'].hash,
                },
                passThrough: {
                    flag: 'series/saveSelectedSeriesToLocal',
                    hash: context.getters['selectedSeries'].hash,
                    coverDownloaded: true
                }
            });
        } else { // Then we write the series data to local
            if(payload.passThrough.coverDownloaded)
                handleReply(context, payload,
                    () => {
                        if(payload.passThrough.hash === context.getters['selectedSeries'].hash) {
                            context.state.selectedSeries.isSaved = true;
                            context.state.selectedSeries.img = payload.result; // local path to cover image
                            context.commit('addSeriesToLocalList', context.state.selectedSeries);
                            writeSelectedSeriesLocalData(context);
                        }
                    }, () => {context.commit('setError', payload.error);}
                );
            context.commit('setSaving', false);
        }
    },
    saveChapterOfCurrentSeriesToLocal : (context, chapterUrl) => {
        let index = context.getters['selectedSeries'].chapters
            .findIndex(chapter => chapter.hash === getHashFromString(chapterUrl))
        let selectedChapter = context.getters['selectedSeries'].chapters[index];

        if(!context.getters['selectedSeries'].isSaved) context.dispatch('saveSelectedSeriesToLocal').then();

        selectedChapter.isDownloaded = true;

        context.commit('setChapterInProcessingList', selectedChapter.url);
        window.ipcRenderer.send('from-renderer', {
            fn: 'viewChapter',
            payload: {
                url: selectedChapter.url,
                outputPath: context.rootGetters['getDirectory'] + '/' +
                    getHashFromString(context.getters['selectedSeries'].url) + '/' + selectedChapter.hash
            },
            passThrough: {
                flag: 'series/receiveChapterDetail',
                chapterFilePath: context.rootGetters['getDirectory'] + '/' +
                    getHashFromString(context.getters['selectedSeries'].url) + '/' + selectedChapter.hash,
                writeDataFile: true,
                url: selectedChapter.url
            }
        });
    },
    saveAllChaptersOfCurrentSeriesToLocal : context => {
        if(!context.getters['selectedSeries'].isSaved) context.dispatch('saveSelectedSeriesToLocal').then();
        for (let [index, chapter] of context.getters['selectedSeries'].chapters.entries()) {
            context.commit('pushChapterToDownloadQueue', {
                chapterIndex: index,
                chapterUrl: chapter.url,
                parentUrl: context.getters['selectedSeries'].url
            })
            context.commit('setChapterInProcessingList', chapter.url);
        }
        context.commit('setDownloadQueueRunning');
        context.dispatch('downloadChaptersToLocalSequentially').then();
    },
    checkForLocalChaptersOfSelectedSeries : (context, payload) => {
        if(!payload) {
            if(context.getters['selectedSeries'].isSaved) // If series if from local, check for series within its dir
                for (let [index, chapter] of context.getters['selectedSeries'].chapters.entries()) {
                    window.ipcRenderer.send('from-renderer', {
                        fn: 'readData', payload: context.rootGetters['getDirectory'] + '/' +
                            getHashFromString(context.getters['selectedSeries'].url) + '/' +
                            chapter.hash + '/' + chapterDataFileName,
                        passThrough: {

                            flag: 'series/checkForLocalChaptersOfSelectedSeries', url: chapter.url, index: index
                        }
                    });
                    context.commit('setChapterInProcessingList', chapter.url);
                }
        } else {
            handleReply(context, payload,
                () => {
                    context.getters['selectedSeries'].chapters[payload.passThrough.index].isDownloaded = true;
                }, () => { /* Error here just means that the chapter was not downloaded, no need to handle the error*/}
            );
            context.commit('removeChapterFromProcessingList', payload.passThrough.url);
        }
    },
    downloadChaptersToLocalSequentially : (context) => {
        if(context.state.downloadQueue.length > 0) { // pop a chapter and download it
            let item = context.state.downloadQueue[0];
            window.ipcRenderer.send('from-renderer', {
                fn: 'viewChapter',
                payload: {
                    url: item.chapterUrl,
                    outputPath: context.rootGetters['getDirectory'] + '/' +
                        getHashFromString(item.parentUrl) + '/' + getHashFromString(item.chapterUrl)
                },
                passThrough: {
                    flag: 'series/receiveChapterDetail',
                    chapterFilePath: context.rootGetters['getDirectory'] + '/' +
                        getHashFromString(item.parentUrl) + '/' + getHashFromString(item.chapterUrl),
                    writeDataFile: true,
                    url: item.chapterUrl,
                    startNextDownload: true,
                    parentUrl: item.parentUrl,
                    chapterIndex: item.chapterIndex,
                }
            });
            context.commit('popChapterFromDownloadQueue', 0);
        } else {
            context.commit('setDownloadQueueRunning', false);
        }
    }
}

function writeSelectedSeriesLocalData(context, passThrough) {
    window.ipcRenderer.send('from-renderer', {
        fn: 'writeData',
        payload: {
            path: context.rootGetters['getDirectory'] + '/' + context.getters['selectedSeries'].hash,
            file: '/' + seriesDataFileName,
            data: context.getters['selectedSeries'],
        },
        passThrough: passThrough
    });
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