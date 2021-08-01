<template>
    <v-app-bar
        app
        clipped-left
        color="grey darken-4"
        dense
    >
        <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
        <v-toolbar-title class="mr-12 align-center">
            <span class="title">Manga Desktop</span>
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <v-row
            align="center"
            style="max-width: 650px"
        >
            <v-text-field
                :append-icon-cb="() => {}"
                placeholder="Search..."
                single-line
                append-icon="mdi-magnify"
                color="white"
                hide-details
            ></v-text-field>
        </v-row>
    </v-app-bar>
</template>

<script>
export default {
    name: "Appbar",
    props: ['value'],
    data: () => ({
        drawer: null,
    }),
    watch: {
        value(val) {
            this.drawer = val;
        },
        drawer(val) {
            this.$emit('input', val);
        },
    }
}
</script>

<style scoped>

</style>