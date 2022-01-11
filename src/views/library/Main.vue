<template>
    <v-container class="fill-height py-10">
        <v-row justify="center">
            <v-col cols="12">
                <v-row justify="center" align="center">
                    <v-col class="text-center" cols="12">
                        <h1>{{ title }}</h1>
                        <h3 v-show="isLoading || isScanning">Loading...</h3>
                        <v-btn class="mx-1" outlined small
                               v-if="selectedCollectionName" @click="selectedCollectionName = null">
                            back
                        </v-btn>
                        <v-btn class="mx-1" outlined small
                               v-if="selectedCollectionName" @click="seriesSelectionDialog = true">
                            Add
                        </v-btn>
                    </v-col>
                </v-row>

                <v-row v-show="!series.length" justify="center" align="stretch">
                    <v-col cols="12" class="text-center">
                        <p v-show="(collectionView && selectedCollectionName) || !collectionView">There's nothing here!</p>
                        <template v-if="selectedCollectionName">
                            <p>You can <a @click="selectedCollectionName = null">go back</a> to the Library.</p>
                            <p>Or <a @click="seriesSelectionDialog = true">add comics</a> into this collection</p>
                        </template>
                    </v-col>
                </v-row>

                <v-row justify="center" align="stretch" v-if="!selectedCollectionName && collectionView">
                    <v-col xl="2" md="3" sm="4" cols="6" class="my-2" v-for="(collection, index) in collections" :key="'collection' + index">

                        <v-card
                            class="mx-auto"
                            max-width="344"
                        >
                            <div style="height: 200px;display: flex; justify-content: center;cursor: pointer;"
                                 @click="viewCollection(collection.name)" v-ripple>
                                <v-icon size="150" color="orange">
                                    {{collection.icon}}
                                </v-icon>
                            </div>

                            <v-divider></v-divider>
                            <v-card-actions>

                                <div class="mx-2">{{collection.name}}</div>

                                <v-spacer></v-spacer>
                                <v-menu bottom left>
                                    <template v-slot:activator="{ on, attrs }">
                                        <v-btn dark icon v-bind="attrs" v-on="on">
                                            <v-icon>mdi-dots-vertical</v-icon>
                                        </v-btn>
                                    </template>

                                    <v-list>
                                        <v-list-item>
                                            <v-list-item-title>View</v-list-item-title>
                                        </v-list-item>
                                        <v-list-item>
                                            <v-list-item-title>Hide</v-list-item-title>
                                        </v-list-item>
                                    </v-list>
                                </v-menu>
                            </v-card-actions>

                        </v-card>
                    </v-col>
                </v-row>

                <v-row justify="center" align="stretch">
                    <v-col xl="3" md="4" sm="6" cols="12" class="my-6" v-for="(comic, index) in series" :key="index">
                        <SeriesSquare :comic="comic" />
                    </v-col>
                </v-row>
            </v-col>
        </v-row>

        <v-speed-dial
            v-model="fab" bottom right fixed
            direction="top" open-on-hover
            transition="scale-transition"
        >
            <template v-slot:activator>
                <v-btn v-model="fab" color="blue darken-2" dark fab>
                    <v-icon v-if="fab">
                        mdi-close
                    </v-icon>
                    <v-icon v-else>
                        mdi-menu
                    </v-icon>
                </v-btn>
            </template>
            <v-btn fab dark small color="green" @click="updateSeries" :loading="!!isUpdating">
                <v-icon>mdi-sync</v-icon>
            </v-btn>
            <v-btn fab dark small color="indigo" @click="collectionView = !collectionView">
                <v-icon>{{ !collectionView ? 'mdi-folder-outline' : 'mdi-image-multiple-outline'}}</v-icon>
            </v-btn>
            <v-btn fab dark small color="red">
                <v-icon>mdi-delete</v-icon>
            </v-btn>
            <v-btn fab dark small color="green" @click="seriesURLDialog = !seriesURLDialog">
                <v-icon>mdi-plus</v-icon>
            </v-btn>
        </v-speed-dial>

        <SeriesSelectionDialog v-model="seriesSelectionDialog" :series="selectableSeries" @selectionDone="addSeriesToCollection" />
        <SeriesURLDialog v-model="seriesURLDialog" />
    </v-container>
</template>

<script>
import {mapGetters} from "vuex";
import SeriesSelectionDialog from "./components/SeriesSelectionDialog";
import SeriesURLDialog from "./components/SeriesURLDialog";
import SeriesSquare from "../series/components/SeriesSquare";

export default {
    name: "Main",
    components: {SeriesSquare, SeriesURLDialog, SeriesSelectionDialog},
    data: () => ({
        fab: false,
        selectedCollectionName: null,
        seriesSelectionDialog: false,
        seriesURLDialog: false,
        collectionView: true,
    }),
    methods: {
        viewCollection(hash) {
            this.selectedCollectionName = hash;
        },
        updateSeries() {
            this.$store.dispatch('series/updateAllLocalSeries');
        },
        addSeriesToCollection(val) {
            console.log(val);
            this.$store.dispatch('series/addSeriesToCollection', {
                seriesHashes: val,
                collections: this.selectedCollectionName ? [this.selectedCollectionName] : null
            })
        },
    },
    beforeMount() {
        this.$store.dispatch('series/init');
    },
    computed: {
        ...mapGetters('series', ['isLoading', 'isScanning', 'isUpdating']),
        ...mapGetters('collections', ['collections']),
        series() {
            return this.$store.getters['series/localSeries'].map(series => ({
                ...series,
                currentChapter: series.chapters[series.reading] ? series.chapters[series.reading].title : '',
                latestChapter: series.chapters[0] ? series.chapters[0].title : ''
            })).filter(series => {
                if(this.collectionView) {

                    if(this.selectedCollectionName) {
                        if(!series.collectionNames) return false;
                        return (series.collectionNames.includes(this.selectedCollectionName));
                    }
                    return !series.collectionNames;
                } else return true;
            });
        },
        selectableSeries() {
            return this.$store.getters['series/localSeries'].filter(series => !series.collectionNames);
        },
        title() {
            return this.selectedCollectionName ? this.selectedCollectionName : 'Library';
        }
    }
}
</script>

<style scoped>
</style>