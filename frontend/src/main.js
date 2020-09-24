// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vueResource from 'vue-resource'

Vue.config.productionTip = false

Vue.use(vueResource)
Vue.http.options.root = 'http://192.168.43.22:2000/'
Vue.http.options.xhr = { withCredentials: true }
Vue.http.options.emulateJSON = true
Vue.http.interceptors.push(function (request, next) {
// 跨域携带cookie 拦截器
  request.credentials = true;
  next()
})

new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
})
