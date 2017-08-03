import Vue from 'vue'
import App from './App'
import router from './router'
import { webFrame } from 'electron'

webFrame.setZoomFactor(1)
webFrame.setZoomLevelLimits(1, 1)
Vue.config.productionTip = false

new Vue({
    router,
    ...App
}).$mount('#app')