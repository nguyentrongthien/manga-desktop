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
                        <v-text-field :loading="isScanning" label="Manga's Directory" :value="getDirectory" readonly></v-text-field>
                    </v-col>
                    <v-col lg="1" md="2" sm="3" cols="5">
                        <v-btn :disabled="isScanning" @click.stop="setDirectory">
                            {{ isScanning ? 'Scanning...' : 'Browse'}}
                        </v-btn>
                    </v-col>
                </v-row>
                <v-row justify="center" align="center">
                    <v-col lg="11" md="10" sm="9" cols="7">
                        <v-text-field :loading="isScanning" label="Cache Directory" :value="getCache" readonly></v-text-field>
                    </v-col>
                    <v-col lg="1" md="2" sm="3" cols="5">
                        <v-btn :disabled="isScanning" @click.stop="setCache">
                            {{ isScanning ? 'Scanning...' : 'Browse'}}
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
    },
    computed: {
        ...mapGetters(['getDirectory', 'getCache']),
        ...mapGetters('series', ['isScanning']),
    }
}
</script>

<style scoped>

</style>