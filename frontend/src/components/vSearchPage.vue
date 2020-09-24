<template>
  <div class="search-wrap">
    <div class="title" style="padding: 10px 10px;box-sizing:border-box;font-size:16px;color:#00a1e7;border-bottom:2px solid #00a1e7;font-weight: bold">搜索结果</div>
    <div v-if="showSearchVideo.length" class="pass-list-wrap clearfix">
      <div @click="toVideo(item.videoID)" :key="index" v-for="(item, index) in showSearchVideo" class="video-list-item">
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
      <div v-if="hasmore && !isLoading" class="load-more" @click="loadMore">加载更多</div>
      <div v-else class="load-more">对不起，已经没有更多内容了~</div>
      <div v-if="isLoading">
        <van-loading  size="30px"/>
      </div>
    </div>
    <div v-else style="box-sizing:border-box; text-align: center;padding: 20px 0;">暂无相关视频,选择投稿增加相关内容吧！</div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      numberPerPage: 8,
      nowPage: 1,
      showSearchVideo: [],
      hasmore: true,
      isLoading: false
    }
  },
  watch: {
    nowPage(val) {
    }
  },
  computed: {
    centerPage() {
      return
    }
  },
  methods: {
    searchVideo() {
      this.$http
      .get("video/searchVideo", {
        params: {
          keyWord: this.$route.query.keyWord,
          number: this.numberPerPage,
          page: this.nowPage
        }
      })
      .then(res => {
        if (res.data.ok) {
          if (res.data.data.length == 0) {
            this.hasmore = false
          } else {
            this.showSearchVideo = this.showSearchVideo.concat(res.data.data)
          }
        } else {
          this.$toast("搜索失败，请重试");
        }
        this.isLoading = false
      })
    },
    toVideo(videoID) {
      this.$router.push({
        name: 'video',
        params: {
          videoID
        }
      })
    },
    loadMore() {
      this.nowPage++
      this.isLoading = true
      this.searchVideo()
    }
  },
  mounted() {
    this.searchVideo()
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

<style <style lang="scss" scoped>
@media screen and (max-width: 414px){
  .search-wrap {
    width: 414px !important;
    .video-list-item {
      margin: 10px 23px !important;
    }
  }
}
@media screen and (max-width: 411px){
  .search-wrap {
    width: 411px !important;
    .video-list-item {
      margin: 10px 22px !important;
    }
  }
}
@media screen and (max-width: 411px){
  .search-wrap {
    width: 411px !important;
    .video-list-item {
      margin: 10px 22px !important;
    }
  }
}
@media screen and (max-width: 375px){
  .search-wrap {
    width: 375px !important;
    .video-list-item {
      margin: 10px 13px !important;
    }
  }
}
@media screen and (max-width: 360px){
  .search-wrap {
    width: 360px !important;
    .video-list-item {
      margin: 10px 10px !important;
    }
  }
}
@media screen and (max-width: 320px){
  .search-wrap {
    width: 320px !important;
    .video-list-item {
      width: 150px !important;
      margin: 10px 5px !important;
    }
  }
}

.search-wrap {
  width: 780px;
  margin: 0 auto;
  background-color: #fff;
  .video-list-item {
    float: left;
    width: 160px;
    margin-bottom: 30px;
    position: relative;
    margin: 10px 17px;
    overflow: hidden;
    border-radius: 5px;
    cursor: pointer;
    background-color: #fff;
    box-shadow: 0 7px 15px -7px #000;
    .video-cover {
      position: relative;
      width: 100%;
      height: 100px;
      overflow: hidden;
      img {
        display: block;
        width: 100%;
        height: 100%;
        opacity: 1;
      }
      .hover-mask {
        position: absolute;
        top: 100px;
        left: 0;
        width: 100%;
        height: 100px;
        background-color: rgba(0, 0, 0, .5);
        transition: top ease .5s;
        color: #fff;
        text-align: center;
        .view-count {
          margin-top: 35px;
        }
        .bullet-count {
          margin-top: 10px;
        }
      }
      &:hover .hover-mask{
        top: 0;
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
}
.load-more {
  display: block;
  text-align: center;
  line-height: 50px;
  color: #00a1e7;
  font-size: 14px;
  clear: left;
  cursor: pointer;
}
  
</style>
