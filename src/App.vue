<template>
    <v-app id="inspire">
        <v-app id="inspire">

            <Sidebar />

            <Appbar />

            <v-main>
                <v-fade-transition mode="out-in">
                    <router-view :key="$route.path"></router-view>
                </v-fade-transition>
            </v-main>

            <v-overlay :value="isBusy" :z-index="999999" class="text-center">
                <v-progress-circular indeterminate size="64"></v-progress-circular>
                <h2 class="font-weight-light white--text mt-3">Loading...</h2>
            </v-overlay>

            <Systembar />

        </v-app>
    </v-app>
</template>

<script>
import Sidebar from "./components/cores/Sidebar";
import Appbar from "./components/cores/Appbar";
import Systembar from "./components/cores/Systembar";
import { mapGetters } from 'vuex';

export default {
    name: 'App',
    components: {
        Sidebar,
        Appbar,
        Systembar
    },
    created () {
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

<style>
    *::placeholder {
        color: #b2aba1;
    }
    *::-webkit-scrollbar {
        background: transparent;
        width: 7px;
    }
    *::-webkit-scrollbar:hover {
        /*background: linear-gradient(0deg, black 5%, #4e4e4e 50%, black 95%);*/
        /*background: linear-gradient(90deg, black, #3c3c3c);*/
        width: 7px;
    }
    *::-webkit-scrollbar-thumb {
        border-radius: 5px;
        background: radial-gradient(#939393 5%, #ffffff00 40%);
    }
    *::-webkit-scrollbar-thumb:hover {
        background: radial-gradient(white 5%, black 80%);
        border: 1px solid #c4c4c4;
    }
    *::-webkit-scrollbar-thumb:active {
        background-color: #484e51;
    }
    *::-webkit-scrollbar-corner {
        background-color: #181a1b;
    }
    *::selection {
        background-color: #383838 !important;
        color: #e8e6e3 !important;
    }
    * input:-webkit-autofill,
    * textarea:-webkit-autofill,
    * select:-webkit-autofill {
        background-color: #555b00 !important;
        color: #e8e6e3 !important;
    }
</style>