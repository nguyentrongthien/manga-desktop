<template>
    <v-container class="fill-height py-10">
        <v-row justify="center">
            <v-col cols="12">
                <v-row justify="center" align="center">
                    <v-col class="text-center" cols="12">
                        <h1>Library</h1>
                        <v-btn @click.stop="updateSeries" outlined small color="green"
                               :loading="!!isUpdating">
                            <v-icon small class="mr-1">mdi-sync</v-icon> update</v-btn>
                        <h3 v-show="isLoading || isScanning">Loading...</h3>
                    </v-col>
                </v-row>


                <v-row v-show="!series.length" justify="center" align="stretch">
                    <v-col cols="12" class="text-center">
                        <p>There's nothing here!</p>
                    </v-col>
                </v-row>

                <v-row justify="center" align="stretch">
                    <v-col xl="3" md="6" cols="12" class="my-6" v-for="(comic, index) in series" :key="index">

                        <v-card class="mx-auto fill-height" max-width="400" @click.stop="view(comic.url)">
                            <v-img height="500" :src="comic.img" class="white--text align-end"
                                   gradient="to bottom, rgba(0,0,0,0), rgba(0,0,0,.9)">
                                <v-chip v-if="!!seriesHasNewChapter(comic.url)" color="red" small class="new-chapters-chip">
                                    {{ seriesHasNewChapter(comic.url) }} new chapter(s)
                                </v-chip>
                                <v-expand-transition>
                                    <div
                                        v-if="isSeriesBeingProcessed(comic.url)"
                                        class="d-flex transition-fast-in-fast-out v-card--reveal text-h2 white--text"
                                        style="height: 100%;background: rgba(255,0,0,0.63)"
                                    >
                                        Updating...
                                    </div>
                                </v-expand-transition>
                                <v-card-title class="py-2">{{ comic.title }}</v-card-title>
                            </v-img>


                            <v-card-text>

                                <div class="mb-1 caption">
                                    <b class="white--text">Reading:</b> [{{ comic.currentChapter }}]
                                </div>

                                <div class="grey--text">
                                    {{ comic.url }}
                                </div>

                            </v-card-text>

                        </v-card>
                    </v-col>
                </v-row>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import {mapGetters} from "vuex";

export default {
    name: "Library",
    methods: {
        view(seriesUrl) {
            this.$store.dispatch('series/requestSeriesDetail', seriesUrl);
            this.$store.commit('series/removeSeriesFromNewUpdates', seriesUrl)
            this.$router.push({path: '/series/detail'})
        },
        updateSeries() {
            this.$store.dispatch('series/updateAllLocalSeries');
        },
        isSeriesBeingProcessed(seriesUrl) {
            return this.$store.getters['series/isSeriesBeingProcessed'](seriesUrl);
        },
        seriesHasNewChapter(seriesUrl) {
            return this.$store.getters['series/seriesHasNewChapter'](seriesUrl);
        },
    },
    beforeMount() {
        this.$store.dispatch('series/init');
    },
    computed: {
        ...mapGetters('series', ['isLoading', 'isScanning', 'isUpdating']),
        series() {
            return this.$store.getters['series/localSeries'].map(series => ({
                ...series,
                currentChapter: series.chapters[series.reading].title,
                latestChapter: series.chapters[0].title
            }));
        },
    }
}
</script>

<style scoped>
    .v-card--reveal {
        align-items: center;
        bottom: 0;
        justify-content: center;
        opacity: .5;
        position: absolute;
        width: 100%;
    }
    .new-chapters-chip {
        position: absolute;
        top: 10px;
        right: 10px;
    }
</style>