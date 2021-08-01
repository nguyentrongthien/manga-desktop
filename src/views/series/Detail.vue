<template>
    <v-container class="fill-height py-5">
        <v-row justify="center" class="fill-height">
            <v-col sm="11" cols="12">
                <v-row v-if="isLoading">Loading....</v-row>
                <v-row v-else-if="getError" justify="center">
                    <v-col cols="12">
                        <h2 class="text-center red--text">
                            {{ getError }}
                        </h2>
                    </v-col>
                    <v-col class="shrink">
                        <v-btn outlined color="grey" @click.stop="$router.back()">
                            <v-icon>mdi-arrow-left</v-icon> back
                        </v-btn>
                    </v-col>

                </v-row>
                <v-row v-else justify="center" align="start">
                    <v-col sm="4" cols="12">
                        <v-card class="mx-auto fill-height" max-width="400" shaped>
                            <v-img max-width="400" contain :src="selectedSeries.img"></v-img>

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
                                    Status: {{ selectedSeries.status }}
                                </div>
                                <div class="mt-3 caption">
                                    Views: {{ selectedSeries.views }}
                                </div>
                                <div class="mt-3 caption">
                                    Genres: {{ genres }}
                                </div>
                            </v-card-text>
                        </v-card>
                    </v-col>

                    <v-col sm="8" cols="12">

                        <v-card class="mx-auto" outlined color="#000">

                            <v-card-text>

                                <h2>
                                    {{ selectedSeries.title }}
                                </h2>
                                <p class="font-weight-light subtitle-1 py-4">
                                    {{ selectedSeries.summary }}
                                </p>
                                <v-row class="mx-0">
                                    <v-btn outlined color="grey" @click.stop="$router.back()">
                                        <v-icon>mdi-arrow-left</v-icon> back
                                    </v-btn>
                                    <v-spacer></v-spacer>
                                    <v-btn icon class="mx-2"><v-icon>mdi-share</v-icon></v-btn>
                                    <v-btn v-if="getSeriesFromLocalByHash(selectedSeries.hash)"
                                           icon class="mx-2" color="green">
                                        <v-icon>mdi-bookmark-check-outline</v-icon>
                                    </v-btn>
                                    <v-btn v-else icon class="mx-2" color="red"
                                           title="Add to library" :loading="isSaving" @click="saveSeries">
                                        <v-icon>mdi-bookmark-plus-outline</v-icon>
                                    </v-btn>
                                    <v-btn color="red" outlined>
                                        start reading <v-icon>mdi-play</v-icon>
                                    </v-btn>
                                </v-row>
                            </v-card-text>

                            <v-divider class="mt-10"></v-divider>
                            <v-simple-table>
                                <template v-slot:default>
                                    <thead>
                                    <tr>
                                        <th class="text-left">
                                            Chapters
                                        </th>
                                        <th class="text-left" style="max-width: 60px;">
                                            Updated
                                        </th>
                                        <th class="text-right" style="max-width: 20px;"></th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    <tr v-for="(item, index) in selectedSeries.chapters"
                                        :key="item.name"
                                    >
                                        <td>
                                            <a @click.stop="read(index)">{{ item.name }}</a>
                                        </td>
                                        <td style="width: 160px;">{{ item.updated }}</td>
                                        <td style="width: 20px;">
                                            <v-icon v-if="item.isDownloaded" color="green" small>mdi-check</v-icon>
                                            <v-btn v-else icon small color="red" @click.stop="download(item.url)" :disabled="isSaving">
                                                <v-icon small>mdi-arrow-collapse-down</v-icon>
                                            </v-btn>
                                        </td>
                                    </tr>
                                    </tbody>
                                </template>
                            </v-simple-table>
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
    methods: {
        read(index) {
            this.$store.dispatch('series/requestChapter', index);
            this.$router.push({path: '/reader'})
        },
        download() {

        },
        saveSeries() {
            this.$store.dispatch('series/saveSelectedSeriesToDisk');
        }
    },
    computed: {
        ...mapGetters('series', ['isLoading', 'selectedSeries', 'getError', 'getSeriesFromLocalByHash', 'isSaving']),
        authors() {
            return this.selectedSeries.authors.join(', ');
        },
        genres() {
            return this.selectedSeries.genres.join(', ');
        }
    }
}
</script>

<style scoped>

</style>