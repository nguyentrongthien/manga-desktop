<template>
    <v-container class="fill-height py-5">
        <v-row><v-btn @click="$router.back()">back</v-btn></v-row>
        <v-row v-if="isLoading" justify="center" class="fill-height">
            <h1>{{ isLoading ? 'Loading...' : 'Reader' }}</h1>
        </v-row>
        <v-row v-else v-for="(image, index) in currentChapter.images" :key="'image' + index" justify="center">
            <img width="100%" :src="image" :alt="image" />
        </v-row>
    </v-container>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
    name: "Main",
    computed: {
        ...mapGetters('series', ['isLoading', 'currentChapter', 'getError']),
    }
}
</script>

<style scoped>

</style>