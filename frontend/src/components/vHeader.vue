<template>
  <div class="app-header">
    <div class="h-top clearfix">
      <div class="h-top-left">
        <ul class="clearfix">
          <li class="logo">
            <router-link
              to="/"
              tag="a"
            >{{logoName}}</router-link>
          </li>
          <li class="others">
            <router-link
              to="/"
              tag="a"
            >首页</router-link>
          </li>
          <li class="others">
            <router-link to="/aboutMe">关于作者</router-link>
          </li>
        </ul>
      </div>
      <div class="h-top-right">
        <ul
          class="clearfix"
          v-if="!hasLogin"
        >
          <li
            class="others"
            :key="index"
            v-for="(item, key, index) in rightListLogin"
          >
            <router-link :to="key">{{item}}</router-link>
          </li>
        </ul>
        <ul
          class="clearfix"
          v-else
        >
          <li
            class="welcome-login"
            @click="rightFlag=!rightFlag"
          >
            <i
              class="arrow"
              :class="{turned: rightFlag}"
            >▼</i>
            <a href="#">你好 <small style="color:#ddd">{{user.username}},</small> 欢迎登录</a>
            <transition name="fall">
              <ul v-show="rightFlag">
                <li class="others">
                  <router-link to="/userCenter">用户中心</router-link>
                </li>
                <li class="others">
                  <router-link to="/userCenter/submitCenter">投稿管理</router-link>
                </li>
                <li class="others">
                  <router-link to="/userCenter/changePassword">修改密码</router-link>
                </li>
                <li class="others">
                  <a href="#" @click="exit()">退出</a>
                </li>
              </ul>
            </transition>
          </li>
        </ul>
      </div>
    </div>
    <div class="h-bottom">
      <div class="search clearfix" :class="{'show': searchHide}">
        <input
          class="searchBox"
          type="text"
          v-model="search"
          placeholder="请输入视频关键字"
        >
        <i class="searchBtn" @click="searchVideo">搜索</i>
      </div>
      <div class="hide-search" @click="searchHide = !searchHide">
        <i></i>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations, mapActions } from 'vuex'

export default {
  data() {
    return {
      timer: 0,
      logoName: "ytyt视频网站",
      rightListLogin: {
        "/login": "登录",
        "/register": "注册"
      },
      //控制顶部右菜单收放
      rightFlag: false,
      //控制search隐藏
      searchHide: false,
      //搜索关键字表单
      search: ""
    }
  },
  computed: {
    ...mapState(['hasLogin', 'user', 'autoLoginTried'])
  },
  watch: {
    //若登录，保持登录状态2m一次
    hasLogin: {
      handler(val, old){
        if (val) {
          this.timer = setInterval(() => {
            this.modifyUser()
          }, 1000*60*2) //2m一次
        }
        //如果是从登录到未登录
        if (old == true && val == false) {
          clearInterval(this.timer)
          this.modifyUser()
        }
      },
      immediate: true
    }
  },
  methods: {
    ...mapActions(['modifyUser']),
    //检查是否可以自动登录
    checkLogin(){
      if(!this.autoLoginTried){
        this.modifyUser()
      }
    },
    //退出登录
    exit(){
      this.$http.get('exit')
      .then(res => {
        if (res.ok){
          this.$store.state.hasLogin = false
          this.$store.state.user = {}
          this.$toast.success({
            message: '退出成功',
            duration: 1000
          })
          this.$router.push({
            path: this.$route.fullPath
          })
        } else {
          this.$toast.fail({
            message: '退出失败请重试！',
            duration: 1000
          })
        }
      })
    },
    //查询视频
    searchVideo() {
      if (this.search == "") {
        this.$toast('视频关键字不能为空')
      } else {
        this.$router.push({
          name: 'search',
          query: {
            keyWord: this.search
          }
        })
      }
    }
  },
  mounted(){
    //检测是否可以自动登录
    this.checkLogin()
  },
}
</script>

<style lang="scss" scoped>
//右侧li数量
$listNum: 4;

//vue右侧fall动画
.fall-enter-active,
.fall-leave-active {
  transition: all 0.5s;
  height: $listNum * 2.5rem;
}
.fall-enter,
.fall-leave-to {
  height: 0;
}

//主题色
$baseColor: rgba(0, 161, 231, 0.8); //#50a8e2;

@media screen and (max-width: 1300px) {
  .h-top-left {
    width: 50% !important;
    margin-left: 0px !important;
    .logo {
      margin-right: 40px !important; 
    }
  }
  .h-bottom .search {
    width: 310px;
    left: 450px!important;
  }
}
@media screen and (max-width: 780px) {
  .h-top{
    min-width: 250px;
    a{
      color: #fff !important;
    }
  }
  .h-top-left {
    width: 9.375rem !important;
    margin-left: 1.25rem !important;
    ul li.logo {
      margin-right: 0 !important;
    }
  }
  .h-top-left .others {
    display: none;
  }
  .h-top-right {
    width: 50% !important;
  }
  .h-bottom .search {
    width: 0 !important;
    top: 3.75rem !important;
    left: 0 !important;
    opacity: 0;
    &.show{
      width: 100% !important;
      opacity: 1;
    }
    .searchBox {
      width: 70% !important;
    }
    .searchBtn {
      width: 28% !important;
      color: #fff !important;
    }
  }
  .h-bottom .hide-search{
    display: block !important;
  }
}

.app-header {
  position: relative;
  width: 100%;
  height: 10.625rem;
  background: url("http://192.168.43.22:2000/public/imgs/header.png")
    top center no-repeat;
  background-size: cover;
}

.h-top {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 2.5rem;
  background-color: $baseColor;
  line-height: 2.5rem;
  box-shadow: 0 0 1.875rem 0.625rem rgb(2, 72, 102);
  z-index: 100;
  ul {
    width: 100%;
    li {
      min-width: 3.125rem;
      margin: 0 1.25rem;
      a {
        width: 100%;
        text-align: center;
        transition: all ease 0.5s;
      }
    }

    li.others a:hover {
      color: #fff !important;
    }
  }
  .h-top-left {
    float: left;
    width: 31.25rem;
    height: 100%;
    margin-left: 6.25rem;
    ul {
      li {
        float: left;
        height: 100%;
        &.logo {
          margin-right: 6.25rem;
          a {
            color: #fff;
            font-size: 1.25rem;
            font-weight: bold;
          }
        }
        a {
          float: left;
          height: 100%;
          font-size: 0.875rem;
          color: #ddd;
          vertical-align: top;
        }
      }
    }
  }
  .h-top-right {
    float: right;
    width: 25%;
    height: 100%;
    > ul {
      & > li {
        float: left;
        height: 100%;
        &.welcome-login {
          position: absolute;
          padding: 0 0.9375rem;
          > i.arrow {
            position: absolute;
            font-size: 0.625rem;
            right: 0;
            top: 0;
            color: #fff;
            transition: all ease 0.5s;
            &.turned {
              transform: rotate(180deg);
            }
          }
          > a {
            color: #fff;
            font-weight: bold;
            font-size: 0.75rem;
            overflow: hidden;
          }
          //问题标签
          ul {
            position: absolute;
            top: 2.5rem;
            left: 0;
            width: 100%;
            overflow: hidden;
            z-index: 100;
            li {
              width: 100%;
              height: 2.5rem;
              margin: 0;
              background-color: $baseColor;
            }
          }
        }
        a {
          display: inline-block;
          height: 100%;
          font-size: 0.875rem;
          color: #ddd;
          vertical-align: top;
        }
      }
    }
  }
}

.h-bottom {
  position: relative;
  width: 100%;
  height: 10.625rem;
  overflow-x: hidden;
  .search {
    position: absolute;
    height: 2.625rem;
    overflow: hidden;
    top: 60%;
    left: 70%;
    vertical-align: top;
    line-height: 2.25rem; //36px
    font-size: 0.875rem; //14px
    transition: all ease .5s;
    z-index: 20;
    .searchBox {
      float: left;
      width: 15.625rem; //300px
      height: 2.25rem; //36px
      padding: 0;
      border: 2px solid transparent;
      border-right: none;
      border-top-left-radius: 0.5rem; //3px
      border-bottom-left-radius: 0.5rem;
      text-indent: 0.9375rem; //15px
      color: #333;
      background: #eee;
      transition: border-color .5s;
      &:hover{
        background: #fff;
        border-color: rgb(0, 161, 231);
      }
      &:focus{
        background: #fff;
        border-color: rgb(0, 161, 231);
      }
    }
    .searchBtn {
      float: left;
      width: 3.125rem; //50px
      height: 2.25rem; //36px
      text-align: center;
      border: 2px solid transparent;
      border-left: none;
      border-top-right-radius: 0.5rem; //3px
      border-bottom-right-radius: 0.5rem;
      background-color: $baseColor;
      color: #fff;
      cursor: pointer;
    }
  }
  .hide-search{
    display: none;
    position: absolute;
    width: 40px;
    height: 40px;
    bottom: 0.625rem;
    left: 1.25rem;
    background-color:#fff;
    z-index: 100;
    border-radius: 50%;
    i{
      display: inline-block;
      width: 100%;
      height: 100%;
      box-sizing: border-box;
      border: 2px solid #00a1e7;
      border-radius: 50%;
      background: url('../assets/imgs/icons.png') -653px -718px;
    }
  }
}
</style>

