<template>
    <v-dialog
        v-model="dialog"
        max-width="500px"
    >
        <v-card>
            <v-card-text class="mt-3 pt-6">
                <v-text-field outlined hide-details dense v-model="url" label="Series URL" placeholder="Enter a series URL"></v-text-field>
            </v-card-text>
            <v-card-actions>
                <v-btn color="red darken-1" text @click="dialog = false">
                    Cancel
                </v-btn>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="view">
                    Read
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
import helper from "../../../extensions/helper";

export default {
    name: "SeriesURLDialog",
    props: ['value'],
    data:() => ({
        url: null,
    }),
    methods: {
        done() {
            this.$emit('input', false);
        },
        view() {
            let hash = helper.getHashFromString(this.url);
            this.$store.dispatch('series/requestSeriesDetail', this.url);
            this.$router.push({path: '/series/detail/' + hash});
            this.done();
        },
    },
    computed: {
        dialog: {
            get() {
                return this.value
            },
            set(val) {
                this.$emit('input', val);
            }
        }
    }
}
</script>

<style scoped>

</style>