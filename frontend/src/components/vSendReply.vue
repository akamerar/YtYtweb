<template>
  <div>
    <div class="time-reply flied clearfix">
      <div class="time">{{item.replyCreateTime | parseDate}}</div>
      <div
        class="reply"
        @click="showReReply = true"
      >回复</div>
    </div>
    <div
      class="reply-input-box flied"
      v-show="showReReply"
    >
      <textarea
        class="reply-input"
        v-model="reReply"
        placeholder="请输入您的回复"
      ></textarea>
      <div class="info-btn clearfix">
        <div
          class="float-left"
          style="font-size: 12px;"
        >{{reReastNumber}}/50</div>
        <div class="float-right">
          <div
            @click="showReReply = false"
            style="font-size: 12px;color: #00a1e7; display:inline-block; cursor:pointer"
          >取消</div>
          <div
            @click="sendReReply()"
            style="font-size: 12px;color: #00a1e7; display:inline-block; cursor:pointer"
          >发送</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {mapState} from 'vuex'

export default {
  data() {
    return {
      reReply: "",
      showReReply: false
    }
  },
  props:['item', 'commentID'],
  computed: {
    ...mapState(['user']),
    reReastNumber() {
      return 50 - this.reReply.length;
    }
  },
  methods: {
    sendReReply() {
      if (this.reReply == ""){
        this.$toast('回复内容不能为空')
        return
      }
      if (this.reReply.length > 50) {
        this.$toast('回复内容不能超过50字')
        return
      }
      this.$http.get('video/sendReply', {
        params: {
          commentID: this.commentID,
          replyUserID: this.user.userID,
          replyToUserID: this.item.replyToUserID,
          videoID: this.$route.params.videoID,
          replyContent: this.reReply,
          replyType: "1"
        }
      }).then(res => {
        if (res.data.ok) {
          this.$toast(res.data.ret_msg)
          this.$emit('addReply', {
            commentID: this.commentID,
            replyUserID: this.user.userID,
            replyToUserID: this.item.replyUserID,
            videoID: this.$route.params.videoID,
            replyContent: this.reReply,
            replyType: "1",
            replyCreateTime: new Date(),
            username: this.user.username,
            replyToUserName: this.item.username
          })
          this.showReReply = false
          this.reReply = ""
        } else {
          this.$toast(res.data.ret_msg)
        }
      })
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
</style>
