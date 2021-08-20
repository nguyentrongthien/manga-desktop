<template>
    <v-app-bar app
        clipped-left
        color="grey darken-4"
        :collapse="isReading"
        dense
    >
        <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
        <v-toolbar-title class="mr-12 align-center">
            <span class="title">Manga Desktop</span>
        </v-toolbar-title>
        <v-spacer></v-spacer>

        <v-menu
            v-model="menu"
            :open-on-hover="!pinned"
            :close-on-content-click="false"
            transition="slide-y-transition"
            bottom nudge-bottom="40"
        >
            <template v-slot:activator="{ on, attrs }">
                <v-btn dark icon v-bind="attrs" v-on="on">
                    <v-badge :content="1" overlap color="red">
                        <v-icon>mdi-bell-outline</v-icon>
                    </v-badge>
                </v-btn>
            </template>

            <v-card width="500">
                <v-list class="pa-0">
                    <v-list-item>
                        <v-list-item-content>
                            <v-list-item-title class="subtitle-1">Download List</v-list-item-title>
                        </v-list-item-content>
                        <v-list-item-action>
                            <v-btn icon small @click.stop="pinned = !pinned" :color="!pinned ? 'red' : 'green'">
                                <v-icon small>{{!pinned ? 'mdi-pin-off-outline' : 'mdi-pin-outline'}}</v-icon>
                            </v-btn>
                        </v-list-item-action>

                    </v-list-item>
                </v-list>

                <v-divider></v-divider>
                <v-list class="py-0" v-if="downloadQueue.length">
                    <v-list-item>
                        <v-list-item-content class="pb-0">
                            <v-list-item-subtitle><b>Downloading: </b>{{ downloadQueue[0].name }}</v-list-item-subtitle>
                        </v-list-item-content>
                    </v-list-item>
                    <v-list-item>
                        <v-list-item-content class="pt-0">
                            <v-progress-linear :value="downloadQueue[0].progress"></v-progress-linear>
                        </v-list-item-content>
                        <v-list-item-action class="mt-0 ml-1">
                            <span class="caption">{{ downloadQueue[0].totalProgress }}</span>
                        </v-list-item-action>
                    </v-list-item>
                </v-list>
                <v-list class="py-0" v-else>
                    <v-list-item>
                        <v-list-item-content class="pb-0">
                            <v-list-item-subtitle>No item in download queue</v-list-item-subtitle>
                        </v-list-item-content>
                    </v-list-item>
                </v-list>
            </v-card>
        </v-menu>

    </v-app-bar>
</template>

<script>
import {mapGetters} from "vuex";

export default {
    name: "Appbar",
    data: () => ({
        fav: true,
        menu: false,
        message: false,
        hints: true,
        pinned: true
    }),
    mounted() {

    },
    methods: {
        openMenu() {
            this.menu = true;
        }
    },
    computed: {
        ...mapGetters(['isReading']),
        ...mapGetters('downloads', ['getCurrentItem', 'getQueue']),
        downloadQueue() {
            if(this.pinned) this.openMenu();
            return this.getCurrentItem ? [
                {
                    name: this.getCurrentItem.name,
                    // progress: item.currentTotal === 0 ? 0 : Math.ceil((item.currentLoaded/item.currentTotal) * 100),
                    progress: Math.ceil((this.getCurrentItem.downloadedFiles.length/this.getCurrentItem.urls.length) * 100),
                    totalProgress: this.getCurrentItem.downloadedFiles.length + '/' + this.getCurrentItem.urls.length,
                    hash: this.getCurrentItem.hash
                }
            ] : [];
        },
        queueCount() {
            return this.getQueue.filter(item => !item.completed).length;
        },
        drawer: {
            get() {
                return this.$store.getters['drawer'];
            },
            set(value) {
                this.$store.commit('setDrawer', value);
            }
        },

    }
}
</script>

<style scoped>

</style>