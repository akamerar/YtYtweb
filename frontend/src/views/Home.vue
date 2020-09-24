<template>
  <div id="home">
    <vHeader></vHeader>
    <div id="app-contain">
      <router-view></router-view>
    </div>
    <vFooter></vFooter>
  </div>
</template>

<script>
var vHeader = () => import("../components/vHeader")
var vFooter = () => import("../components/vFooter")


export default {
  data() {
    return {
      
    }
  },
  components: { vHeader, vFooter }
}
</script>

<style lang="scss" scoped>
@media screen and (max-width: 1300px) {
  #home, #app-contain {
    width: 780px !important;
  }
}
@media screen and (max-width: 880px) {
  #home, #app-contain {
    width: 780px !important;
  }
}
@media screen and (max-width: 414px) {
  #home, #app-contain {
    width: 100% !important;
  }
}

#home, #app-contain {
  width: 1300px;
  margin: 0 auto;
  background-color: #fff;
}
</style>
