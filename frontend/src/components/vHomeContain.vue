<template>
  <div class="video-list ">
    <div class="list-top clearfix">
      <!-- nav区域 -->
      <div class="app-nav">
        <div class="nav-wrap">
          <ul>
            <li
              :class="{'on': index == navNow}"
              v-for="(item, index) in navList"
              :key="index"
              @click="changeNav(index, item)"
            >{{item}}</li>
          </ul>
        </div>
      </div>
      <div class="banner-plugin banner-left">广告区1</div>
      <!-- 轮播图 -->
      <van-swipe :autoplay="3000" @change="onChange">
        <van-swipe-item v-for="(image, index) in images" :key="index">
          <img :src="image" />
        </van-swipe-item>
      </van-swipe>
      <div class="banner-plugin banner-right">广告区2</div>
    </div>
    <div class="video-list-title">视频列表</div>
    <!-- 视频列表区 -->
    <div class="video-list-wrap clearfix">
      <div v-if="nowList.length">
        <div @click="toVideo(item.videoID)" :key="index" v-for="(item, index) in nowList" class="video-list-item">
          <div class="videoID">{{item.videoID}}</div>
          <div class="video-cover">
            <div class="hover-mask">
              <div class="view-count">播放量：{{item.viewCount}}</div>
              <div class="bullet-count">弹幕数：{{item.bulletCount}}</div>
            </div>
            <img :src="item.cover == '0'?$http.options.root + 'public/imgs/default-cover.png':$http.options.root + 'public/videos/'+ item.videoID +'/cover.'+item.coverType" alt="封面">
          </div>
          <div class="video-title" :title="item.videoname">{{item.videoname}}</div>
          <div class="video-label" :title="item.videoLabel.split(',').join(' | ')">{{item.videoLabel.split(',').join(' | ')}}</div>
          <div class="create-time clearfix">
            <div>投稿时间：</div>
            <div class="time">{{item.videoCreateTime | parseDate}}</div>
          </div>
        </div>
        <div v-if="!loading">
          <div class="load-more" @click="addMore()">点击加载更多</div>
        </div>
        <div v-else>
          <van-loading  size="30px"/>
        </div>
      </div>
      <div v-else>
        <van-loading  size="70px"/>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  data() {
    return {
      navList: ["热门", "音乐", "动漫", "游戏", "生活", "影视", "其他"],
      navNow: 0,
      navValue: '热门',
      images: [
        "http://192.168.43.22:2000/public/imgs/banner1.jpg",
        "http://192.168.43.22:2000/public/imgs/banner2.jpg",
        "http://192.168.43.22:2000/public/imgs/banner3.jpg",
        "http://192.168.43.22:2000/public/imgs/banner4.jpg",
        "http://192.168.43.22:2000/public/imgs/banner5.jpg"
      ],
      bannerIndex: 0,
      list0: [],
      list1: [],
      list2: [],
      list3: [],
      list4: [],
      list5: [],
      list6: [],

      loading: false
    }
  },
  computed: {
    nowList() {
      switch (this.navNow) {
        case 0: {
          return this.list0
          break
        }
        case 1: {
          return this.list1
          break
        }
        case 2: {
          return this.list2
          break
        }
        case 3: {
          return this.list3
          break
        }
        case 4: {
          return this.list4
          break
        }
        case 5: {
          return this.list5
          break
        }
        case 6: {
          return this.list6
          break
        }
      }
    }
  },
  methods: {
    onChange(index) {
      this.bannerIndex = index
    },
    changeNav(index, value) {
      this.navNow = index
      this.navValue = value
      this['list' + this.navNow] = []
      this.getList(8)
    },
    //从服务器获取最新视频信息
    getList(number, callback) {
      var callback = callback || null
      this.$http.get('video/getList', {
        params: {
          type: this.navValue,
          number,
        }
      }).then(res => {
        if (res.data.ok) {
          this['list' + this.navNow] = this['list' + this.navNow].concat(res.data.data)
        } else {
          this.$toast('数据获取失败，请刷新重试')
        }
        if (callback) {
          callback()
        }
      })
    },
    addMore() {
      this.loading = true
      var This = this
      this.getList(8, () => {
        this.loading = false
        this.$toast({
          duration: 1000,
          message: '已为您加载8条最新视频信息'
        })
      })
    },
    //跳转到视频
    toVideo(videoID) {
      this.$router.push({
        name: 'video',
        params: {
          videoID
        }
      })
    }
  },
  created() {
    //获取热门视频信息
    this.getList(8)
  },
  filters: {
    parseDate(val) {
      var arr = []
      var date = new Date(val)
      arr.push(date.getFullYear())
      arr.push(date.getMonth() + 1)
      arr.push(date.getDate())
      return arr.join('-')
    }
  }
}
</script>

<style lang="scss" scoped>
// 1300px 780px 100%

@media screen and (max-width: 1300px){
  .banner-plugin.banner-left, .banner-plugin.banner-right {
    height: 195px !important;
    line-height: 370px !important;
  }
  .video-list-title {
    padding: 15px 10px !important;
  }
  .video-list-item {
    width: 174px !important;
    .video-cover {
      img {
        height: 98px !important;
      }
      .hover-mask {
        top: 98px !important;
        height: 98px !important;
        .view-count {
          margin-top: 35px !important;
        }
      }
      &:hover .hover-mask{
        transform: translateY(-98px) !important;
      }
    }
  }
}
@media screen and (max-width: 880px){
  .banner-plugin.banner-left, .banner-plugin.banner-right {
    display: none !important;
  }
  .app-nav {
    margin-top: 0 !important;
  }
  .van-swipe {
    width: 100% !important;
    margin: 0 auto;
  }
  .video-list-title {
    padding: 15px 10px !important;
  }
  .video-list-wrap {
    width: 768px;
    margin: 0 auto;
  }
}
@media screen and (max-width: 414px) {
  .video-list-title {
    width: 100% !important;
    padding-left: 0px !important;
    padding-right: 0px !important;
    text-indent: 20px;
  }
  .video-list-wrap {
    width: 414px !important;
    margin: 0 auto;
    .video-list-item {
      width: 165px !important;
      margin: 10px 20px !important;
      .video-cover {
        img {
          height: 88px !important;
        }
        .hover-mask {
          top: 88px !important;
          height: 88px !important;
        }
        &:hover .hover-mask{
          transform: translateY(-88px) !important;
        }
      }
    }
  }
}
@media screen and (max-width: 375px) {
  .video-list-wrap {
    width: 375px !important;
    margin: 0 auto;
    .video-list-item {
      width: 154px !important;
      margin: 10px 16px !important;
      .video-cover {
        img {
          height: 88px !important;
        }
        .hover-mask {
          top: 88px !important;
          height: 88px !important;
        }
        &:hover .hover-mask{
          transform: translateY(-88px) !important;
        }
      }
    }
  }
}
@media screen and (max-width: 360px) {
  .video-list-wrap {
    width: 360px !important;
    margin: 0 auto;
    .video-list-item {
      width: 154px !important;
      margin: 10px 13px !important;
      .video-cover {
        img {
          height: 88px !important;
        }
        .hover-mask {
          top: 88px !important;
          height: 88px !important;
        }
        &:hover .hover-mask{
          transform: translateY(-88px) !important;
        }
      }
    }
  }
}
@media screen and (max-width: 320px) {
  .video-list-wrap {
    width: 320px !important;
    margin: 0 auto;
    .video-list-item {
      width: 154px !important;
      margin: 10px 3px !important;
      .video-cover {
        img {
          height: 88px !important;
        }
        .hover-mask {
          top: 88px !important;
          height: 88px !important;
        }
        &:hover .hover-mask{
          transform: translateY(-88px) !important;
        }
      }
    }
  }
}

.video-list {
  width: 100%;
  background: url("http://192.168.43.22:2000/public/imgs/test1.jpg"); 
  background-position: 354px 178px;
  overflow: hidden;
  .list-top {
    width: 100%;
    background-color: rgba($color: #00a1e7, $alpha: .5);
    .app-nav {
      width: 100%;
      margin: 0 auto;
      height: 40px;
      background: rgba($color: #00a1e7, $alpha: 1.0);
      .nav-wrap {
        width: 100%;
        height: 100%;
        overflow: hidden;
        > ul {
          position: relative;
          display: flex;
          display: -webkit-flex;
          display: -o-flex;
          display: -moz-flex;
          display: -ms-flex;
          justify-content: space-around;
          -webkit-justify-content: space-around;
          -o-justify-content: space-around;
          -moz-justify-content: space-around;
          -ms-justify-content: space-around;
          align-items: center;
          -webkit-align-items: center;
          -o-align-items: center;
          -moz-align-items: center;
          -ms-align-items: center;
          flex-wrap: nowrap;
          z-index: 50;
          > li {
            position: relative;
            padding: 0 10px;
            font-size: 14px;
            line-height: 40px;
            box-sizing: border-box;
            cursor: pointer;
            font-weight: bold;
            color: #eee;
            &.on {
              position: relative;
              top: -3px;
              border-bottom: 3px solid rgb(255, 255, 255);
              color: #fff;
            }
            &:hover {
              color: #fff;
              // background-color: #00a1ff;
            }
          }
        }
      }
    }
    .van-swipe {
      float: left;
      width: 50%;
      margin: 0 auto;
      img {
        display: block;
        width: 100%;
        height: auto;
      }
    }
    .banner-plugin {
      float: left;
      width: 25%;
      height: 325px;
      background-color: #000;
      text-align: right;
      color: #fff;
      font-size: 16px;
      line-height: 620px;
      &.banner-left {
        background-image: url('http://192.168.43.22:2000/public/imgs/banner-left.gif');
        background-size: cover;
      }
      &.banner-right {
        background-image: url('http://192.168.43.22:2000/public/imgs/banner-right.gif');
        background-size: cover;
      }
    }
  }
  .video-list-title {
    width: 760px;
    margin: 0 auto;
    padding: 15px 270px;
    background-color: #00a1e7;
    color: #fff;
    font-size: 16px;
  }
  .video-list-wrap {
    position: relative;
    overflow: hidden;
    background-color: #eee;
    width: 780px;
    margin: 0 auto;
    .video-list-item {
      float: left;
      width: 174px;
      margin-bottom: 30px;
      position: relative;
      margin: 10px 10px;
      overflow: hidden;
      border-radius: 5px;
      cursor: pointer;
      background-color: #fff;
      box-shadow: 0 7px 15px -7px #000;
      .videoID {
        display: none;
      }
      .video-cover {
        position: relative;
        width: 100%;
        overflow: hidden;
        img {
          display: block;
          width: 100%;
          height: 98px;
          opacity: 1;
        }
        .hover-mask {
          position: absolute;
          top: 98px;
          left: 0;
          width: 100%;
          height: 171px;
          background-color: rgba(0, 0, 0, .5);
          transition: transform ease .5s;
          color: #fff;
          text-align: center;
          transform: translateY(0);
          .view-count {
            margin-top: 35px;
          }
          .bullet-count {
            margin-top: 10px;
          }
        }
        &:hover .hover-mask{
          transform: translateY(-98px)
        }
      }
      .video-title {
        color: #000;
        margin-top: 5px;
        margin-left: 3px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .video-label {
        color: #666;
        font-size: 10px;
        margin-top: 5px;
        margin-left: 3px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .create-time {
        margin-top: 5px;
        margin-left: 3px;
        margin-right: 3px;
        margin-bottom: 5px;
        div {
          float: left;
          width: 50%;
          color: #999;
          &.time {
            text-align: right;
          }
        }
      }
    }
    //缓冲图标
    .van-loading {
      display: block;
      margin: 30px auto;
    }
    .load-more {
      text-align: center;
      line-height: 50px;
      color: #00a1e7;
      font-size: 14px;
      cursor: pointer;
    }
  }
}
</style>
