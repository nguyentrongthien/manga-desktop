<template>
    <v-dialog v-model="open" width="400">

        <v-fade-transition mode="out-in">
            <v-card v-if="isDirectoriesSet">
                <v-card-title class="text-h5 font-weight-light">
                    <v-icon x-large color="green">mdi-check</v-icon>
                    All good!
                </v-card-title>

                <v-card-text>
                    Folders for your bookmarked comics and cache have been set.
                    <b>You can change this later in Settings</b>
                </v-card-text>

                <v-divider></v-divider>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                        color="green"
                        text
                        @click="open = false"
                    >
                        Got it
                    </v-btn>
                </v-card-actions>
            </v-card>
            <v-card v-else>
                <v-card-title class="text-h5 font-weight-light">
                    Pick a place to save comics?
                </v-card-title>

                <v-card-text>
                    This is the folder where your bookmarked Comics
                    are saved as well as where their chapters will be
                    downloaded to (if you chose to download them).
                </v-card-text>
                <v-card-text>
                    You can change this later in the Settings
                </v-card-text>

                <v-divider></v-divider>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                        text color="grey"
                        @click="open = false"
                    >
                        Nah
                    </v-btn>
                    <v-btn
                        color="green"
                        text
                        @click="setDirectory"
                    >
                        Okie Dokie
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-fade-transition>
    </v-dialog>
</template>

<script>
import {mapGetters} from 'vuex';

export default {
    name: "PromptForDirectory",
    methods: {
        async setDirectory() {
            await this.$store.dispatch('selectDirectory');
        },
    },
    computed: {
        ...mapGetters('series', ['isScanning']),
        open: {
            get() {
                return this.$store.getters['promptForDirectory'];
            },
            set(val) {
                this.$store.commit('setPromptForDirectory', val);
            }
        },
        isDirectoriesSet() {
            return this.$store.getters['getDirectory'] && this.$store.getters['getCache'];
        }
    }
}
</script>

<style scoped>

</style>