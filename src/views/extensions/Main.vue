<template>
    <v-container class="fill-height py-10">
        <v-row justify="center">
            <v-col xl="7" lg="9" md="10" cols="12">
                <v-row justify="center" align="center">
                    <v-col class="shrink">
                        <h1>Sources</h1>
                    </v-col>

                </v-row>
                <v-row justify="center" align="stretch">
                    <v-col lg="4" sm="6" cols="12" v-for="(ext, index) in extensions" :key="index">
                        <v-card color="#385F73" dark class="fill-height" @click.stop="browse(ext.id)">
                            <v-card-title class="text-h5">
                                {{ ext.name }}
                            </v-card-title>

                            <v-card-subtitle>
                                Version: {{ ext.version }}
                            </v-card-subtitle>

                            <v-card-subtitle>
                                Base URL: {{ ext.baseUrl }}
                            </v-card-subtitle>
                        </v-card>
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
        browse(extensionId) {
            this.$store.dispatch('extensions/browse', extensionId);
            this.$router.push({path: '/series'})
        },
    },
    computed: {
        ...mapGetters('extensions', ['isScanning']),
        ...mapGetters('series', ['isLoading']),
        extensions() {
            return this.$store.getters['extensions/get'];
        },
    }
}
</script>

<style scoped>

</style>