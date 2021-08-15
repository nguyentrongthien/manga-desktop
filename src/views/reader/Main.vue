<template>
    <v-container class="fill-height py-5" fluid>
<!--        <div class="load-indicator">-->
<!--            <v-container class="fill-height ma-0 pa-0" fluid>-->
<!--                <v-row class="fill-height ma-0 pa-0" justify="center" align="stretch" style="background: transparent">-->
<!--                    <v-col v-for="(page, index) in readersPages" :key="'indicator' + index" :style="calcLoadIndicatorStyle(page.loaded, page.total)"-->
<!--                           cols="12" :class="index === 0 ? 'my-1 d-flex' : 'mb-1 d-flex'">-->
<!--                        <div style="align-items: center" class="d-flex caption">-->
<!--                            {{index + 1}}-->
<!--                        </div>-->
<!--                    </v-col>-->
<!--                </v-row>-->
<!--            </v-container>-->
<!--        </div>-->
        <v-row justify="center">
            <v-card flat class="text-center" width="640" @click.stop="sheet = !sheet" style="background: rgba(0,0,0,0)">

                <transition-group name="fade" mode="out-in">
                    <v-progress-linear :key="'progress'" :value="loadingProgress" height="25" :color="loadingProgress < 100 ? 'green' : 'black'">
                        <template v-slot:default="{ value }">
                            {{ value === 100 ? chapterTitle : 'Loading... ' + value + '%'}}
                        </template>
                    </v-progress-linear>
                    <div v-for="(page, index) in readersPages" :key="'image' + index">
                        <div v-if="page.error">Error with {{page.url}}</div>
                        <img v-else-if="loadingProgress >= 100" class="img-page" width="100%" :src="page.localPath" :alt="page.localPath" />
                    </div>
                </transition-group>

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
        this.$store.commit('setReader');
        window.addEventListener('keydown', this.fireArrowKeyEvent, true);
    },
    beforeDestroy() {
        this.$store.commit('setDrawer', this.drawer);
        this.$store.commit('setReader', false);
        window.removeEventListener('keydown', this.fireArrowKeyEvent, true);
        this.$store.commit('series/setError', null);
    },
    methods: {
        read(index) {
            if(index >= 0 && index < this.chapters.length && this.loadingProgress >= 100) {
                this.scrollToTop();
                this.$store.commit('downloads/clearReadersQueue');
                this.$store.dispatch('series/requestChapterDetail', index);
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
        },
        calculateProgress(loaded, total) {
            return total ? Math.ceil((loaded/total) * 100) : 0;
        },
        calcLoadIndicatorStyle(loaded, total) {
            let perc = total ? Math.ceil((loaded/total) * 100) : 0;
            return 'background: linear-gradient(to left, #000, #000 0%, #6b6b6b ' + perc + '%, #000 0%);'
        }
    },
    computed: {
        ...mapGetters('series', ['isLoading', 'getCurrentPages', 'getError']),
        ...mapGetters('downloads', ['readersPages']),
        selectedSeries() {
            let series = this.$store.getters['series/selectedSeries'];
            return series ? series : {};
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
        },
        loadingProgress() {
            let total = this.readersPages.length;
            let loaded = this.readersPages.filter(item => item.localPath).length
            return total ? Math.ceil((loaded/total) * 100) : 0;
        },
        chapterTitle() {
            return this.$store.getters['series/selectedSeries'].chapters[this.selectedChapter].title;
        }
    },
}
</script>

<style scoped>
    .img-page { /* Weird fix for the gap between img elements */
        float: left;
    }
    .load-indicator {
        height: 100%;
        position: fixed;
        top: 0;
        right: 0;
        width: 50px;
    }
    .indicator {
        display: flex;
    }
    .temp {
        background: linear-gradient(to left, #000, #000 0%, #6b6b6b 75%, #000 0%);
    }
</style>