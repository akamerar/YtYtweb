<template>
  <div ref="body" id="user-center">
    <div class="center-wrap clearfix">
      <div
        class="left-tab"
        :class="{show: tabShow}"
      >
        <div
          class="arrow"
          @click.stop="toggleBar()"
        >
          {{tabArrow}}
        </div>
        <ul class="clearfix">
          <li>
            <a
              class="title"
              href="#/userCenter"
            >个人中心</a>
          </li>
          <li
            :key=item.id
            v-for="item in tabList"
          >
            <router-link
              class="list"
              :to="item.path"
            >{{item.value}}</router-link>
          </li>
        </ul>
      </div>
      <div class="right-content">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  data() {
    return {
      tabList: [
        {id: '1', value: '基本信息', path: '/userCenter/basicInfo'},
        {id: '2', value: '安全中心', path: '/userCenter/security'},
        {id: '3', value: '修改密码', path: '/userCenter/changePassword'},
        {id: '4', value: '投稿管理', path: '/userCenter/submitCenter'}
      ],
      tabShow: false,
      tabArrow: '▶'
    }
  },  
  computed: {
    ...mapState(['autoLoginTried', 'hasLogin'])
  },
  methods: {
    toggleBar() {
      this.tabShow = !this.tabShow
    },
    hideBar(event) {
      if (this.tabShow == true) {
        this.tabShow = false
        event.stopPropagation()
      }
    }
  },
  watch: {
    tabShow(newVal){
      if (newVal) {
        this.tabArrow = '◀'
      } else {
        this.tabArrow = '▶'
      }
    },
    //判断用户是否意外退出登录
    hasLogin: {
      handler(val, old) {
        if (val == false && old == true) {
          this.$router.push({
              path: '/login'
            })
        }
      }
    },
    //加载时判断是否登录
    autoLoginTried: {
      handler: function (newVal, oldVal) {
        //完成了自动登录尝试
        if (newVal) {
          //如果没有登录
          if (!this.hasLogin) {
            this.$router.push({
              path: '/login'
            })
          }
        }
      },
      immediate: true
    }
  },
  mounted(){
    document.getElementsByTagName("body")[0].addEventListener('click', this.hideBar, true)
  },
  beforeDestroy() {
    document.getElementsByTagName("body")[0].removeEventListener('click', this.hideBar)
    this.hideBar = null
  }
}
</script>

<style lang="scss" scoped>
@media screen and (max-width: 520px) {
  #user-center {
    padding: 0 !important;
    .center-wrap {
      border-radius: 0 !important;
      -webkit-border-radius: 0 !important;
      -o-border-radius: 0 !important;
      -moz-border-radius: 0 !important;
      -ms-border-radius: 0 !important;
      .left-tab {
        position: fixed !important;
        top: 165px;
        left: -20%;
        z-index: 50;
        &.show {
          left: 0;
        }
        >ul {
          >li {
            height: 50px;
          }
        }
        .arrow {
          display: block !important;
        }
      }
      .right-content {
        width: 100% !important;
      }
    }
  }
}

#user-center {
  padding: 1.875rem 0;
  width: 100%;
  .center-wrap {
    position: relative;
    width: 100%;
    border-radius: 0.8rem;
    -webkit-border-radius: 0.8rem;
    -o-border-radius: 0.8rem;
    -moz-border-radius: 0.8rem;
    -ms-border-radius: 0.8rem;
    overflow: hidden;
    background-color: #fff;
    .left-tab {
      position: relative;
      float: left;
      width: 20%;
      background-color: #fff;
      transition: left 0.5s;
      .arrow {
        display: none;
        position: absolute;
        width: 30px;
        height: 50px;
        font-size: 1rem;
        font-weight: bold;
        background-color: rgba($color: #00a1e7, $alpha: 0.6);
        line-height: 50px;
        text-align: center;
        top: 70%;
        color: #fff;
        right: -30px;
        border-top-right-radius: 0.5rem;
        border-bottom-right-radius: 0.5rem;
        cursor: pointer;
      }
      ul {
        li {
          float: left;
          width: 100%;
          text-align: center;
          line-height: 3.125rem;
          a {
            display: inline-block;
            width: 100%;
            height: 3.125rem;
            &.title {
              font-size: 1rem;
              color: #666;
              cursor: default;
              font-weight: bold;
              background-color: #ddd;
            }
            &.list {
              font-size: 0.875rem;
              color: #000;
              transition: background-color 0.3s;
              &:hover {
                background-color: #999;
              }
              //选中的list
              &.router-link-active {
                background-color: rgb(0, 161, 231);
                color: #fff;
              }
            }
          }
        }
      }
    }
    .right-content {
      float: left;
      width: 80%;
      min-height: 225px;
      border-left: 1px solid #ddd;
      box-sizing: border-box;
    }
  }
}
</style>

