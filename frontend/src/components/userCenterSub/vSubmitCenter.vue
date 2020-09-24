<template>
  <div class="submit-center">
    <div class="title">
      <div class="badge"></div>
        投稿管理
    </div>
    <div class="submit-content">
      <Home></Home>
    </div>
  </div> 
</template>

<script>
var Home = () => import('./submitSub/home.vue')

export default {
  data(){
    return {

    }
  },
  components: { Home }
}
</script>

<style lang="scss" scoped>
  @media screen and (max-width: 620px) {
    .submit-content {
      width: 100% !important;
    }
  }

  .submit-center {
    text-indent: 1.125rem;
    .title {
      position: relative;
      width: calc(100% - 1.25rem);
      height: 3.125rem;
      line-height: 3.125rem;
      color: #fff;
      background-color: rgba(0, 161, 231, 0.9);
      font-size: 1.25rem;
      padding-left: 1.25rem;
      .badge {
        position: absolute;
        width: 0.5rem;
        height: 1rem;
        top: 50%;
        left: 1.25rem;
        margin-top: -0.5rem;
        background-color: rgb(255, 255, 255);
        border-radius: 4px;
      }
    }
    .submit-content {
      width: 90%;
      margin: 0 auto;
    }
  }
</style>
