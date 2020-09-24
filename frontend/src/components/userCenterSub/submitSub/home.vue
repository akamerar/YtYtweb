<template>
  <div class="submit-c-wrap">
    <div class="top-tab">
      <ul class="clearfix">
        <li class="sel">
          <router-link to="/userCenter/submitCenter">我的投稿</router-link>
        </li>
        <li>          
          <router-link to="/userCenter/submitCenter/submit">立即投稿</router-link>
        </li>
      </ul>
    </div>
    <div class="content-wrap">
      <keep-alive>
        <router-view v-if="$route.meta.keepAlive"></router-view>
      </keep-alive>
    </div>
  </div>
</template>

<script>

export default {
  
}
</script>

<style lang="scss" scoped>
  .submit-c-wrap {
    width: 100%;
    text-indent: 0px;
    .top-tab {
      >ul {
        >li {
          float: left;
          width: 80px;
          text-align: center;
          line-height: 40px;
          a {
            display: inline-block;
            width: 100%;
            height: 100%;
            font-size: 16px;
            color: #666;
            &.router-link-exact-active {
              border-bottom: 2px solid rgb(0, 161, 231);
              font-weight: bold;
              color: rgb(0, 161, 231);
            }
          }
        }
      }
    }
    .content-wrap {
      margin-top: 20px;
    }
  }
</style>
