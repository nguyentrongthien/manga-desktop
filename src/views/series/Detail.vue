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
<!--                            <v-toolbar flat>-->
<!--                                <v-btn-->
<!--                                    icon-->
<!--                                    class="hidden-xs-only"-->
<!--                                >-->
<!--                                    <v-icon>mdi-arrow-left</v-icon>-->
<!--                                </v-btn>-->
<!--                                <v-toolbar-title class="grey&#45;&#45;text">-->

<!--                                </v-toolbar-title>-->

<!--                                <v-spacer></v-spacer>-->
<!--                                <v-btn icon>-->
<!--                                    <v-icon>mdi-heart</v-icon>-->
<!--                                </v-btn>-->

<!--                                <v-btn icon>-->
<!--                                    <v-icon>mdi-dots-vertical</v-icon>-->
<!--                                </v-btn>-->
<!--                            </v-toolbar>-->

<!--                            <v-divider></v-divider>-->


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
                                    <v-btn icon class="mx-2"><v-icon>mdi-heart</v-icon></v-btn>
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
                                        <th class="text-left">
                                            Updated
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    <tr
                                        v-for="item in selectedSeries.chapters"
                                        :key="item.name"
                                        @click.stop="read"
                                    >
                                        <td>{{ item.name }}</td>
                                        <td>{{ item.updated }}</td>
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
        read() {

        }
    },
    computed: {
        ...mapGetters('series', ['isLoading', 'selectedSeries', 'getError']),
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