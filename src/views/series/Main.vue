<template>
    <v-container class="fill-height py-10">
        <v-row justify="center">
            <v-col cols="12">
                <v-row justify="center" align="center">
                    <v-col class="text-center" cols="12">
                        <h1>Manga Series (Page #{{pageNumber}})</h1>
                    </v-col>
                </v-row>
                <v-row v-if="getError" justify="center">
                    <v-col cols="12">
                        <h2 class="text-center red--text">
                            {{ getError }}
                        </h2>
                    </v-col>

                </v-row>

                <v-row v-if="series.length" justify="center" align="stretch">
                    <v-col xl="3" md="4" sm="6" cols="12" class="my-6" v-for="(comic, index) in series" :key="index">

                        <v-card class="mx-auto fill-height" max-width="400" @click.stop="view(comic.url, comic.hash)">
                            <v-img height="370" :src="comic.img" class="white--text align-end"
                                   :gradient="isSeriesInLocal(comic.url) ? 'to bottom, rgba(0,0,0,.6), rgba(0,0,0,1)' : 'to bottom, rgba(0,0,0,0), rgba(0,0,0,.7)'">
                                <v-chip v-if="isSeriesInLocal(comic.url)" color="blue" small class="in-library-chip">
                                    In Library
                                </v-chip>
                                <v-card-title class="py-2">{{ comic.title }}</v-card-title>
                            </v-img>

                            <v-card-text>
                                <v-row align="center" class="mx-0">
                                    <v-rating :value="4.5" color="amber"
                                              dense half-increments readonly size="14"
                                    ></v-rating>
                                    <div class="grey--text ml-4">4.5 (413)</div>

                                    <v-spacer></v-spacer>

                                </v-row>

                                <div class="mt-4 subtitle-1">
                                    {{ comic.latestChapter }}
                                </div>

                                <div class="mb-4 caption grey--text lighten-3">
                                    Views: {{ comic.views }}
                                </div>
                                <div class="grey--text">
                                    {{ comic.url }}
                                </div>

                            </v-card-text>

                        </v-card>
                    </v-col>
                </v-row>

                <v-row v-else justify="center" align="stretch">
                    No Series to show
                </v-row>
            </v-col>
        </v-row>
        <filter-menu />
    </v-container>
</template>

<script>
import { mapGetters } from 'vuex';
import FilterMenu from "./components/FilterMenu";

export default {
    name: "Main",
    components: { FilterMenu },
    data: () => ({
        search_term: '',
    }),
    beforeDestroy() {
        this.$store.commit('series/setError', null);
    },
    methods: {
        view(seriesUrl, hash) {
            this.$store.dispatch('series/requestSeriesDetail', seriesUrl);
            this.$router.push({path: '/series/detail/' + hash})
        },
        search() {
            if(this.search_term) this.$store.dispatch('extensions/search', this.search_term);
            else this.$store.dispatch('extensions/browse');
        },
        changePage(pageNumber) {
            this.$store.dispatch('extensions/changePage', pageNumber);
        },
        isSeriesInLocal(url) {
            return this.$store.getters['series/localSeries'].findIndex(item => item.url === url) >= 0;
        }
    },
    computed: {
        ...mapGetters('series', ['isLoading', 'getError']),
        ...mapGetters('extensions', ['pageNumber']),
        series() {
            return this.$store.getters['series/webSeries'];
        },
    }
}
</script>

<style scoped>
    .in-library-chip {
        position: absolute;
        top: 10px;
        right: 10px;
    }
</style>