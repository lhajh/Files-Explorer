import Vue from 'vue'
import App from './App.vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import moment from 'moment'
import 'font-awesome/css/font-awesome.min.css'

Vue.use(ElementUI)

Vue.prototype.$moment = moment

Vue.config.productionTip = false

new Vue({
  render: h => h(App)
}).$mount('#app')
