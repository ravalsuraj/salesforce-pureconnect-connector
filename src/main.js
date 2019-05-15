import Vue from 'vue'
import 'bootstrap-css-only/css/bootstrap.min.css'; 
import 'mdbvue/build/css/mdb.css';
import App from './App.vue'
//import router from './router'
import store from './store/store'
import VueSocketIO from 'vue-socket.io'
Vue.config.productionTip = false
Vue.use(
  new VueSocketIO({
    debug: true,
    connection: 'https://104.211.95.34:8080',
    vuex: {
      store,
      actionPrefix: 'SOCKET_',
      mutationPrefix: 'SOCKET_'
    }
  })
)

new Vue({
  // router,
  store,
  render: h => h(App)
}).$mount('#app')
