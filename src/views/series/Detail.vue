<template>
    <v-container class="fill-height py-5">
        <v-row justify="center" class="fill-height">
            <v-col sm="11" cols="12">
                <v-row v-if="getError" justify="center">
                    <v-col cols="12">
                        <h2 class="text-center red--text">
                            {{ getError }}
                        </h2>
                    </v-col>

                </v-row>
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

                            <v-card-text>

                                <h2>
                                    {{ selectedSeries.title ? selectedSeries.title : 'No Title' }}
                                </h2>
                                <p class="font-weight-light subtitle-1 py-4">
                                    {{ selectedSeries.summary ? selectedSeries.summary : 'No Description' }}
                                </p>
                                <v-row class="mx-0">
                                    <v-btn outlined color="grey" @click.stop="$router.back()">
                                        <v-icon>mdi-arrow-left</v-icon> back
                                    </v-btn>
                                    <v-spacer></v-spacer>
                                    <template v-if="selectedSeries.hash">
                                        <v-btn v-if="selectedSeries.isSaved"
                                               icon class="mx-2" color="green">
                                            <v-icon>mdi-bookmark-check-outline</v-icon>
                                        </v-btn>
                                        <v-btn v-else icon class="mx-2" color="red"
                                               title="Add to library" :loading="isSaving" @click="saveSeries">
                                            <v-icon>mdi-bookmark-plus-outline</v-icon>
                                        </v-btn>
                                        <v-btn color="red" outlined @click.stop="readFirstChapter">
                                            start reading <v-icon>mdi-play</v-icon>
                                        </v-btn>
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

                            <v-divider class="mt-10"></v-divider>

                            <v-virtual-scroll v-if="selectedSeries.chapters"
                                :bench="0"
                                :items="selectedSeries.chapters"
                                height="600"
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
    </v-container>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
    name: "Detail",
    data: () => ({
        index: null,
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
        download(chapterUrl) {
            this.$store.dispatch('series/saveChapterOfCurrentSeriesToLocal', chapterUrl);
        },
        saveSeries() {
            this.$store.dispatch('series/saveSelectedSeriesToLocal');
        }
    },
    computed: {
        ...mapGetters('series', ['isLoading', 'getError', 'isSaving']),
        authors() {
            return this.selectedSeries.authors ? this.selectedSeries.authors.join(', ') : '';
        },
        genres() {
            return this.selectedSeries.genres ? this.selectedSeries.genres.join(', ') : '';
        },
        selectedSeries() {
            let series = this.$store.getters['series/selectedSeries'];
            return series ? series : {};
        }
    }
}
</script>

<style scoped>

</style>