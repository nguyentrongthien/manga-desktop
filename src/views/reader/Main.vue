<template>
    <v-container class="fill-height py-5" fluid>
        <LoadIndicator />
        <v-row justify="center">
            <v-card flat class="text-center" width="640" style="background: rgba(0,0,0,0)">
                <div class="click-zone-left" v-ripple @click="read(previousChapter)"></div>
                <div class="click-zone-right" v-ripple @click="read(nextChapter)"></div>

                <transition-group name="fade" mode="out-in">
                    <v-progress-linear :key="'progress'" :value="loadingProgress" height="25" :color="loadingProgress < 100 ? 'green' : 'black'">
                        <template v-slot:default="{ value }">
                            {{ value === 100 ? chapterTitle : 'Loading... ' + value + '%'}}
                        </template>
                    </v-progress-linear>
                    <div v-for="(page, index) in readersPages" :key="'image' + index">

                        <div v-if="page.error" :id="'image' + index">Error with {{page.url}}</div>
                        <img v-else-if="page.localPath" class="img-page" :id="'image' + index"
                             width="100%" :src="page.localPath" :alt="page.localPath" />
                    </div>
                </transition-group>

            </v-card>
        </v-row>

        <NavigationMenu @chapterChanged="read" />
    </v-container>
</template>


<script>
import { mapGetters } from 'vuex';
import LoadIndicator from "./components/LoadIndicator";
import NavigationMenu from "./components/NavigationMenu";

export default {
    name: "Main",
    components: {LoadIndicator, NavigationMenu},
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
    .click-zone-left {
        position: absolute;
        /*background: rgba(186,108,108,0.54);*/
        width: 50%;
        height: 100%;
        left: 0;
        cursor: pointer;
    }
    .click-zone-right {
        position: absolute;
        /*background: rgba(116,186,108,0.54);*/
        width: 50%;
        height: 100%;
        right: 0;
        cursor: pointer;
    }
</style>