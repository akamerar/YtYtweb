<template>
  <div class="forget_password-wrap">
    <van-cell-group class="form-wrap">
      <van-cell>
        <span style="color: #1989fa; font-size: 20px">忘记密码</span>
      </van-cell>
      <van-field
        label="新密码"
        type="password"
        placeholder="请输入您的新密码"
        v-model="password"
        :error-message="tips1"
      >
      </van-field>
      <van-field
        label="确认密码"
        type="password"
        placeholder="请确认您的新密码"
        v-model="confirmPassword"
        :error-message="tips2"
      >
      </van-field>
      <van-field
        label="手机号"
        placeholder="请输入您注册时绑定的手机号"
        v-model="phone"
      >
      </van-field>
      <van-field
        v-model="sms"
        center
        clearable
        label="短信验证码"
        placeholder="请输入短信验证码"
      >
        <van-button
          slot="button"
          size="small"
          type="info"
          @click="sendSms()"
          :disabled="btnDisabled"
        >{{msg}}</van-button>
      </van-field>
      <van-cell>
        <van-button
          block
          size="small"
          type="info"
          @click="submit()"
        >
        提交
        </van-button>
      </van-cell>
    </van-cell-group>
  </div>
</template>

<script>
import { mapState } from "vuex"
import md5 from 'md5'

export default {
  data() {
    return {
      password: "",
      passwordErr: false,
      tips1: "",
      confirmPassword: "",
      confirmErr: false,
      tips2: "",
      phone: "",
      phoneErr: false,
      sms: "",
      sendSmsStatus: 1,
      btnDisabled: false,
      msg: "发送验证码"
    }
  },
  computed: {
    ...mapState(['user'])
  },
  watch: {
    password() {
      this.passwordErr = this.verifyPassword()
    },
    confirmPassword() {
      this.confirmErr = this.verifyConfirm()
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
    verifyPassword(){
      if (this.password === ''){
        this.tips1 = ''
        return false
      }
      //6-16字符
      var reg1 = /^[\w`!~@#$%^&*()+-?<>]{6,16}$/g
      //包含英文和数字
      var reg2 = /\d+/g
      var reg3 = /[a-zA-Z]+/g
      if (!reg1.test(this.password)) {
        this.tips1 = "请输入6-16字符密码，不能包含空格"
        return true
      } else if (!(reg2.test(this.password) && reg3.test(this.password))){
        this.tips1 = "密码必须包含数字和字母"
        return true
      } else {
        this.tips1 = ""
        this.confirmErr = this.verifyConfirm()
        return false
      }
    },
    //2.重复密码检测
    verifyConfirm(){
      if (this.verifyPassword === ""){
        this.tips2 = ""
        return false
      }
      if (this.password != this.confirmPassword){
        this.tips2 = "两次输入密码不一致"
        return true
      } else {
        this.tips2 = ""
        return false
      }
    },
    //检查手机合法性
    verifyPhone(){
      if (this.phone === ""){
        this.$toast("手机号不能为空")
        this.phoneErr = false
      }
      var reg = /^1[0-9]{10}$/
      if (!reg.test(this.phone)) {
        this.$toast("您输入的手机号有误")
        this.phoneErr = true
      } else {
        //验证手机是否注册
        this.$http.get('searchPhone', {
          params: {
            phone: this.phone
          }
        }).then(res => {
          if (!res.data.ok) {
            this.$toast('此手机号未注册')
            this.phoneErr = true
          } else {
            this.phoneErr = false
          }
        })
      }
    },
    sendSms(){
      this.verifyPhone()
      if (this.phoneErr) {
        return false
      } else {
        this.sendSmsStatus = 2
        this.$http.get('smsCode', {
          params: {
            "phone": this.phone,
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
      }
    },
    submit() {
      if (this.password == '' || this.confirmPassword == '' || this.sms == "" ) {
        this.$toast({
          message: '请保证表单完整！',
          duration: 1000
        })
      } else if (this.passwordErr || this.confirmErr) {
        this.$toast({
          message: '请确认表单正确',
          duration: 1000
        })
      } else {
        this.$http.get('userCenter/security/verifySmsCode', {
          params: {
            code: this.sms,
            phone: this.phone,
            purpose: 'changePassword'
          }
        }).then(res => {
          if (res.data.ok) {
            //验证成功
            //1.加密
            var salt = parseInt(Math.random()*1000).toString()
            var password = md5(this.password + salt)
            //发送
            this.$http.get('forgetPassword/setNewPassword', {
              params: {
                phone: this.phone,
                password,
                salt
              }
            }).then(res => {
              if (res.data.ok) {
                this.$toast('修改成功')
                this.$router.push({
                  path: "/login"
                })
              } else {
                this.$toast(res.data.ret_msg)
              }
            })
          } else if (res.data.err == 1) {
            this.$toast('验证码错误')
          } else {
            this.$toast('验证码已过期')
          }
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@media screen and (max-width: 1420px) {
  .forget_password-wrap {
    width: 800px !important;
  }
}
@media screen and (max-width: 960px) {
  .forget_password-wrap {
    width: 100% !important;
  }
}
@media screen and (max-width: 780px) {
  .forget_password-wrap {
    margin-top: 0 !important;
  }
}

// 1420px
.forget_password-wrap {
  width: 1000px;
  margin: 30px auto 0;
  background-color: #fff;
  .form-wrap {
    width: 362px;
    padding: 30px 0;
    margin: 0 auto;
  }
}
</style>



