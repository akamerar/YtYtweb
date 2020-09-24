<template>
  <van-cell-group class="cell-wrap">
    <van-field
      label="新手机号:"
      v-model="phone"
      placeholder="请输入新手机号"
      :error-message="errMsg"
    >
    </van-field>
    <van-field
      label="验证码:"
      v-model="code"
      placeholder="请输入验证码"
      center
    >
      <van-button
        slot="button"
        size="small"
        type="info"
        :disabled="btnDisabled"
        @click="sendCode()"
      >{{msg}}</van-button>
    </van-field>
    <van-cell>
      <van-button
        type="info"
        block
        size="small"
        @click="verifyCode()"
      >
        提交
      </van-button>
    </van-cell>
  </van-cell-group>
</template>

<script>
import { mapState } from 'vuex'

export default {
  data() {
    return {
      phone: "",
      isPhoneErr: true,
      errMsg: "",
      code: "",
      msg: "发送验证码",
      //1:发送验证码 2：正在发送 3：已经发送 4：服务器错误
      sendSmsStatus: 1,
      btnDisabled: false,
    }
  },
  created(){
    if (!this.hasSmsVerify.setPhone) {
      this.$router.push({
        path: '/userCenter/security/verifySmsCode?to=setPhone'
      })
    }
  },
  computed: {
    ...mapState(['user', 'hasSmsVerify']),
  },
  watch: {
    phone(val){
      this.isPhoneErr = this.verifyPhone()
    },
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
          var timer = setInterval(() => {
            time--
            this.msg = `${time}s`
            this.btnDisabled = true
            if (time==0) {
              this.btnDisabled = false
              this.sendSmsStatus = 1
              clearInterval(timer)
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
  methods: {
    //手机合法性检测
    verifyPhone(){
      if (this.phone === ""){
        this.errMsg = ""
        return true
      }
      var reg = /^1[0-9]{10}$/
      if (!reg.test(this.phone)) {
        this.errMsg = "您输入的手机号有误"
        return true
      } else {
        //验证手机是否注册
        this.$http.get('register/verifyPhone', {
          params: {
            phone: this.phone
          }
        }).then(res => {
          if (!res.data.ok) {
            this.errMsg = '服务器出错'
            this.isPhoneErr = true
            return false
          } else {
            if (res.data.data.length > 0) {
              //手机号已经注册
              this.errMsg = '手机号已经注册过'
              this.isPhoneErr = true
            } else {
              //手机号可以注册
              this.errMsg = '手机号可以注册'
              this.isPhoneErr = false
            }
          }
        })
      }
    },
    sendCode(){
      if (this.isPhoneErr) {
        this.$toast.fail({
          message: "请检查手机号是否有误",
          duration: 1000
        })
        return false
      }
      this.sendSmsStatus = 2
      this.$http.get('smsCode',{
        params: {
          phone: this.phone
        }
      }).then(res => {
        if (res.data.ok) {
          this.sendSmsStatus = 3
        } else {
          this.sendSmsStatus = 4
        }
      })
    },
    //验证验证码正确性
    verifyCode(){
      if (this.isPhoneErr) {
        this.$toast.fail({
          message: "请检查手机号是否有误",
          duration: 1000
        })
        return false
      }
      this.$http.get('userCenter/security/verifySmsCode', {
        params: {
          phone: this.phone,
          code: this.code
        }
      }).then(res => {
        if (res.data.ok) {
          this.submit()
        } else {
          this.$toast.fail({
            message: res.data.ret_msg,
            duration: 1000
          })
        }
      })
    },
    //提交信息
    submit(){
      if (this.isPhoneErr) {
        this.$toast.fail({
          message: "请检查手机号是否有误",
          duration: 1000
        })
        return false
      }
      this.$http.get('userCenter/security/setPhone', {
        params: {
          userID: this.user.userID,
          phone: this.phone
        }
      }).then(res => {
        if (res.data.ok) {
          this.$toast.success({
            message: "修改成功",
            duration: 1000
          })
          this.$router.push({
            path: '/userCenter/security'
          })
        } else {
          this.$toast.fail({
            message: '修改失败，请重试',
            duration: 1000
          })
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.cell-wrap {
  padding-top: 1.875rem;
}
</style>
