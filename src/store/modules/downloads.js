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
                            context.commit('updateCurrentItem', {key: 'currentIndex', value: index + 1});
                            requestItemDownload(context, {flag: 'downloads/runDownloadQueue'})
                        } else { // We finish the last url of the current queue item
                            // TODO: Implement post-process stuffs (e.g write data file, etc...)
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

                            // TODO: Start the next item in queue
                            context.dispatch('startQueue').then();
                        }
                    } else if (payload.result.total) {
                        context.commit('updateCurrentItem', {key: 'currentTotal', value: payload.result.total});
                        context.commit('updateCurrentItem', {key: 'currentLoaded', value: payload.result.loaded});
                    }
                }, () => {
                    console.log(payload);
                }
            );
    },
    runReadersQueue : (context, payload) => {
        if(!payload) {
            requestReadersQueueDownload(context);
        } else if(payload.passThrough.rnd === context.state.currentReadersHash) // Hash comparison is to make sure the result is of the same batch
            handleReply(context, payload,
                () => {
                    if(payload.result.downloaded) {
                        context.state.readersQueue[payload.passThrough.index].localPath =
                            payload.result.downloaded + '?rnd=' + payload.passThrough.rnd;
                        console.log(context.state.readersQueue[payload.passThrough.index].localPath);
                    } else if (payload.result.total) {
                        context.state.readersQueue[payload.passThrough.index].total = payload.result.total;
                        context.state.readersQueue[payload.passThrough.index].loaded = payload.result.loaded;
                    }
                }, () => {
                    context.state.readersQueue[payload.passThrough.index].error = true;
                    console.log(payload);
                }
            );
    }
};

function requestReadersQueueDownload(context) {
    let rnd = randomString(20);
    context.commit('setCurrentReadersHash', rnd)
    context.state.readersQueue.forEach((item, index) => {
        if(!item.localPath)
            window.ipcRenderer.send('download-request', {
                url: context.state.readersQueue[index].url,
                fileName: index.toString().padStart(5, '0'),
                targetLocation: context.rootGetters['getCache'],
                referer: context.state.readersQueue[index].url,
                passThrough: { flag: 'downloads/runReadersQueue', index: index, rnd: rnd },
            });
    })
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