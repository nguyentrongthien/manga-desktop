<template>
    <v-container class="fill-height">
        <v-row justify="center" align="center">
            <v-col xl="7" lg="9" md="10" cols="12">
                <v-row justify="center" align="center">
                    <v-col class="shrink">
                        <h1>Settings</h1>
                    </v-col>

                </v-row>
                <v-row justify="center" align="center">
                    <v-col lg="11" md="10" sm="9" cols="7">
                        <v-text-field :loading="isSeriesScanning" label="Manga's Directory" :value="getDirectory" readonly></v-text-field>
                    </v-col>
                    <v-col lg="1" md="2" sm="3" cols="5">
                        <v-btn :disabled="isSeriesScanning" @click.stop="setDirectory">
                            {{ isSeriesScanning ? 'Scanning...' : 'Browse'}}
                        </v-btn>
                    </v-col>
                </v-row>
                <v-row justify="center" align="center">
                    <v-col lg="11" md="10" sm="9" cols="7">
                        <v-text-field :loading="isSeriesScanning" label="Cache Directory" :value="getCache" readonly></v-text-field>
                    </v-col>
                    <v-col lg="1" md="2" sm="3" cols="5">
                        <v-btn :disabled="isSeriesScanning" @click.stop="setCache">
                            {{ isSeriesScanning ? 'Scanning...' : 'Browse'}}
                        </v-btn>
                    </v-col>
                </v-row>
                <v-row justify="center" align="center">
                    <v-col lg="11" md="10" sm="9" cols="7">
                        <v-text-field :loading="isExtensionScanning" label="Plugins Directory" :value="getExtension" readonly></v-text-field>
                    </v-col>
                    <v-col lg="1" md="2" sm="3" cols="5">
                        <v-btn :disabled="isExtensionScanning" @click.stop="setExtension">
                            {{ isExtensionScanning ? 'Scanning...' : 'Browse'}}
                        </v-btn>
                    </v-col>
                </v-row>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import { mapGetters } from 'vuex';
export default {
    name: "Main",
    data: () => ({

    }),
    mounted() {

    },
    methods: {
        async setDirectory() {
            await this.$store.dispatch('selectDirectory');
        },
        async setCache() {
            await this.$store.dispatch('selectCache');
        },
        async setExtension() {
            await this.$store.dispatch('selectExtension');
        }
    },
    computed: {
        ...mapGetters(['getDirectory', 'getCache', 'getExtension']),
        isSeriesScanning() {
            return this.$store.getters['series/isScanning'];
        },
        isExtensionScanning() {
            return this.$store.getters['extensions/isScanning'];
        }
    }
}
</script>

<style scoped>

</style>