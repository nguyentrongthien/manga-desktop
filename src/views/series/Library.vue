<template>
    <v-container class="fill-height py-10">
        <v-row justify="center">
            <v-col cols="12">
                <v-row justify="center" align="center">
                    <v-col class="text-center" cols="12">
                        <h1>Library</h1>
                        <h3 v-show="isLoading || isScanning">Loading...</h3>
                    </v-col>
                </v-row>

                <v-row justify="center" align="stretch">
                    <v-col xl="3" md="6" cols="12" class="my-6" v-for="(comic, index) in series" :key="index">

                        <v-card class="mx-auto fill-height" max-width="400" @click.stop="view(comic.url)">
                            <v-img height="500" :src="comic.img" class="white--text align-end"
                                   gradient="to bottom, rgba(0,0,0,0), rgba(0,0,0,.9)">
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
            this.$router.push({path: '/series/detail'})
        }
    },
    beforeMount() {
        this.$store.dispatch('series/init');
    },
    computed: {
        ...mapGetters('series', ['isLoading', 'isScanning']),
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

</style>