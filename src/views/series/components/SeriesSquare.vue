<template>
    <v-card class="mx-auto fill-height" max-width="400">
        <v-img height="500" :src="comic.img" class="white--text align-end" @click.stop="view(comic.url, comic.hash)"
               gradient="to bottom, rgba(0,0,0,0), rgba(0,0,0,.9)" v-ripple style="cursor: pointer">
            <v-chip v-if="!!seriesHasNewChapter(comic.url)" color="red" small class="new-chapters-chip">
                {{ seriesHasNewChapter(comic.url) }} new chapter(s)
            </v-chip>
            <v-expand-transition>
                <div
                    v-if="isSeriesBeingProcessed(comic.url)"
                    class="d-flex transition-fast-in-fast-out v-card--reveal text-h2 white--text"
                    style="height: 100%;background: rgba(0,0,0,0.63)"
                >
                    Updating...
                </div>
            </v-expand-transition>
            <v-card-title class="py-2">{{ comic.title }}</v-card-title>
        </v-img>

        <v-card-actions>

            <div class="mx-2 grey--text caption">
                {{ comic.url }}
            </div>

            <v-spacer></v-spacer>
            <v-menu top left>
                <template v-slot:activator="{ on, attrs }">
                    <v-btn dark icon v-bind="attrs" v-on="on">
                        <v-icon>mdi-dots-vertical</v-icon>
                    </v-btn>
                </template>

                <v-list dense>
                    <v-list-item>
                        <v-list-item-title>View</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="viewOriginal(comic.url)">
                        <v-list-item-title>View Original</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="deleteSeries(comic.url)">
                        <v-list-item-title class="red--text">Delete</v-list-item-title>
                    </v-list-item>
                </v-list>
            </v-menu>
        </v-card-actions>
    </v-card>
</template>

<script>
export default {
    name: "SeriesSquare",
    props: ['comic'],
    methods: {
        view(seriesUrl, hash) {
            this.$store.dispatch('series/requestSeriesDetail', seriesUrl);
            this.$router.push({path: '/series/detail/' + hash})
        },
        viewOriginal(url) {
            this.$store.commit('setWebViewUrl', url);
        },
        deleteSeries() {

        },
        isSeriesBeingProcessed(seriesUrl) {
            return this.$store.getters['series/isSeriesBeingProcessed'](seriesUrl);
        },
        seriesHasNewChapter(seriesUrl) {
            return this.$store.getters['series/seriesHasNewChapter'](seriesUrl);
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