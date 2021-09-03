<template>

    <v-menu
        v-model="menu"
        :close-on-content-click="false"
        transition="slide-x-transition"
        close-delay="1000"
        :open-on-hover="!menu"
    >
        <template v-slot:activator="{ on, attrs }">
            <v-fab-transition>
                <v-btn color="pink" dark fixed bottom left
                       fab v-bind="attrs" v-on="on"
                >
                    <v-icon>mdi-book-open-page-variant-outline</v-icon>
                </v-btn>
            </v-fab-transition>
        </template>

        <v-card tile width="700">
            <v-progress-linear
                :value="progress"
                class="my-0"
                height="3"
            ></v-progress-linear>

            <v-list>
                <v-list-item>
                    <v-select :disabled="isLoading"
                              v-model="selectedChapter"
                              :items="chapters"
                              hide-details hide-selected
                              label="You are reading"
                    ></v-select>
                </v-list-item>
            </v-list>

            <v-list>
                <v-list-item>
                    <v-list-item-icon>
                        <v-btn outlined color="red" small @click="$router.back()" class="mr-3">
                            <v-icon small>mdi-close</v-icon> Close Reader
                        </v-btn>
                    </v-list-item-icon>

                    <v-spacer></v-spacer>
                    <v-list-item-icon>
                        <v-btn icon class="mr-2" title="Scroll to top">
                            <v-icon>mdi-format-vertical-align-top</v-icon>
                        </v-btn>
                    </v-list-item-icon>
                    <v-list-item-icon>
                        <v-btn icon class="mr-10" title="Scroll to bottom">
                            <v-icon>mdi-format-vertical-align-bottom</v-icon>
                        </v-btn>
                    </v-list-item-icon>
                    <v-list-item-icon>
                        <v-btn icon @click.stop="changeReaderWidth(false)">
                            <v-icon>mdi-magnify-minus-outline</v-icon>
                        </v-btn>
                    </v-list-item-icon>

                    <v-list-item-icon>
                        <v-text-field dense hide-details v-text="readerWidthPercent + '%'" class="mx-2"></v-text-field>
                    </v-list-item-icon>
                    <v-list-item-icon>
                        <v-btn icon class="mr-10" @click.stop="changeReaderWidth(true)">
                            <v-icon>mdi-magnify-plus-outline</v-icon>
                        </v-btn>
                    </v-list-item-icon>

                    <v-list-item-icon>
                        <v-btn icon @click.stop="read(previousChapter)" :disabled="isLoading || previousChapter < 0">
                            <v-icon>mdi-rewind</v-icon>
                        </v-btn>
                    </v-list-item-icon>
                    <v-list-item-icon :class="{ 'mr-3': $vuetify.breakpoint.mdAndUp }">
                        <v-btn icon @click.stop="read(nextChapter)" :disabled="isLoading || nextChapter < 0">
                            <v-icon>mdi-fast-forward</v-icon>
                        </v-btn>
                    </v-list-item-icon>
                </v-list-item>
            </v-list>

        </v-card>
    </v-menu>
</template>

<script>
import {mapGetters} from "vuex";

export default {
    name: "NavigationMenu",
    props: ['readerWidthPercent'],
    data: () => ({
        menu: false,
    }),
    methods: {
        read(index) {
            this.$emit('chapterChanged', index);
        },
        changeReaderWidth(increase = true) {
            this.$emit('readerWidthChanged', increase);
        }
    },
    computed: {
        ...mapGetters('series', ['isLoading', 'getCurrentPages', 'getError']),
        ...mapGetters('downloads', ['readersPages']),
        selectedSeries() {
            let index = this.$store.getters['series/localSeries']
                .findIndex(series => series.hash === this.$route.params.seriesHash);
            return index >= 0 ? this.$store.getters['series/localSeries'][index] : this.$store.getters['series/selectedSeries'];
        },
        chapters() {
            return this.selectedSeries.chapters ?
                this.selectedSeries.chapters.map((chapter, index) => ({ text: chapter.title, value: index})) :
                [{text: 'No chapter'}]
        },
        selectedChapter: {
            get() {
                return this.selectedSeries.reading ? this.selectedSeries.reading : 0;
            },
            set(index) {
                this.read(index);
            }
        },
        nextChapter() {
            return this.selectedChapter > 0 ? this.selectedChapter - 1 : -1
        },
        previousChapter() {
            return this.selectedChapter < (this.chapters.length - 1) ? this.selectedChapter + 1 : -1
        },
        progress() {
            return this.selectedSeries.chapters ?
                Math.round(((this.selectedSeries.chapters.length - 1 - this.selectedSeries.reading) / (this.selectedSeries.chapters.length - 1)) * 100) :
                0;
        }
    },
}
</script>

<style scoped>

</style>