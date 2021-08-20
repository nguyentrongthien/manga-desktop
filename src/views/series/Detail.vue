<template>
    <v-container class="fill-height py-5" v-resize="onResize">
        <v-row justify="center" class="fill-height">
            <v-col sm="11" cols="12">
                <v-row justify="center" align="start">
                    <v-col sm="4" cols="12">
                        <v-card class="mx-auto fill-height" max-width="400" shaped :loading="isLoading">
                            <v-img max-width="400" contain
                                   :src="selectedSeries.img ? selectedSeries.img : $store.getters['placeholderImg']">
                            </v-img>

                            <v-card-text>
                                <v-row align="center" class="mx-0 my-1">
                                    <v-rating :value="4.5" color="amber"
                                              dense half-increments readonly size="14"
                                    ></v-rating>

                                    <div class="grey--text ml-4">4.5 (413)</div>
                                </v-row>

                                <div class="mt-3 caption">
                                    Author(s): {{ authors }}
                                </div>
                                <div class="mt-3 caption">
                                    Status: {{ selectedSeries.status ? selectedSeries.status : '' }}
                                </div>
                                <div class="mt-3 caption">
                                    Views: {{ selectedSeries.views ? selectedSeries.views : '' }}
                                </div>
                                <div class="mt-3 caption">
                                    Genres: {{ genres }}
                                </div>
                            </v-card-text>
                        </v-card>
                    </v-col>

                    <v-col sm="8" cols="12">

                        <v-card class="mx-auto" outlined color="#000" :loading="isLoading">

                            <v-card-text ref="descriptionBox">

                                <h2 class="pb-4">
                                    {{ selectedSeries.title ? selectedSeries.title : 'No Title' }}
                                </h2>
                                <p class="font-weight-light subtitle-1" style="max-height: 200px; overflow-y: scroll; overflow-x: hidden">
                                    {{ selectedSeries.summary ? selectedSeries.summary : 'No Description' }}
                                </p>
                                <v-row class="mx-0 pt-4">
                                    <v-btn outlined color="grey" @click.stop="$router.back()">
                                        <v-icon>mdi-arrow-left</v-icon> back
                                    </v-btn>
                                    <v-spacer></v-spacer>
                                    <template v-if="selectedSeries.hash">
                                        <v-btn v-if="selectedSeries.isSaved" icon class="mx-2" color="green"
                                               title="Update For New Chapters" :loading="isSeriesBeingProcessed" @click="updateSeries">
                                            <v-icon>mdi-update</v-icon>
                                        </v-btn>
                                        <v-btn v-else icon class="mx-2" color="red"
                                               title="Add to library" :loading="isSaving" @click="saveSeries">
                                            <v-icon>mdi-bookmark-plus-outline</v-icon>
                                        </v-btn>
                                        <v-btn color="red" outlined @click.stop="read(selectedSeries.reading)" :title="currentChapterTitle">
                                            {{ startReadingButton }} <v-icon>mdi-play</v-icon>
                                        </v-btn>
                                        <v-menu transition="slide-y-transition" offset-y left close-on-content-click>

                                            <template v-slot:activator="{ on, attrs }">
                                                <v-btn color="red" icon class="ml-2"
                                                       v-bind="attrs"
                                                       v-on="on">
                                                    <v-icon>mdi-dots-vertical</v-icon>
                                                </v-btn>
                                            </template>

                                            <v-list dense min-width="200">
                                                <v-list-item @click="readFirstChapter">
                                                    <v-list-item-title>Read First Chapter</v-list-item-title>
                                                    <v-list-item-icon>
                                                        <v-icon small>mdi-page-first</v-icon>
                                                    </v-list-item-icon>
                                                </v-list-item>
                                                <v-list-item @click="readLastChapter">
                                                    <v-list-item-title>Read Last Chapter</v-list-item-title>
                                                    <v-list-item-icon>
                                                        <v-icon small>mdi-page-last</v-icon>
                                                    </v-list-item-icon>
                                                </v-list-item>
                                                <!-- TODO: disable or display status while downloading-->
                                                <v-list-item @click="downloadAllChapters">
                                                    <v-list-item-title>Download</v-list-item-title>
                                                    <v-list-item-icon>
                                                        <v-icon small>mdi-download</v-icon>
                                                    </v-list-item-icon>
                                                </v-list-item>
                                            </v-list>
                                        </v-menu>
                                    </template>
                                    <template v-else>
                                        <v-btn icon class="mx-2" color="red"
                                               title="Add to library" disabled>
                                            <v-icon>mdi-bookmark-plus-outline</v-icon>
                                        </v-btn>
                                        <v-btn color="red" outlined disabled>
                                            start reading <v-icon>mdi-play</v-icon>
                                        </v-btn>
                                    </template>
                                </v-row>
                            </v-card-text>

                            <v-divider class="mt-5"></v-divider>

                            <v-virtual-scroll v-if="selectedSeries.chapters"
                                :bench="0"
                                :items="selectedSeries.chapters"
                                :height="chapterBoxHeight"
                                item-height="64"
                            >
                                <template v-slot:default="{ index, item }">
                                    <v-list-item :key="item.hash">
                                        <v-list-item-content>
                                            <v-list-item-title>
                                                <a @click.stop="read(index)">{{ item.name }}</a>
                                            </v-list-item-title>
                                            <v-list-item-subtitle class="mt-1 caption">
                                                {{ item.updated }}
                                            </v-list-item-subtitle>
                                        </v-list-item-content>

                                        <v-spacer></v-spacer>

                                        <v-list-item-action>
                                            <v-btn v-if="!item.isDownloaded || $store.getters['series/isChapterBeingProcessed'](item.hash)"
                                                   icon small color="red" @click.stop="download(item.url)"
                                                :loading="$store.getters['series/isChapterBeingProcessed'](item.hash)">
                                                <v-icon small>mdi-arrow-collapse-down</v-icon>
                                            </v-btn>
                                            <v-icon v-else-if="item.isDownloaded" color="green" small>mdi-check</v-icon>
                                        </v-list-item-action>
                                    </v-list-item>

                                    <v-divider></v-divider>
                                </template>
                            </v-virtual-scroll>

                        </v-card>

                    </v-col>
                </v-row>
            </v-col>
        </v-row>

        <v-snackbar
            v-model="snackbar" multi-line top timeout="3500" @input="clearErrors">
            {{ getError }}

            <template v-slot:action="{ attrs }">
                <v-btn color="red"
                    text v-bind="attrs"
                    @click="snackbar = false"
                >
                    Close
                </v-btn>
            </template>
        </v-snackbar>
    </v-container>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
    name: "Detail",
    data: () => ({
        index: null,
        window: 0,
        descriptionBoxHeight: 0,
        snackbar: false,
    }),
    created() {
        this.index = this.$route.params.index;
    },
    beforeDestroy() {
        this.$store.commit('series/setError', null);
    },
    methods: {
        read(index) {
            this.$store.dispatch('series/requestChapterDetail', index);
            this.$router.push({path: '/reader'})
        },
        readFirstChapter() {
            this.read(this.selectedSeries.chapters.length - 1);
        },
        readLastChapter() {
            this.read(0);
        },
        downloadAllChapters() {
            this.$store.dispatch('series/saveAllChaptersOfCurrentSeriesToLocal');
        },
        download(chapterUrl) {
            this.$store.dispatch('series/saveChapterOfCurrentSeriesToLocal', chapterUrl);
        },
        saveSeries() {
            this.$store.dispatch('series/saveSelectedSeriesToLocal');
        },
        updateSeries() {
            this.$store.dispatch('series/updateSeriesDetail', this.selectedSeries.url);
        },
        onResize () {
            this.window = { x: window.innerWidth, y: window.innerHeight }
            if(this.$refs.descriptionBox)
                this.descriptionBoxHeight = this.$refs.descriptionBox.clientHeight;
        },
        clearErrors() {
            this.$store.commit('series/setError');
        }
    },
    computed: {
        ...mapGetters('series', ['isLoading', 'getError', 'isSaving', 'isDownloadQueueRunning']),
        authors() {
            return this.selectedSeries.authors ? this.selectedSeries.authors.join(', ') : '';
        },
        genres() {
            return this.selectedSeries.genres ? this.selectedSeries.genres.join(', ') : '';
        },
        selectedSeries() {
            let series = this.$store.getters['series/selectedSeries'];
            return series ? series : {};
        },
        chapterBoxHeight() {
            return this.window.y - this.descriptionBoxHeight - 140;
        },
        isSeriesBeingProcessed() {
            return this.$store.getters['series/isSeriesBeingProcessed'](this.selectedSeries.url);
        },
        startReadingButton() {
            return this.selectedSeries.reading === this.selectedSeries.chapters.length - 1 ? 'start reading' : 'continue reading';
        },
        currentChapterTitle() {
            return this.selectedSeries.chapters[this.selectedSeries.reading].title;
        }
    },
    watch: {
        getError(val) {
            if(val) this.snackbar = true;
        }
    }
}
</script>

<style scoped>

</style>