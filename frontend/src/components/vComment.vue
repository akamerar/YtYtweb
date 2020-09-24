<template>
  <div id="app-comment">
    <div class="about-video">
      <div class="author flieds" style="border:none;font-size:22px">视频名：{{videoMsg.videoname}}</div>
      <div class="author flieds">作者：{{authorMsg.username}}</div>
      <div class="videoInfo">
        <div class="title flieds">视频简介:</div>
        <div class="flieds" style="margin-left: 20px; color: #666">{{videoMsg.videoInfo}}</div>
      </div>
      <div class="video-label">
        <div class="title flieds">视频标签:</div>
        <div class="btn-wrap flieds">
          <div v-for="(item, index) in videoLabelparsed" :key="index" class="btn">{{item}}</div>
        </div>
      </div>
      <div class="others flieds">
        <span>播放量：{{videoMsg.viewCount}}</span>
        <span v-if="sysType=='PC'">弹幕数：{{videoMsg.bulletCount}}</span>
        <span>投稿时间：{{videoMsg.videoCreateTime | parseDate}}</span>
      </div>
    </div>
    <div class="about-comment">
      <div class="title flieds">评论({{videoMsg.commentCount?videoMsg.commentCount:0}})</div>
      <div v-if="videoMsg.commentCount == 0" class="flieds" style="text-align: center;">暂无评论~</div>
      <div v-else class="comment-wrap">
        <div class="comment">
          <commentInner @addCommentCount="addCommentCount" v-for="(item, index) in nowPageList" :key="index" :commentList="item"></commentInner>
        </div>
        <div class="page-box flied clearfix" style="background-color:#fff; padding-top:20px;">
          <div class="float-left" style="width:100px;padding: 10px 0 10px 20px;">{{nowPage}}/{{totalPage}}页</div>
          <div class="page-btn-wrap float-left clearfix" >
            <div class="btn float-left" v-show="nowPage > 3" @click="nowPage -= 2">...</div>
            <div  v-for="(item, index) in totalPage>=5?5:totalPage" :key="index" class="page-btn btn float-left" :class="{on: nowPage == centerPage + item - 3}" @click="nowPage = centerPage - 3 + item">{{centerPage + item - 3}}</div>
            <div class="btn float-left" v-show="nowPage < totalPage - 2" @click="nowPage += 2">...</div>
            <div class="float-right flied">
              <span>跳转至</span><input style="border: 1px solid #666; width: 30px; height: 30px; margin:0 10px; border-radius: 10px;" type="number" :max="totalPage" min="1" v-model="jumpPage"><span>页</span>
              <div class="btn" @click="jumpToPage">确定</div>
            </div>
          </div>
        </div>
      </div>
      <div class="send-comment-wrap">
        <div class="flieds">发表评论：</div>
        <textarea class="send-comment-input flieds" cols="50" width="100%" v-model="comment" placeholder="输入您的评论内容"></textarea>
        <div class="btn-wrap flieds clearfix">
          <button @click="sendComment()">提交</button>
          <span>{{50 - comment.length}}/50</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import commentInner from './vCommentInner'

export default {
  data() {
    return {
      totalPage: 0,
      authorMsg: {},
      //每页评论数量
      perNumber: 10,
      //当前评论页
      nowPage: 1,
      inited: false,
      comment: "",
      //评论列表
      commentList: {},
      //当前需要展示的评论列表
      nowPageList: [],
      jumpPage: 1
    }
  },
  props: ['videoMsg', 'user', 'sysType'],
  computed: {
    videoLabelparsed() {
      return this.videoMsg.videoLabel?this.videoMsg.videoLabel.split(","):""
    },
    //计算中心页
    centerPage() {
      if (this.nowPage <= 3) {
        return 3
      } else if (this.nowPage >= this.totalPage - 2) {
        return this.totalPage - 2
      } else {
        return this.nowPage
      }
    }
  },
  watch: {
    videoMsg: {
      handler(val) {
        if ('videoname' in val) {
          this.queryAuthorMsg()
          this.getComment()
          this.getPageNumber()
        }
      }
    },
    comment(val) {
      if (val.length >50) {
        this.comment = val.slice(0, 50)
      }
    },
    nowPage: {
      handler(val) {
        //如果已经加载过这一页
        if (('page' + val) in this.commentList) {
          console.log('已经加载缓存数据页' + val)
          this.nowPageList = this.commentList['page' + val]
        } else {
          //如果没有加载过
          this.getComment()
        }
      }
    }
  },
  methods: {
    //查询作者信息
    queryAuthorMsg() {
      this.$http.get('video/getAuthorMsg', {
        params: {
          videoID: this.videoMsg.videoID
        }
      }).then(res => {
        if (res.data.ok) {
          this.authorMsg = res.data.data
        } else {
          this.$toast('获取作者信息失败！')
        }
      })
    },
    //获取评论
    getComment() {
      this.$http.get('video/getComment', {
        params: {
          videoID: this.videoMsg.videoID,
          number: this.perNumber,
          page: this.nowPage
        }
      }).then(res => {
        if (res.data.ok) {
          this.commentList['page' + this.nowPage] = res.data.data
          if (!this.inited) {
            this.nowPageList = this.commentList['page' + this.nowPage]
            this.inited = true
          }
          //获取所有对象username
          this.commentList['page' + this.nowPage].forEach((item, index) => {
            item.reply.forEach((item2, index2) => {
              this.$http.get('getUserName', {
                params: {
                  userID: item2.replyToUserID
                }
              }).then(res => {
                if (res.data.ok)
                  item2.replyToUserName = res.data.data
                else
                  this.$toast(res.ret_msg)
              })
            })
          })
          
        } else {
          this.$toast(res.data.ret_msg)
        }
      })
    },
    //提交评论
    sendComment() {
      if (this.comment.length == 0) {
        this.$toast('评论不能为空')
        return
      }
      if (this.comment.length > 50) {
        this.$toast('评论不能超过50字')
        return
      }
      this.$http.get('video/sendComment', {
        params: {
          userID: this.user.userID,
          videoID: this.videoMsg.videoID,
          commentContent: this.comment
        }
      }).then(res => {
        this.$toast(res.data.ret_msg)
        this.comment = ""
        this.videoMsg.commentCount++
        //重新获取最新评论
        this.init()
      })
    },
    //初始化评论区
    init() {
      this.nowPageList = []
      this.commentList = {}
      this.inited = false
      this.nowPage = 1
      this.getComment()
      this.getPageNumber()
    },
    addCommentCount() {
      this.videoMsg.commentCount++
    },
    //获得最新页数
    getPageNumber() {
      this.$http.get('video/getPageNumber', {
        params: {
          videoID: this.videoMsg.videoID,
          perNumber: this.perNumber
        }
      }).then(res => {
        if (res.data.ok) {
          this.totalPage = res.data.data
        } else {
          this.$toast('获取总页数失败！')
        }
      })
    },
    jumpToPage() {
      if (this.jumpPage <= 0 || this.jumpPage > this.totalPage) {
        this.$toast('请输入正确的页码')
      } else {
        this.nowPage = this.jumpPage
        this.jumpPage = 1
      }
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
  },
  components: {
    commentInner
  }
}
</script>

<style lang="scss" scoped>

@media screen and (max-width: 414px){
  .about-video, .about-comment{
    padding: 0 0!important;
  }
  .others {
    span {
      margin-right: 15px !important;
    }
  }
}

#app-comment {
  margin: 10px 0;
  padding-top: 50px;
  background-color: #fff;

  .btn {
    display: inline-block;
    padding: 10px 10px;
    border-radius: 10px;
    background-color: #00a1e7;
    color: #fff;
    box-sizing: border-box;
    margin: 0 5px 5px 5px;
    cursor: pointer;
    &.on {
      background-color: #f60;
    }
  }

  .flieds {
    padding: 10px 10px;
    box-sizing: border-box;
  }

  .about-video {
    width: 100%;
    box-sizing: border-box;
    background-color: #fff;
    padding: 0 40px;
    .title {
      font-size: 16px;
      color: #666;
    }
    .author {
      width: 100%;
      margin: 0 auto;
      font-size: 18px;
      color: #333;
      font-weight: bold;
      border-bottom: 2px solid #00a1e7;
    }
    .others {
      span {
        margin-right: 50px;
      }
    }
  }

  .about-comment {
    width: 100%;
    box-sizing: border-box;
    padding: 0 40px;
    // height: 500px;
    margin-top: 30px;
    .title {
      font-size: 18px;
      color: #000;
      font-weight: bold;
      border-bottom: 2px solid #00a1e7;
    }
    .comment-wrap {
      background-color: #eee;
    }
    .send-comment-wrap {
      width: 100%;
      .send-comment-input {
        width: 100%;
        height: 80px;
      }
      button {
        float: left;
        padding: 10px 20px;
        border-radius: 2px;
        color: #fff;
        background-color: #00a1e7;
      }
      span {
        float: right;
        line-height: 40px;
      }
    }
  }
}
</style>
