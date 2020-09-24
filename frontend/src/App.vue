<template>
  <div id="app">
    <div class="to-top" @click="toTop()"></div>
    <Home></Home>
  </div>
</template>

<script>
var Home = () => import("./views/Home.vue");
import Vue from "vue"
import {
  Field,
  Cell,
  CellGroup,
  Toast,
  RadioGroup,
  Radio,
  DatetimePicker,
  Row,
  Col,
  Button,
  Swipe, SwipeItem,
  Lazyload,
  Loading 
} from "vant"

Vue.use(Field)
  .use(Cell)
  .use(CellGroup)
  .use(Toast)
  .use(RadioGroup)
  .use(Radio)
  .use(DatetimePicker)
  .use(Row)
  .use(Col)
  .use(Button)
  .use(Swipe)
  .use(SwipeItem)
  .use(Lazyload)
  .use(Loading)

export default {
  name: "App",
  components: { Home },
  methods: {
    toTop() {
      if (document.body.scrollTop) {
        document.body.scrollTop = 0
      } else {
        document.documentElement.scrollTop = 0

      }
    }
  },
  created() {
    //禁止选中文字
    document.onselectstart = function(){return false}
  }
}
</script>

<style lang="scss">
@import url("./assets/css/main.scss");

@media screen and (max-width: 414px){
  #app {
    min-width: 300px !important;
  }
}

#app {
  min-width: 786px;
  background: url("http://192.168.43.22:2000/public/imgs/bodyBg.png") top center no-repeat;
  background-attachment: fixed;
  background-size: cover;
}
.to-top {
  position: fixed;
  opacity: .8;
  width: 50px;
  height: 50px;
  bottom: 100px;
  right: 20px;
  border-radius: 50%;
  background-image: url("http://192.168.43.22:2000/public/imgs/top.jpg");
  z-index: 200;
  cursor: pointer;
}
</style>
