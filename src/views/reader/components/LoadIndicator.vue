<template>
    <div class="load-indicator-container" :style="'width:' + loadIndicatorContainerWidth + 'px'">
        <div class="load-indicator-item" v-for="(page, index) in readersPages" :key="'indicator' + index"
             :style="calcLoadIndicatorStyle(page)" @click.stop="scrollTo('#image' + index)">
            {{index + 1}}
        </div>
    </div>

</template>

<script>
import {mapGetters} from "vuex";

export default {
    name: "LoadIndicator",
    methods: {
        scrollTo(elementId) {
            this.$vuetify.goTo(elementId, {duration: 2000, easing: 'easeInOutCubic'});
        },
        calcLoadIndicatorStyle(page) {
            if(page.error) return 'background: #4c0000;'
            let perc = page.total ? Math.ceil((page.loaded/page.total) * 100) : 0;
            return 'background: linear-gradient(to left, #000, #000 0%, #6b6b6b ' + perc + '%, #000 0%);'
        }
    },
    computed: {
        ...mapGetters('downloads', ['readersPages']),
        loadIndicatorContainerWidth() {
            let pages = this.readersPages.length;
            return Math.ceil(pages/55) ? Math.ceil(pages/55) * 40 : 40;
        }
    }
}
</script>

<style scoped>
    .load-indicator {
        height: 100%;
        position: fixed;
        top: 0;
        right: 0;
        width: 50px;
    }
    .indicator {
        display: flex;
    }
    .load-indicator-container {
        display: flex;
        flex-flow: column wrap;
        height: 100%;
        position: fixed;
        top: 0;
        right: 0;
    }
    .load-indicator-item {
        display: flex;
        align-items: center;
        flex-grow: 1;
        margin: 1px 0;
        font-size: .7em;
        padding: 0 10px;
        border-left: 1px solid #313131;
    }

    .load-indicator-item:hover {
        cursor: pointer;
        border-left: 3px solid white;
    }
</style>