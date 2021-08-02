<template>
    <v-container class="fill-height py-5">
        <v-row justify="center">
            <v-card flat class="text-center" min-height="100" width="640" @click.stop="sheet = !sheet">

                <div>
                    <img v-for="(image, index) in getCurrentPages" :key="'image' + index" width="100%" :src="image" :alt="image" />
                </div>

                <v-fade-transition>
                    <v-overlay v-if="isLoading"
                        absolute color="#000"
                    >
                        <v-progress-circular indeterminate size="64"></v-progress-circular>
                    </v-overlay>
                </v-fade-transition>
            </v-card>
        </v-row>

        <v-bottom-sheet inset v-model="sheet">

            <v-card tile>
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
                            <v-btn icon>
                                <v-icon>mdi-magnify-minus-outline</v-icon>
                            </v-btn>
                        </v-list-item-icon>

                        <v-list-item-icon>
                            <v-text-field dense hide-details v-text="'100%'" class="mx-2"></v-text-field>
                        </v-list-item-icon>
                        <v-list-item-icon>
                            <v-btn icon class="mr-10">
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
        </v-bottom-sheet>
    </v-container>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
    name: "Main",
    data: () => ({
        drawer: null,
        sheet: false,
    }),
    mounted() {
        this.drawer = this.$store.getters['drawer'];
        this.$store.commit('setDrawer', false);
        window.addEventListener('keydown', this.fireArrowKeyEvent, true);
    },
    beforeDestroy() {
        this.$store.commit('setDrawer', this.drawer);
        window.removeEventListener('ke', this.fireArrowKeyEvent, true);
        this.$store.commit('series/setError', null);
    },
    methods: {
        read(index) {
            if(index >= 0 && index < this.chapters.length) {
                this.scrollToTop();
                this.$store.dispatch('series/requestChapter', index);
            }
        },
        scrollToTop() {
            this.$vuetify.goTo(0, {
                duration: 1000,
                easing: 'easeOutQuad',
            })
        },
        fireArrowKeyEvent(event) {
            if (event.code === 'ArrowLeft' && !this.isLoading)
                this.read(this.previousChapter);
            else if (event.code === 'ArrowRight' && !this.isLoading)
                this.read(this.nextChapter);
        }
    },
    computed: {
        ...mapGetters('series', ['isLoading', 'getCurrentPages', 'getError']),
        selectedSeries() {
            return this.$store.getters['series/selectedSeries'](true);
        },
        chapters() {
            return this.selectedSeries.chapters ?
                this.selectedSeries.chapters.map((chapter, index) => ({ text: chapter.title, value: index})) :
                [{text: 'No chapter'}]
        },
        currentChapter() {
            return this.selectedSeries.chapters ? this.selectedSeries.chapters[this.selectedSeries.reading] : {};
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