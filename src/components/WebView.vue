<template>
    <v-dialog
        v-model="dialog"
        fullscreen
        hide-overlay
        transition="dialog-bottom-transition"
        scrollable
    >
        <v-card tile>
            <v-list class="pa-0">
                <v-list-item>
                    <v-list-item-content class="pa-0">
                        <v-list-item-subtitle class="pa-0">
                            <v-btn small @click="dialog = false" outlined color="red">
                                <v-icon>mdi-close</v-icon> close
                            </v-btn>
                        </v-list-item-subtitle>
                    </v-list-item-content>
                </v-list-item>
            </v-list>
            <v-divider></v-divider>

            <v-card-text v-if="!!$store.getters['getWebViewUrl']" class="pa-0">
                <iframe class="payment-iframe" :src="$store.getters['getWebViewUrl']"></iframe>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script>
export default {
    name: "WebView",
    data: () => ({

    }),
    methods: {
        close() {
            this.$store.commit('setWebViewUrl');
        }
    },
    computed: {
        dialog: {
            get() {
                return !!this.$store.getters['getWebViewUrl'];
            },
            set(val) {
                if(!val) this.$store.commit('setWebViewUrl');
            }
        }
    }
}
</script>

<style scoped>

.payment-iframe {
    min-height: 550px;
    height: 100%;
    width: 100%;
    border: none;
    overflow: hidden;
}
</style>