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
            :close-on-content-click="false"
            transition="slide-y-transition"
            bottom nudge-bottom="50"
        >
            <template v-slot:activator="{ on, attrs }">
                <v-btn dark icon v-bind="attrs" v-on="on">
                    <v-badge :content="downloadQueue.length.toString()" overlap>
                    <v-icon>mdi-download</v-icon>
                    </v-badge>
                </v-btn>
            </template>

            <v-card width="500">
                <v-list class="pa-0">
                    <v-list-item>
                        <v-list-item-content>
                            <v-list-item-title class="subtitle-1">Download List</v-list-item-title>
                        </v-list-item-content>

                    </v-list-item>
                </v-list>

                <transition-group name="fade" mode="out-in">
                    <template v-for="(item) in downloadQueue">
                        <v-divider :key="'divider-' + item.hash"></v-divider>
                        <v-list class="py-0" :key="'item' + item.hash">
                            <v-list-item>
                                <v-list-item-content class="pb-0">
                                    <v-list-item-subtitle>{{ item.name }}</v-list-item-subtitle>
                                </v-list-item-content>
                                <v-list-item-content class="pb-0">
                                    <v-list-item-subtitle>{{ item.totalProgress }}</v-list-item-subtitle>
                                </v-list-item-content>
                            </v-list-item>
                            <v-list-item>
                                <v-list-item-content class="pt-0">
                                    <v-progress-linear :value="item.progress"></v-progress-linear>
                                </v-list-item-content>
                                <v-list-item-action class="mt-0 ml-0">
                                    <v-btn x-small icon color="red">
                                        <v-icon>mdi-close</v-icon>
                                    </v-btn>
                                </v-list-item-action>
                            </v-list-item>
                        </v-list>
                    </template>
                </transition-group>

                <v-divider></v-divider>
                <v-list class="py-0">
                    <v-list-item>
                        <v-list-item-content class="pb-0">
                            <v-list-item-subtitle>A very very long title that nothing should be able to contain it</v-list-item-subtitle>
                        </v-list-item-content>
                    </v-list-item>
                    <v-list-item>
                        <v-list-item-content class="pt-0">
                            <v-progress-linear value="70"></v-progress-linear>
                        </v-list-item-content>
                        <v-list-item-action class="mt-0 ml-1">
                            <span class="caption">0/0</span>
                        </v-list-item-action>
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
    }),
    mounted() {

    },
    methods: {
        openDownloads() {
            this.menu = true;
        }
    },
    computed: {
        ...mapGetters(['isReading']),
        ...mapGetters('downloads', ['getCurrentItem']),
        drawer: {
            get() {
                return this.$store.getters['drawer'];
            },
            set(value) {
                this.$store.commit('setDrawer', value);
            }
        },
        downloadQueue() {
            if(this.getCurrentItem) this.openDownloads();
            return this.getCurrentItem ? [
                {
                    name: this.getCurrentItem.name,
                    // progress: item.currentTotal === 0 ? 0 : Math.ceil((item.currentLoaded/item.currentTotal) * 100),
                    progress: Math.ceil((this.getCurrentItem.downloadedFiles.length/this.getCurrentItem.urls.length) * 100),
                    totalProgress: this.getCurrentItem.downloadedFiles.length + '/' + this.getCurrentItem.urls.length,
                    hash: this.getCurrentItem.hash
                }
            ] : [];
        }

    }
}
</script>

<style scoped>

</style>