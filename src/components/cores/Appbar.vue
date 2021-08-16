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

    },
    computed: {
        ...mapGetters(['isReading']),
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