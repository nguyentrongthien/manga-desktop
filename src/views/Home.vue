<template>
    <v-container class="fill-height">
        <v-row
            justify="center"
            align="center"
        >
            <v-col class="shrink">
                <v-tooltip right>
                    <template v-slot:activator="{ on }">
                        <v-btn
                            @click="buttonTest"
                            icon
                            large
                            target="_blank"
                            v-on="on"
                        >
                            <v-icon large>mdi-code-tags</v-icon>
                        </v-btn>
                    </template>
                    <span>Source</span>
                </v-tooltip>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>

export default {
    name: 'Home',
    methods: {
        buttonTest() {

        }
    }
}
</script>
