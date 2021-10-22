<template>
    <v-dialog
        v-model="dialog"
        fullscreen
        hide-overlay
        transition="dialog-bottom-transition"
        scrollable
    >
        <v-card tile>
            <v-toolbar dark>
                <div class="grey--text caption">{{ !!htmlObject ? htmlObject.originalUrl : 'Loading...' }}</div>
                <v-spacer></v-spacer>

                <v-btn v-if="!!htmlObject && htmlObject.originalUrl && isSeriesInLocal(htmlObject.originalUrl)"
                       small color="green" outlined>
                    <v-icon small>mdi-check</v-icon>  series is in local
                </v-btn>
                <v-btn v-if="!!htmlObject && htmlObject.isSeries && !isSeriesInLocal(htmlObject.originalUrl)"
                       :loading="$store.getters['series/isSeriesBeingProcessed'](htmlObject.originalUrl)" small outlined color="yellow"
                       @click.stop="saveSeries(htmlObject.originalUrl)">Add to library</v-btn>

                <v-btn icon class="ml-2" @click.stop="backward" :disabled="!htmlObject || current <= 0">
                    <v-icon>mdi-chevron-left</v-icon>
                </v-btn>
                <v-btn icon class="ml-2" @click.stop="forward" :disabled="!htmlObject || current >= history.length - 1">
                    <v-icon>mdi-chevron-right</v-icon>
                </v-btn>
                <v-btn icon @click="dialog = false" color="red" class="ml-2">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </v-toolbar>
            <v-divider></v-divider>

            <iframe v-if="!!htmlObject" class="payment-iframe" :srcdoc="htmlObject.htmlDoc"></iframe>
        </v-card>
    </v-dialog>
</template>

<script>
import {mapGetters} from "vuex";

export default {
    name: "WebView",
    data: () => ({
        url: null,
        history: [],
        current: -1,
    }),
    mounted() {
        window.addEventListener("message", this.receiveMessage, true);
    },
    destroyed() {
        window.removeEventListener('message', this.receiveMessage, true);
    },
    methods: {
        receiveMessage(event) {
            if (event.origin === 'http://localhost:8080') {
                let key = event.message ? "message" : "data";
                let url = event[key];
                if(typeof url === 'string') {
                    this.$store.dispatch('requestHtmlPage', url);
                    this.current++;
                    this.history.splice(this.current, this.history.length, url);
                }
            }
        },
        close() {
            this.url = null;
            this.$store.commit('setWebViewUrl');
        },
        isSeriesInLocal(url) {
            return url ? this.$store.getters['series/localSeries'].findIndex(item => item.url === url) >= 0 : null;
        },
        saveSeries(url) {
            this.$store.dispatch('series/SaveSeriesToLocalByUrl', url);
        },
        backward() {
            if(this.current > 0) {
                this.current--;
                this.$store.dispatch('requestHtmlPage', this.history[this.current]);
            }
        },
        forward() {
            if(this.current < this.history.length - 1) {
                this.current++;
                this.$store.dispatch('requestHtmlPage', this.history[this.current]);
            }
        }
    },
    computed: {
        ...mapGetters(['htmlObject']),
        dialog: {
            get() {
                return !!this.$store.getters['getWebViewUrl'];
            },
            set(val) {
                if(!val) this.$store.commit('setWebViewUrl');
            }
        }
    },
    watch: {
        dialog(val) {
            if(val) {
                this.url = this.$store.getters['getWebViewUrl'];
                this.$store.dispatch('requestHtmlPage', this.url);
                this.current++;
                this.history.push(this.url);
            } else {
                this.current = -1;
                this.history.splice(0);
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