<template>
    <v-app id="inspire">
        <v-app id="inspire">

            <Sidebar v-model="drawer" />

            <Appbar v-model="drawer" />

            <v-main>
                <v-fade-transition mode="out-in">
                    <router-view :key="$route.path"></router-view>
                </v-fade-transition>
            </v-main>

            <v-overlay :value="isBusy" :z-index="999999" class="text-center">
                <v-progress-circular indeterminate size="64"></v-progress-circular>
                <h2 class="font-weight-light white--text mt-3">Loading...</h2>
            </v-overlay>

        </v-app>
    </v-app>
</template>

<script>
import Sidebar from "./components/cores/Sidebar";
import Appbar from "./components/cores/Appbar";
import { mapGetters } from 'vuex';

export default {
    name: 'App',
    components: {
        Sidebar,
        Appbar
    },
    props: {
        source: String,
    },
    data: () => ({
        drawer: null,
    }),
    created () {
        // this.$vuetify.theme.dark = true
        window.ipcRenderer.receive('from-main', (payload) => {
            if(payload.passThrough) console.log(payload);
            if(payload.passThrough) this.$store.dispatch(payload.passThrough.flag, payload);
        })
    },
    mounted() {
        this.$store.dispatch('initialize');
        this.timer = setInterval(this.autoSave, 5000);
    },
    methods: {
        autoSave () {
            this.$store.dispatch('writeData');
        },
        cancelAutoUpdate () {
            clearInterval(this.timer);
        }
    },
    computed: {
        ...mapGetters(['isBusy']),
    }
};
</script>
