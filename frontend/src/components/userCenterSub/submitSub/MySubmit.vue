<template>
  <div class="my-submit-wrap">
    <!-- pass -->
    <div class="my-submit-pass clearfix">
      <div class="title"><span>审核通过</span>审核通过&nbsp;(只有审核通过的视频可以跳转观看)</div>
      <div v-if="showPassList.length" class="pass-list-wrap clearfix">
        <div @click="toVideo(item.videoID)" :key="index" v-for="(item, index) in showPassList" class="video-list-item">
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
      </div>
      <div class="no-content" v-else>暂无内容哦~</div>
      <div v-if="showPassList.length" class="page-wrap clearfix">
        <div class="page-left">第{{ nowPassPage }}/{{ passPageTotal }}页</div>
        <div class="page-center">
          <ul class="clearfix">
            <li @click="prev('1')" v-if="centerPagePass - 1 >= 2" class="more-prev">...</li>
            <li :class="{on : centerPagePass + index - 2 == nowPassPage}" :key="index" v-for="index in passPageTotal>=3?3:passPageTotal" @click="jump(centerPagePass + index - 2, '1')">{{centerPagePass + index - 2}}</li>
            <li @click="next('1')" v-if="passPageTotal - centerPagePass >= 2" class="more-next">...</li>
          </ul>
        </div>
        <div class="page-right">跳转到第<input type="number" min="1" :max="passPageTotal" v-model.number="jumpPass">页<span @click="jump(jumpPass, '1')">确定</span></div>
      </div>
    </div>

    <!-- uncheck -->
    <div class="my-submit-uncheck clearfix">
      <div class="title"><span>暂未审核</span>请耐心等待审核哦~(一个人有点慢)</div>
      <div v-if="showUncheckList.length" class="uncheck-list-wrap clearfix">
        <div :key="index" v-for="(item, index) in showUncheckList" class="video-list-item">
          <div class="video-cover">
            <div class="hover-mask">
              <div class="view-count">播放量：{{item.viewCount}}</div>
              <div class="bullet-count">弹幕数：{{item.bulletCount}}</div>
            </div>
            <img :src="item.cover == '0'?$http.options.root + 'public/imgs/default-cover.png':$http.options.root + 'public/videos/'+ item.videoID +'/cover.'+item.coverType" alt="视频封面">
          </div>
          <div class="video-title" :title="item.videoname">{{item.videoname}}</div>
          <div class="video-label" :title="item.videoLabel.split(',').join(' | ')">{{item.videoLabel.split(',').join(' | ')}}</div>
          <div class="create-time clearfix">
            <div>投稿时间：</div>
            <div class="time">{{item.videoCreateTime | parseDate}}</div>
          </div>
        </div>

        

      </div>
      <div class="no-content" v-else>暂无内容哦~</div>
      <div v-if="showUncheckList.length" class="page-wrap clearfix">
        <div class="page-left">第{{nowUncheckPage}}/{{ uncheckPageTotal }}页</div>
        <div class="page-center">
          <ul class="clearfix">
            <li @click="prev('0')" v-if="centerPageUncheck - 1 >= 2" class="more-prev">...</li>
            <li :class="{on : centerPageUncheck + index - 2 == nowUncheckPage}" :key="index" v-for="index in uncheckPageTotal>=3?3:uncheckPageTotal" @click="jump(centerPageUncheck + index - 2, '0')">{{centerPageUncheck + index - 2}}</li>
            <li @click="next('0')" v-if="uncheckPageTotal - centerPageUncheck >= 2" class="more-next">...</li>
          </ul>
        </div>
        <div class="page-right">跳转到第<input type="number" min="1" :max="uncheckPageTotal" v-model.number="jumpUncheck">页<span @click="jump(jumpUncheck, '0')">确定</span></div>
      </div>
    </div>

    <!-- unpass -->
    <div class="my-submit-unpass clearfix">
      <div class="title"><span>未通过</span>您的视频有违规内容，不能通过哦~</div>
      <div v-if="showUnpassList.length" class="unpass-list-wrap clearfix">
        <div :key="index" v-for="(item, index) in showUnpassList" class="video-list-item">
          <div class="video-cover">
            <div class="hover-mask">
              <div class="view-count">播放量：{{item.viewCount}}</div>
              <div class="bullet-count">弹幕数：{{item.videwCount}}</div>
            </div>
            <img :src="item.cover == '0'?$http.options.root + 'public/imgs/default-cover.png':$http.options.root + 'public/videos/'+ item.videoID +'/cover.'+item.coverType" alt="视频封面">
          </div>
          <div class="video-title" :title="item.videoname">{{item.videoname}}</div>
          <div class="video-label" :title="item.videoLabel.split(',').join(' | ')">{{item.videoLabel.split(',').join(' | ')}}</div>
          <div class="create-time clearfix">
            <div>投稿时间：</div>
            <div class="time">{{item.videoCreateTime | parseDate}}</div>
          </div>
        </div>

        

      </div>
      <div v-else class="no-content">暂无内容哦~</div> 
      <div v-if="showUnpassList.length" class="page-wrap clearfix">
        <div class="page-left">第{{nowUnpassPage}}/{{ unpassPageTotal }}页</div>
        <div class="page-center">
          <ul class="clearfix">
            <li @click="prev('1')" v-if="centerPageUnpass - 1 >= 2" class="more-prev">...</li>
            <li :class="{on : centerPageUnpass + index - 2 == nowUnpassPage}" :key="index" v-for="index in unpassPageTotal>=3?3:unpassPageTotal" @click="jump(centerPageUnpass + index - 2, '2')">{{centerPageUnpass + index - 2}}</li>
            <li @click="next('0')" v-if="unpassPageTotal - centerPageUnpass >= 2" class="more-next">...</li>
          </ul>
        </div>
        <div class="page-right">跳转到第<input type="number" min="1" :max="unpassPageTotal" v-model.number="jumpUnpass">页<span @click="jump(jumpUnpass, '2')">确定</span></div>
      </div>
    </div> 
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  data(){
    return {
      //每页数量
      perPageNumber: 4,

      passList: {},
      showPassList: {},
      nowPassPage: 1,
      passTotal: 0,
      jumpPass: 1,

      uncheckList: {},
      showUncheckList: {},
      nowUncheckPage: 1,
      uncheckTotal: 0,
      jumpUncheck: 1,

      unpassList: {},
      showUnpassList: {},
      nowUnpassPage: 1,
      unpassTotal: 0,
      jumpUnpass: 1,
    }
  },
  watch: {
    user: {
      handler(val){
        if (val && val.userID) {
          this.init()
        }
      },
      immediate: true
    },
    needLoad(val) {
      if (val) {
        this.init()
      }
    }
  },
  methods: {
    init() {
      this.getList(0, this.perPageNumber, "0")
      this.getList(0, this.perPageNumber, "1")
      this.getList(0, this.perPageNumber, "2")
      this.getVideoTypeCount("0")
      this.getVideoTypeCount("1")
      this.getVideoTypeCount("2")
      this.nowPassPage = 1
      this.nowUncheckPage = 1
      this.nowUnpassPage = 1
      this.$toast('已经自动加载最新列表')
    },
    //得到列表并渲染
    getList(start, number, type) {
      this.$http.get('userCenter/getMySubmit', {
        params: {
          userID: +this.user.userID,
          start,
          number,
          type
        }
      }).then(res => {
        if (res.data.ok) {
          if (res.data.data.length != 0) {
            switch (type) {
              case "1": {
                this.passList['page' + this.nowPassPage] = res.data.data
                this.showPassList = this.passList['page' + this.nowPassPage]
                break
              }
              case "0": {
                this.uncheckList['page' + this.nowUncheckPage] = res.data.data
                this.showUncheckList = this.uncheckList['page' + this.nowUncheckPage]
                break
              }
              case "2": {
                this.unpassList['page' + this.nowUnpassPage] = res.data.data
                this.showUnpassList = this.unpassList['page' + this.nowUnpassPage]
                break
              }
            }
          }
        } else {
          this.$toast.fail("获取信息失败，请刷新页面！")
        }
      })
    },
    getVideoTypeCount(type) {
      this.$http.get('userCenter/getVideoTypeCount', {
        params: {
          userID: this.user.userID,
          type
        }
      }).then(res => {
        if (res.data.ok) {
          switch (type) {
            case "0": {
              this.uncheckTotal = res.data.data.total
              break
            }
            case "1": {
              this.passTotal = res.data.data.total
              break
            }
            case "2": {
              this.unpassTotal = res.data.data.total
              break
            }
          }
        } else {
          this.$toast.fail("数据加载失败，请刷新重试")
        }
      })
    },
    jump(page, type) {
      //查看是否页数越界
      switch(type) {
        case '0': {
          if (page > this.uncheckPageTotal) {
            this.$toast('跳转页不能大于总页数')
          } else {
            //改变当前页
            this.nowUncheckPage = page
            //如果目标页面已经缓存
            if (this.uncheckList['page' + page] && this.uncheckList['page' + page].length) {
              this.showUncheckList = this.uncheckList['page' + page]
            } else {
              //如果没有缓存 得到并渲染
              this.getList((page - 1) * this.perPageNumber, this.perPageNumber, "0")
            }
          }
          break
        }
        case '1': {
          if (page > this.passPageTotal) {
            this.$toast('跳转页不能大于总页数')
          } else {
            //改变当前页
            this.nowPassPage = page
            //如果目标页面已经缓存
            if (this.passList['page' + page] && this.passList['page' + page].length) {
              this.showPassList = this.passList['page' + page]
            } else {
              //如果没有缓存 得到并渲染
              this.getList((page - 1) * this.perPageNumber, this.perPageNumber, "1")
            }
          }
          break
        }
        case '2': {
          if (page > this.unpassPageTotal) {
            this.$toast('跳转页不能大于总页数')
          } else {
            //改变当前页
            this.nowUnpassPage = page
            //如果目标页面已经缓存
            if (this.unpassList['page' + page] && this.unpassList['page' + page].length) {
              this.showUnpassList = this.unpassList['page' + page]
            } else {
              //如果没有缓存 得到并渲染
              this.getList((page - 1) * this.perPageNumber, this.perPageNumber, "2")
            }
          }
          break
        }
      }
    },
    prev(type) {
      switch (type) {
        case '0': {
          this.nowUncheckPage -= 1
          break
        }
        case '1': {
          this.nowPassPage -= 1
          break
        }
        case '2': {
          this.nowUnpassPage -= 1
          break
        }
      }
    },
    next(type) {
      switch (type) {
        case '0': {
          this.nowUncheckPage += 1
          break
        }
        case '1': {
          this.nowPassPage += 1
          break
        }
        case '2': {
          this.nowUnpassPage += 1
          break
        }
      }
    },
    toVideo(videoID) {
      this.$router.push({
        name: 'video',
        params: {
          videoID
        }
      })
    }
  },
  computed: {
    ...mapState(['user']),
    passPageTotal(){
      return Math.ceil(this.passTotal / this.perPageNumber)
    },
    uncheckPageTotal(){
      return Math.ceil(this.uncheckTotal / this.perPageNumber)
    },
    unpassPageTotal(){
      return Math.ceil(this.unpassTotal / this.perPageNumber)
    },
    //计算中心页
    centerPageUncheck() {
      if (this.nowUncheckPage == 1) {
        return 2
      } else if (this.nowUncheckPage == this.uncheckPageTotal) {
        if (this.uncheckPageTotal - 1 == 1) {
          return 2
        } else {
          return this.uncheckPageTotal - 1
        }
      } else {
        return this.nowUncheckPage
      }
    },
    centerPageUnpass() {
      if (this.nowUnpassPage == 1) {
        return 2
      } else if (this.nowUnpassPage == this.unpassPageTotal) {
        if (this.unpassPageTotal - 1 == 1) {
          return 2
        } else {
          return this.unpassPageTotal - 1
        }
      } else {
        return this.nowUnpassPage
      }
    },
    centerPagePass() {
      if (this.nowPassPage == 1) {
        return 2
      } else if (this.nowPassPage == this.passPageTotal) {
        if (this.passPageTotal - 1 == 1) {
          return 2
        } else {
          return this.passPageTotal - 1
        }
      } else {
        return this.nowPassPage
      }
    },
    needLoad() {
      return this.$route.params.needLoad||false
    }
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
  @media screen and (max-width: 520px){
    .my-submit-wrap {
      width: 375px !important;
      margin: 0 auto;
    }
    .video-list-item {
      margin-left: 16px !important;
    }
  }
  .my-submit-wrap {
    width: 100%;
    margin-bottom: 20px;
    .title {
      border-bottom: 2px solid #00a1e7;
      span {
        display: inline-block;
        padding: 8px;
        color: #fff;
        margin-right: 5px;
        border-top-left-radius: 8px;
        border-top-right-radius: 8px;
        background-color: #00a1e7;
      }
    }
    .video-list-item {
      float: left;
      width: 160px;
      margin-bottom: 30px;
      position: relative;
      margin: 10px 5px;
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
    .page-wrap {
      display: block;
      width: 80%;
      margin: 5px auto 0;
      line-height: 30px;
      .page-left {
        float: left;
        padding: 0 10px;
        margin-bottom: 10px;
      }
      .page-center {
        float: left;
        margin-bottom: 10px;
        ul {
          li {
            float: left;
            padding: 0 12px;
            color: #fff;
            border-radius: 3px;
            background-color: #00a1e7;
            margin-right: 10px;
            cursor: pointer;
            &.on {
              background-color: #f60;
            }
          }
        }
      }
      .page-right {
        float: left;
        margin-left: 10px;
        input {
          display: inline-block;
          width: 30px;
          text-align: center;
          vertical-align: center;
          border: 1px solid #999;
          margin: 0 10px;
        }
        span {
          display: inline-block;
          padding: 0 10px;
          background-color: #00a1e7;
          margin-left: 10px;
          color: #fff;
          cursor: pointer;
          border-radius: 3px;
        }
      }
    }
    .my-submit-pass {
      .pass-list-wrap {
        width: 100%;
        margin: 10px auto;
        align-items: center;
        justify-content: space-around;
      }
    }
    .my-submit-uncheck {
      .uncheck-list-wrap {
        width: 100%;
        margin: 10px auto;
        align-items: center;
        justify-content: space-around;
      }
    }
    .my-submit-unpass {
      .unpass-list-wrap {
        width: 100%;
        margin: 10px auto;
        align-items: center;
        justify-content: space-around;
      }
    }
    .no-content {
      text-align: center;
      margin: 10px 0;
      color: #000;
    }
  }
</style>

