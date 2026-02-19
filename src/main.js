
import { createApp, nextTick } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
// import { useAuthStore } from '@/stores/auth'

import { OhVueIcon } from "oh-vue-icons";
import Toastify from 'toastify-js'

import "toastify-js/src/toastify.css"
import "@fontsource/barlow-condensed/700.css"
import '@fontsource-variable/manrope';

import { OverlayScrollbars } from 'overlayscrollbars';
import 'overlayscrollbars/overlayscrollbars.css';

import './assets/main.css'
const app = createApp(App)

app.config.globalProperties.$toast = Toastify
app.component("v-icon", OhVueIcon);

const pinia = createPinia()
app.use(pinia)

app.use(router)
app.mount('#app')

nextTick(() => {
    OverlayScrollbars(document.body, {
        scrollbars: {
            clickScroll: true,
            autoHide: "leave",
            dragScrolling: true,
            clickScrolling: true,
        },
        scrollBehavior: 'smooth',
    });
});
