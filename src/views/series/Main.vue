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

                <v-row justify="center" align="stretch" class="mx-3">
                    <v-col class="shrink">
                        <v-btn :disabled="pageNumber <= 1 || isLoading" outlined
                               @click.stop="changePage(pageNumber - 1)">
                            <v-icon>mdi-chevron-left</v-icon> Previous</v-btn>
                    </v-col>
                    <v-col xl="4" cols="6" tag="form" @submit.prevent="search">
                        <v-text-field placeholder="Search manga..." single-line v-model="search_term" @click:append="search"
                                      append-icon="mdi-magnify" hide-details clearable :loading="isLoading" dense/>
                        <button type="submit" class="d-none"></button>
                    </v-col>
                    <v-col class="shrink">
                        <v-btn :disabled="isLoading" outlined @click.stop="changePage(pageNumber + 1)">
                            Next <v-icon>mdi-chevron-right</v-icon></v-btn>
                    </v-col>
                </v-row>

                <v-row v-if="series.length" justify="center" align="stretch">
                    <v-col xl="3" md="6" cols="12" class="my-6" v-for="(comic, index) in series" :key="index">

                        <v-card class="mx-auto fill-height" max-width="400" @click.stop="view(comic.url)">
                            <v-img height="370" :src="comic.img" class="white--text align-end"
                                   gradient="to bottom, rgba(0,0,0,0), rgba(0,0,0,.7)">
                                <v-card-title class="py-2">{{ comic.title }}</v-card-title>
                            </v-img>


                            <v-card-text>
                                <v-row align="center" class="mx-0">
                                    <v-rating :value="4.5" color="amber"
                                              dense half-increments readonly size="14"
                                    ></v-rating>

                                    <div class="grey--text ml-4">4.5 (413)</div>
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
    </v-container>
</template>

<script>
import { mapGetters } from 'vuex';
export default {
    name: "Main",
    data: () => ({
        search_term: '',
    }),
    beforeDestroy() {
        this.$store.commit('series/setError', null);
    },
    methods: {
        view(seriesUrl) {
            this.$store.dispatch('series/requestSeriesDetail', seriesUrl);
            this.$router.push({path: '/series/detail'})
        },
        search() {
            if(this.search_term) this.$store.dispatch('extensions/search', this.search_term);
            else this.$store.dispatch('extensions/browse');
        },
        changePage(pageNumber) {
            this.$store.dispatch('extensions/changePage', pageNumber);
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

</style>