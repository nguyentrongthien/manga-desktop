<template>
    <v-menu
        v-model="menu"
        close-on-content-click
        transition="slide-y-transition"
        bottom nudge-bottom="40"
    >
        <template v-slot:activator="{ on, attrs }">
            <v-btn dark icon v-bind="attrs" v-on="on">
                <v-badge v-if="notificationCount" :content="notificationCount.toString()" overlap color="red">
                    <v-icon>mdi-bell-outline</v-icon>
                </v-badge>
                <v-icon v-else>mdi-bell-outline</v-icon>
            </v-btn>
        </template>

        <v-card width="500">
            <v-list class="pa-0">
                <v-list-item>
                    <v-list-item-content>
                        <v-list-item-title class="subtitle-1">Download List</v-list-item-title>
                    </v-list-item-content>

                </v-list-item>
            </v-list>

            <v-divider></v-divider>

            <v-list class="py-0" v-if="downloadQueue.length">
                <v-list-item>
                    <v-list-item-content class="pb-0">
                        <v-list-item-subtitle><b>Downloading: </b>{{ downloadQueue[0].name }}</v-list-item-subtitle>
                    </v-list-item-content>
                </v-list-item>
                <v-list-item>
                    <v-list-item-content class="pt-0">
                        <v-progress-linear :value="downloadQueue[0].progress"></v-progress-linear>
                    </v-list-item-content>
                    <v-list-item-action class="mt-0 ml-1">
                        <span class="caption">{{ downloadQueue[0].totalProgress }}</span>
                    </v-list-item-action>
                </v-list-item>
            </v-list>
            <v-list class="py-0" v-else>
                <v-list-item>
                    <v-list-item-content>
                        <v-list-item-subtitle>No item in download queue</v-list-item-subtitle>
                    </v-list-item-content>
                </v-list-item>
            </v-list>

            <v-divider></v-divider>

            <v-list class="pa-0">
                <v-list-item>
                    <v-list-item-content>
                        <v-list-item-title class="subtitle-1">New Updates</v-list-item-title>
                    </v-list-item-content>

                </v-list-item>
            </v-list>

            <v-divider></v-divider>
            <v-list class="py-0" v-if="newUpdates.length" >
                <v-list-item v-for="(item, index) in newUpdates" :key="'newUpdate' + index" @click="view(item.url)">
                    <v-list-item-content>
                        <v-list-item-subtitle>
                            {{ item.title }} <br> {{ item.newChapters }} new chapters
                        </v-list-item-subtitle>
                    </v-list-item-content>
                </v-list-item>
            </v-list>
            <v-list class="py-0" v-else>
                <v-list-item>
                    <v-list-item-content>
                        <v-list-item-subtitle>No new update</v-list-item-subtitle>
                    </v-list-item-content>
                </v-list-item>
            </v-list>

        </v-card>
    </v-menu>
</template>

<script>
import {mapGetters} from "vuex";

export default {
    name: "Notification",
    data: () => ({
        menu: false,
        downloading: false,
    }),
    methods: {
        openMenu() {
            this.menu = true;
            this.downloading = true;
        },
        setDownloading(val = true) {
            this.downloading = val;
        },
        view(seriesUrl) {
            this.$store.dispatch('series/requestSeriesDetail', seriesUrl);
            this.$store.commit('series/removeSeriesFromNewUpdates', seriesUrl)
            if(this.$route.path !== '/series/detail') this.$router.push({path: '/series/detail'})
        },
    },
    computed: {
        ...mapGetters('downloads', ['getCurrentItem', 'getQueue']),
        downloadQueue() {
            if(this.getCurrentItem) {
                if(!this.downloading) this.openMenu();
                return [{
                        name: this.getCurrentItem.name,
                        // progress: item.currentTotal === 0 ? 0 : Math.ceil((item.currentLoaded/item.currentTotal) * 100),
                        progress: Math.ceil((this.getCurrentItem.downloadedFiles.length/this.getCurrentItem.urls.length) * 100),
                        totalProgress: this.getCurrentItem.downloadedFiles.length + '/' + this.getCurrentItem.urls.length,
                        hash: this.getCurrentItem.hash
                }];
            } else {
                this.setDownloading(false);
                return []
            }
        },
        queueCount() {
            return this.getQueue.filter(item => !item.completed).length;
        },
        newUpdates() {
            let newUpdateHashes = this.$store.getters['series/getNewUpdates'].filter(item => item.newChapters > 0);
            return newUpdateHashes.map(item => {
                let series = this.$store.getters['series/localSeries'].filter(series => item.hash === series.hash)[0];
                return {
                    title: series.title,
                    url: series.url,
                    ...item,
                }
            })
        },
        notificationCount() {
            return this.downloadQueue.length + this.newUpdates.length;
        }
    }
}
</script>

<style scoped>

</style>