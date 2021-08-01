import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'

Vue.use(VueRouter)

const routes = [
    {
        path: '/',
        name: 'Home',
        component: Home
    },
    {
        path: '/about',
        name: 'About',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
    },
    {
        path: '/settings',
        name: 'Settings',
        component: () => import(/* webpackChunkName: "settings-main" */ '../views/settings/Main.vue')
    },
    {
        path: '/extensions',
        name: 'Extensions',
        component: () => import(/* webpackChunkName: "extensions-main" */ '../views/extensions/Main.vue')
    },
    {
        path: '/series',
        name: 'Series',
        component: () => import(/* webpackChunkName: "series-main" */ '../views/series/Main.vue')
    },
    {
        path: '/series/detail',
        name: 'Series Detail',
        component: () => import(/* webpackChunkName: "series-detail" */ '../views/series/Detail.vue')
    },
    {
        path: '/reader',
        name: 'Reader',
        component: () => import(/* webpackChunkName: "reader-main" */ '../views/reader/Main.vue')
    },
]

const router = new VueRouter({
    routes
})

export default router
