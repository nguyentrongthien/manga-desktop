<template>
    <v-dialog
        v-model="dialog"
        scrollable
        max-width="500px"
    >
        <v-card>
            <v-card-title>Select Series</v-card-title>
            <v-divider></v-divider>
            <v-card-text style="height: 600px;">
                <v-row justify="center" align="stretch" class="my-2">
                    <v-col cols="4" v-for="(comic, index) in series" :key="'series'+index">

                        <v-card class="mx-auto fill-height" max-width="400" v-ripple :title="comic.title">
                            <v-img height="200" :src="comic.img" class="white--text align-end"
                                   gradient="to bottom, rgba(0,0,0,0), rgba(0,0,0,.9)">
                                <v-checkbox class="mx-2" :ref="'cb'+index"
                                            v-model="selected"
                                            :label="comic.title"
                                            :value="comic.hash"
                                            dense
                                >
                                    <template v-slot:label>
                                        <div class="grey--text caption">
                                            {{ ' ' }}
                                        </div>
                                    </template>
                                </v-checkbox>
                            </v-img>

                        </v-card>
                    </v-col>
                </v-row>
            </v-card-text>
            <v-divider></v-divider>
            <v-card-actions>
                <v-btn
                    color="red darken-1"
                    text
                    @click="dialog = false"
                >
                    Close
                </v-btn>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text
                    @click="done"
                >
                    Save
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
export default {
    name: "SeriesSelectionDialog",
    props: ['value', 'series'],
    data:() => ({
        selected: [],
    }),
    methods: {
        done() {
            this.$emit('selectionDone', this.selected);
            this.selected.splice(0);
            this.$emit('input', false);
        }
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