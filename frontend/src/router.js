import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [{
      path: '/',
      component: () => import('@/components/vHomeContain.vue')
    },
    {
      path: '/login',
      component: () => import('@/components/vLoginContain.vue')
    },
    {
      path: '/register',
      component: () => import('@/components/vRegContain.vue')
    },
    {
      path: '/userCenter',
      component: () => import('@/components/vUserCenterContain.vue'),
      children: [{
          path: '',
          redirect: 'basicInfo'
        },
        {
          path: 'basicInfo',
          component: () => import('@/components/userCenterSub/vBasicInfo.vue')
        },
        {
          path: 'security',
          component: () => import('@/components/userCenterSub/vSecurity.vue'),
          children: [{
              path: '',
              component: () => import('@/components/userCenterSub/securitySub/vDefaultPage.vue'),
            },
            {
              path: 'verifySmsCode',
              component: () => import('@/components/userCenterSub/securitySub/vSmsVerify.vue'),
            },
            {
              path: 'setQuestion',
              component: () => import('@/components/userCenterSub/securitySub/vSetQuestion.vue'),
            },
            {
              path: 'changePhone',
              component: () => import('@/components/userCenterSub/securitySub/vChangePhone.vue'),
            },

            {
              path: 'setPhone',
              component: () => import('@/components/userCenterSub/securitySub/vSetPhone.vue'),
            }
          ]
        },
        {
          path: 'changePassword',
          component: () => import('@/components/userCenterSub/vChangePsw.vue'),
          children: [
            {
              path: '',
              component: () => import('@/components/userCenterSub/changePswSub/vHome.vue')
            },
            {
              path: 'questionVerify',
              component: () => import('@/components/userCenterSub/changePswSub/vQuestionVerify.vue')
            },
            {
              path: 'smsVerify',
              component: () => import('@/components/userCenterSub/changePswSub/vSmsVerify.vue')
            },
            {
              path: 'basePage',
              component: () => import('@/components/userCenterSub/changePswSub/vBasePage.vue')
            }
          ]
        },
        {
          path: 'submitCenter',
          component: () => import('@/components/userCenterSub/vSubmitCenter.vue'),
          children: [
            {
              name: 'mysubmit',
              path: '',
              component: () => import('@/components/userCenterSub/submitSub/Mysubmit.vue'),
              meta: {
                keepAlive: true
              }
            },
            {
              path: 'submit',
              component: () => import('@/components/userCenterSub/submitSub/submit.vue'),
              meta: {
                keepAlive: true
              }
            }
          ]
        }
      ]
    },
    {
      path: '/forgetPassword',
      component: () => import('@/components/vForgetPassword.vue')
    },
    {
      path: '/video/:videoID',
      name: 'video',
      component: () => import('@/components/vVideo.vue'),
      props: true
    },
    {
      path: '/search',
      name: 'search',
      component: () => import('@/components/vSearchPage.vue')
    },
    {
      path: '/aboutMe',
      component: () => import('@/components/vAboutMe.vue')
    }
  ]
})
