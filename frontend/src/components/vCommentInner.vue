<template>
  <div class="comment-box clearfix">
    <div class="author flied">{{commentList.username}}:</div>
    <div class="content flied">{{commentList.commentContent}}</div>
    <!-- 评论回复 -->
    <div class="re-reply-box flied" v-if="commentList.reply.length">
      <div class="flied" style="padding-top:0">
        <div class="re-reply-title" style="font-size: 12px; color:#00a1e7;cursor:pointer;" @click="showReReplyBox = !showReReplyBox">{{reBoxMsg}}</div>
        <div class="re-reply" v-show="showReReplyBox" v-for="(item, index) in commentList.reply" :key="index">
          <div style="font-size: 12px; padding-top: 10px;">
            <span style="color:#00a1e7">{{item.username}}</span><span>回复</span><span style="color:#00a1e7" v-text="item.replyType == '0'?'楼主':item.replyToUserName"></span>
            <div class="re-reContent flied">{{item.replyContent}}</div>
            <sendReply :commentID="commentList.commentID" :item="item" @addReply="addReply"></sendReply>
          </div>
        </div>
      </div>
    </div>
    <div class="time-reply flied clearfix">
      <div class="time">{{commentList.commentCreateTime | parseDate}}</div>
      <div class="reply" @click="showReply = true">回复</div>
    </div>
    <div class="reply-input-box flied" v-show="showReply">
      <textarea class="reply-input" v-model="reply" placeholder="请输入您的回复"></textarea>
      <div class="info-btn clearfix">
        <div class="float-left" style="font-size: 12px;">{{reastNumber}}/50</div>
        <div class="float-right">
          <div @click="showReply = false" style="font-size: 12px;color: #00a1e7; display:inline-block; cursor:pointer">取消</div>
          <div @click="sendReply()" style="font-size: 12px;color: #00a1e7; display:inline-block; cursor:pointer">发送</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import sendReply from './vSendReply'
import {mapState} from 'vuex'

export default {
  data() {
    return {
      //回复评论隐藏显示
      showReply: false,
      reply: "",

      //显示评论列表
      showReReplyBox: false,
    }
  },
  props: ['commentList'],
  computed: {
    ...mapState(['user']),
    reastNumber() {
      return 50 - this.reply.length
    },
    reBoxMsg() {
      return this.showReReplyBox?"收起回复列表":"查看回复列表"
    }
  },
  methods: {
    sendReply() {
      if (this.reply == "") {
        this.$toast('回复内容不能为空')
        return false
      } else if (this.reply.length > 50) {
        this.$toast('回复内容不能超过50字')
        return false
      } else {
        this.$http.get('video/sendReply', {
          params: {
            commentID: this.commentList.commentID,
            replyUserID: this.user.userID,
            replyToUserID: this.commentList.userID,
            videoID: this.$route.params.videoID,
            replyContent: this.reply,
            replyType: "0"
          }
        }).then(res => {
          if (res.data.ok) {
            this.addReply({
              commentID: this.commentList.commentID,
              replyUserID: this.user.userID,
              replyToUserID: this.commentList.userID,
              videoID: this.$route.params.videoID,
              replyContent: this.reply,
              replyToUserName: this.commentList.username,
              username: this.user.username,
              replyType: "0",
              replyCreateTime: new Date()
            })
          }
          this.showReply = false
          this.reply = ""
          this.$toast(res.data.ret_msg)
        })
      }
    },
    addReply(msg) {
      this.commentList.reply.unshift(msg)
      this.$emit('addCommentCount')
    }
  },
  filters: {
    parseDate(val) {
      var arr = []
      var arr2 = []
      var date = new Date(val)
      arr.push(date.getFullYear())
      arr.push(date.getMonth() + 1)
      arr.push(date.getDate())
      arr2.push(date.getHours())
      arr2.push(date.getMinutes())
      arr2.push(date.getSeconds())
      return arr.join('-') + "  " + arr2.join(':')
    }
  },
  mounted() {

  },
  components: {
    sendReply,
  }
}
</script>

<style lang="scss" scoped>
  .flied {
    padding: 10px 20px;
    font-size: 14px;
    box-sizing: border-box;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .comment-box {
    width: 100%;
    margin: 10px 0;
    background-color: #fff;
    .author {
      color: #00a1e7;
      font-size: 16px;
      width: 200px;
    }
    .content {
      text-indent: 20px;
    }
    .time-reply {
      .time {
        float: left;
        font-size: 12px;
      }
      .reply {
        float: right;
        font-size: 12px;
        color: #00a1e7;
        cursor: pointer;
      }
    }
    .reply-input-box {
      width: 100%;
      .reply-input {
        width: 100%;
        height: 100px;
        padding: 10px;
        box-sizing: border-box;
      }
    }
  }
</style>