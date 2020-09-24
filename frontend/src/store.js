import Vue from 'vue'
import Vuex from 'vuex'
import Router from 'vue-router'

Vue.use(Router)
Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    hasLogin: false,
    autoLoginTried: false, //自动检测登录
    user: {},

    //是否通过sms验证通过
    hasSmsVerify: {}
  },
  getters: {
    userMsg(state) {
      return state.user
    }
  },
  mutations: {
    changeUser(state, data) {
      state.user = data
    },
    changeAutoLoginTried(state) {
      state.autoLoginTried = true
    },
    changeHasSmsVerify(state, payload) {
      state.hasSmsVerify[payload] = true
    },
    changeHasLogin(state, payload) {
      state.hasLogin = payload
    },
    clearVerify(state, payload) {
      state.hasSmsVerify[payload] = false
    }
  },
  actions: {
    modifyUser({
      commit,
      state
    }) {
      Vue.http.get('user')
        .then(res => {
          if (res.data.ok) {
            commit('changeUser', res.data.data)
            commit('changeHasLogin', true)
          } else {
            if (state.hasLogin == true) {
              alert('登录超时，请重新登录！')
              commit('changeHasLogin', false)
              commit('changeUser', {})
            } else {
              console.log('自动登录系统: 失败，请手动登录，原因：未找到用户session')
            }
          }
          if (state.autoLoginTried == false) {
            commit('changeAutoLoginTried')
          }
        })
    }
  }
})
