<template>
    <v-navigation-drawer v-model="drawer"
        app clipped color="black">
        <v-list dense>
            <v-list-item to="/">
                <v-list-item-action>
                    <v-icon>mdi-bookshelf</v-icon>
                </v-list-item-action>
                <v-list-item-title>Library</v-list-item-title>
            </v-list-item>

            <v-list-item to="/extensions">
                <v-list-item-action>
                    <v-icon>mdi-cloud-search-outline</v-icon>
                </v-list-item-action>
                <v-list-item-title>Browse</v-list-item-title>
            </v-list-item>

            <v-divider></v-divider>

            <v-list-item to="/settings">
                <v-list-item-action>
                    <v-icon>mdi-cog</v-icon>
                </v-list-item-action>
                <v-list-item-title>Settings</v-list-item-title>
            </v-list-item>
        </v-list>
    </v-navigation-drawer>
</template>

<script>
export default {
    name: "Sidebar",
    computed: {
        drawer: {
            get() {
                return this.$store.getters['drawer'];
            },
            set(value) {
                this.$store.commit('setDrawer', value);
            }
        }
    }
}
</script>

<style scoped>

</style>