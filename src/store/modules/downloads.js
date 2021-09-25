const state = {
    queue: [],
    readersQueue: [],
    currentReadersHash: null,
    currentHash: null,
};
const getters = {
    getItemByHash : state => hash => {
        let index = state.queue.findIndex(item => item.hash === hash);
        return index < 0 ? null : state.queue[index];
    },
    getCurrentItem : state => {
        let index = state.queue.findIndex(item => item.hash === state.currentHash);
        return index < 0 ? null : state.queue[index];
    },
    getQueue : state => state.queue,
    readersPages : state => state.readersQueue,
};
const mutations = {
    updateItemByHash : (state, payload) => {
        let index = state.queue.findIndex(item => item.hash === payload.hash);
        state.queue[index][payload.key] = payload.value;
    },
    updateCurrentItem : (state, payload) => {
        let index = state.queue.findIndex(item => item.hash === state.currentHash);
        state.queue[index][payload.key] = payload.value;
    },
    pushNewItemToQueue : (state, item) => { state.queue.push(item); },
    setCurrentHash : (state, hash = null) => { state.currentHash = hash; },
    populateReadersQueue : (state, payload) => {
        state.readersQueue.splice(0);
        state.readersQueue = payload.map(item => ({
            url: item.url,
            localPath: item.localPath,
            total: 0,
            loaded: 0,
            error: false,
        }));
    },
    clearReadersQueue : state => { state.readersQueue.splice(0); },
    setCurrentReadersHash : (state, hash = null) => {state.currentReadersHash = hash;},
};
const actions = {
    downloadMultiple : (context, payload) => {
        context.commit('pushNewItemToQueue', {
            ...payload,
            downloadedFiles: [],
            currentIndex: 0,
            currentTotal: 0,
            currentLoaded: 0,
            completed: false,
            errorIndices: [],
        })
    },
    startQueue : context => {
        let index = context.state.currentHash ? -1 : context.state.queue.findIndex(item => !item.completed);
        if(index >= 0) {
            context.commit('setCurrentHash', context.state.queue[index].hash);
            context.dispatch('runDownloadQueue').then();
        }
    },
    runDownloadQueue : (context, payload) => {
        if(!payload) {
            context.commit('updateCurrentItem', {key: 'currentTotal', value: 0});
            context.commit('updateCurrentItem', {key: 'currentLoaded', value: 0});
            requestItemDownload(context, {
                flag: 'downloads/runDownloadQueue'
            })
        } else
            handleReply(context, payload,
                () => {
                    if(payload.result.downloaded) {
                        let index = context.getters['getCurrentItem'].currentIndex;
                        context.getters['getCurrentItem'].downloadedFiles.splice(index, 0, payload.result.downloaded);
                        if(index < (context.getters['getCurrentItem'].urls.length - 1)) {
                            // Start the next download in the queue
                            context.commit('updateCurrentItem', {key: 'currentIndex', value: index + 1});
                            requestItemDownload(context, {flag: 'downloads/runDownloadQueue'})
                        } else { // We finish the last url of the current queue item
                            context.dispatch(context.getters['getCurrentItem'].passThrough.postProcessor,
                                {
                                    result: {
                                        imageUrls: context.getters['getCurrentItem'].urls,
                                        localImages: context.getters['getCurrentItem'].downloadedFiles,
                                    },
                                    passThrough: context.getters['getCurrentItem'].passThrough
                                }, {root: true}).then();
                            context.commit('updateCurrentItem', {key: 'completed', value: true});
                            context.commit('setCurrentHash');

                            context.dispatch('startQueue').then();
                        }
                    } else if (payload.result.total) {
                        context.commit('updateCurrentItem', {key: 'currentTotal', value: payload.result.total});
                        context.commit('updateCurrentItem', {key: 'currentLoaded', value: payload.result.loaded});
                    }
                }, () => {
                    // TODO: retry a failed downloads 10 times
                    let tries = !context.getters['getCurrentItem'].tries ? 0 : context.getters['getCurrentItem'].tries;
                    if(tries < 10) {
                        console.log('Retry #' + (tries + 1) + ' of item #' + context.getters['getCurrentItem'].currentIndex);
                        context.commit('updateCurrentItem', {key: 'tries', value: tries + 1});
                        context.commit('updateCurrentItem', {key: 'currentTotal', value: 0});
                        context.commit('updateCurrentItem', {key: 'currentLoaded', value: 0});
                        requestItemDownload(context, {flag: 'downloads/runDownloadQueue'})
                    } else
                        console.error('Item #' + context.getters['getCurrentItem'].currentIndex + ' failed ' + (tries + 1) + ' times');
                }
            );
    },
    runReadersQueue : (context, payload) => {
        if(!payload) {
            let rnd = randomString(20);
            context.commit('setCurrentReadersHash', rnd)
            context.state.readersQueue.forEach((item, index) => {
                requestReadersQueueItemDownload(context, index, {
                    flag: 'downloads/runReadersQueue', index: index, rnd: rnd, tries: 1
                });
            })
            // requestReadersQueueDownload(context);
        } else if(payload.passThrough.rnd === context.state.currentReadersHash) // Hash comparison is to make sure the result is of the same batch
            handleReply(context, payload,
                () => {
                    if(payload.result.downloaded) {
                        context.state.readersQueue[payload.passThrough.index].localPath =
                            payload.result.downloaded + '?rnd=' + payload.passThrough.rnd;
                    } else if (payload.result.total) {
                        context.state.readersQueue[payload.passThrough.index].total = payload.result.total;
                        context.state.readersQueue[payload.passThrough.index].loaded = payload.result.loaded;
                    }
                }, () => {
                    if(payload.passThrough.tries <= 3) {
                        requestReadersQueueItemDownload(context, payload.passThrough.index, {
                            flag: 'downloads/runReadersQueue', index: payload.passThrough.index,
                            rnd: payload.passThrough.rnd, tries: payload.passThrough.tries + 1
                        });
                    } else
                        context.state.readersQueue[payload.passThrough.index].error = true;
                }
            );
    }
};

function requestReadersQueueItemDownload(context, index, passThrough) {
    if(!context.state.readersQueue[index].localPath) {
        context.state.readersQueue[index].error = false;
        window.ipcRenderer.send('download-request', {
            url: context.state.readersQueue[index].url,
            fileName: index.toString().padStart(5, '0'),
            targetLocation: context.rootGetters['getCache'],
            referer: context.state.readersQueue[index].url,
            passThrough: passThrough,
        });
    }
}



function requestItemDownload(context, passThrough) {
    window.ipcRenderer.send('download-request', {
        url: context.getters['getCurrentItem'].urls[context.getters['getCurrentItem'].currentIndex],
        fileName: context.getters['getCurrentItem'].currentIndex.toString().padStart(5, '0'),
        targetLocation: context.getters['getCurrentItem'].outputPath,
        referer: context.getters['getCurrentItem'].urls[context.getters['getCurrentItem'].currentIndex],
        passThrough: passThrough,
    });
}

function handleReply(context, payload, succeed, fail) {
    if (payload.hasOwnProperty.call(payload, 'result'))
        succeed(context, payload);
    else if (payload.hasOwnProperty.call(payload, 'error'))
        fail(context, payload);
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