<template>
    <v-menu
        v-model="menu"
        :close-on-content-click="false"
        transition="slide-x-transition"
        left
        nudge-left="80"
    >
        <template v-slot:activator="{ on, attrs }">
            <v-fab-transition>
                <v-btn color="pink" dark fixed bottom right
                    fab v-bind="attrs" v-on="on"
                >
                    <v-icon>mdi-filter</v-icon>
                </v-btn>
            </v-fab-transition>
        </template>

        <v-card width="300">
            <v-list class="py-0">
                <v-list-item>
                    <v-list-item-content>
                        <v-list-item-title>Available Filters</v-list-item-title>
                    </v-list-item-content>

                </v-list-item>
            </v-list>

            <v-divider class="pb-3"></v-divider>

            <v-list class="py-0" v-if="seriesFilter">
                <v-list-item v-for="(filter, index) in seriesFilter" :key="'filter' + index">
                    <v-list-item-content class="pt-0">
                        <v-select :disabled="isLoading"
                                  :value="filter.selected"
                                  @input="setSelectedFilter($event, index)"
                                  :items="getFilterOption(index)"
                                  hide-details hide-selected
                                  :label="filter.name"
                        ></v-select>
                    </v-list-item-content>
                </v-list-item>
            </v-list>
            <v-list v-else>
                <v-list-item>
                    No Filter To Show
                </v-list-item>
            </v-list>

            <v-card-actions>
                <v-spacer></v-spacer>

                <v-btn
                    text
                    @click="resetFilter"
                >
                    Reset
                </v-btn>
                <v-btn
                    color="primary"
                    text
                    @click.stop="applyFilter"
                >
                    Search
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-menu>

</template>

<script>
import {mapGetters} from "vuex";

export default {
    name: "FilterMenu",
    data: () => ({
        search_term: '',
        menu: false,
        test_select: null,
        test_options: [],
    }),
    methods: {
        setSelectedFilter(value, filterIndex) {
            this.$store.commit('extensions/setSelectedFilters', {
                filterIndex: filterIndex,
                selectedValue: value,
            });
        },
        getFilterOption(filterIndex) {
            return this.seriesFilter ?
                this.seriesFilter[filterIndex].values.map((item, index) => ({text: item.name, value: index})) : null;
        },
        applyFilter() {
            this.menu = false;
            this.$store.dispatch('extensions/browse');
        },
        resetFilter() {
            this.menu = false;
            for(let i = 0; i < this.seriesFilter.length; i++)
                this.$store.commit('extensions/setSelectedFilters', {filterIndex: i, selectedValue: 0});

            this.$store.dispatch('extensions/browse');
        }
    },
    computed: {
        ...mapGetters('series', ['isLoading', 'getError']),
        ...mapGetters('extensions', ['seriesFilter']),
    }
}
</script>

<style scoped>

</style>