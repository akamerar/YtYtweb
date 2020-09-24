<template>
  <van-cell-group class="cell-wrap">
    <van-field
      v-model="nowPhone"
      center
      disabled
      label="当前手机为"
      input-align="center"
    >
      <van-button
        slot="button"
        size="small"
        type="info"
        to="/userCenter/security"
        plain
      >更改绑定</van-button>
    </van-field>
    <van-field
      v-model.trim="sms"
      center
      clearable
      label="短信验证码"
      placeholder="请输入短信验证码"
    >
      <van-button
        slot="button"
        size="small"
        type="info"
        :disabled="btnDisabled"
        @click="sendSms()"
      >{{msg}}</van-button>
    </van-field>
    <van-cell>
      <van-button
        size="small"
        type="info"
        block
        @click="submitSms()"
      >
      提交
      </van-button>
    </van-cell>
  </van-cell-group>
</template>

<script>
import { mapState, mapMutations } from "vuex";

export default {
  data() {
    return {
      timer: 0,
      sms: "",
      //1:发送验证码 2：正在发送 3：已经发送 4：服务器错误
      sendSmsStatus: 1,
      btnDisabled: false,
      msg: "发送验证码"
    }
  },
  watch: {
    sendSmsStatus(val){
      switch (val) {
        case 1: 
          this.msg = "发送验证码"
          break
        case 2: 
          this.msg = "正在发送"
          break
        case 3:
          var time = 60
          this.timer = setInterval(() => {
            time--
            this.msg = `${time}s`
            this.btnDisabled = true
            if (time==0) {
              this.btnDisabled = false
              this.sendSmsStatus = 1
              clearInterval(this.timer)
            }
          }, 1000)
          break
        case 4: 
          this.msg = "服务器错误"
          break
      }
      return this.msg
    }
  },
  computed: {
    ...mapState(["user"]),
    nowPhone() {
      return this.user.phone
        ? this.user.phone.start + "*****" + this.user.phone.end
        : "加载中..."
    }
  },
  beforeDestroy(){
    clearInterval(this.timer)
  },
  methods: {
    ...mapMutations(['changeHasSmsVerify']),
    sendSms(){
      this.sendSmsStatus = 2
      this.$http.get('smsCode', {
        params: {
          "phone": this.user.phone.all,
          "purpose": "changePassword"
        }
      }).then(res => {
        if (res.data.ok) {
          this.sendSmsStatus = 3
        } else {
          this.sendSmsStatus = 4
          this.$toast.fail({
            message: "您今天已经发了过多验证码",
            duration: 1000
          })
        }
      })
    },
    submitSms(){
      this.$http.get('userCenter/security/verifySmsCode', {
        params: {
          phone: this.user.phone.all,
          code: this.sms,
          purpose: "changePassword"
        }
      }).then(res => {
        if (res.data.ok) {
          this.changeHasSmsVerify("changePassword")
          this.$router.push({
            path: '/userCenter/changePassword/basePage'
          })
          this.$toast.success({
            message: '验证成功',
            duration: 1000
          })
        } else if (res.data.err == 0) {
          this.$toast.fail({
            message: '验证码已过期',
            duration: 1000
          })
        } else {
          this.$toast.fail({
            message: '验证码错误',
            duration: 1000
          })
        }
      })
    }
  },
}
</script>

<style lang="scss" scoped>
.cell-wrap {
  padding-top: 2.5rem;
}
</style>

