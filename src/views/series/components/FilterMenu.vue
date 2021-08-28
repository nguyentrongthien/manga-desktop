<template>
    <v-menu
        v-model="menu"
        :close-on-content-click="false"
        transition="slide-x-transition"
        left
        offset-x
        close-delay="1000"
        :open-on-hover="!menu"
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

        <v-card width="400">
            <v-list class="py-0">
                <v-list-item>
                    <v-list-item-content>
                        <v-list-item-title>Available Filters</v-list-item-title>
                    </v-list-item-content>

                </v-list-item>
            </v-list>

            <v-divider></v-divider>

            <v-list class="py-0">
                <v-list-item>
                    <v-list-item-content>
                        <form  @submit.prevent="search">
                            <v-text-field placeholder="Search manga..." single-line v-model="search_term" @click:append="search"
                                          append-icon="mdi-magnify" hide-details clearable :loading="isLoading" dense/>
                            <button type="submit" class="d-none"></button>
                        </form>
                    </v-list-item-content>

                </v-list-item>
                <v-list-item>
                    <v-btn :disabled="pageNumber <= 1 || isLoading" outlined small
                           @click.stop="changePage(pageNumber - 1)">
                        <v-icon>mdi-chevron-left</v-icon> Prev</v-btn>
                    <v-spacer></v-spacer>
                    <v-btn :disabled="isLoading" outlined @click.stop="changePage(pageNumber + 1)" small>
                        Next <v-icon>mdi-chevron-right</v-icon></v-btn>
                </v-list-item>

            </v-list>

            <v-divider class="pb-3 mt-3"></v-divider>

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
                <v-btn small class="ml-2"
                    outlined color="red"
                    @click="menu = !menu"
                >
                    <v-icon small>mdi-close</v-icon> close
                </v-btn>
                <v-spacer></v-spacer>

                <v-btn
                    text :disabled="isLoading"
                    @click="resetFilter"
                >
                    Reset
                </v-btn>
                <v-btn
                    color="primary"
                    text :disabled="isLoading"
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
            this.$store.dispatch('extensions/browse');
        },
        resetFilter() {
            for(let i = 0; i < this.seriesFilter.length; i++)
                this.$store.commit('extensions/setSelectedFilters', {filterIndex: i, selectedValue: 0});

            this.$store.dispatch('extensions/browse');
        },
        search() {
            if(this.search_term) this.$store.dispatch('extensions/search', this.search_term);
            else this.$store.dispatch('extensions/browse');
        },
        changePage(pageNumber) {
            this.$store.dispatch('extensions/changePage', pageNumber);
        },
    },
    computed: {
        ...mapGetters('series', ['isLoading', 'getError']),
        ...mapGetters('extensions', ['seriesFilter', 'pageNumber']),
    }
}
</script>

<style scoped>

</style>