<template>
  <div class="register-wrap">
    <div class="register-box">
      <div class="register-top">
        <p>注册</p>
        <div class="tips" v-text="usernameWrong||passwordWrong||confirmPasswordWrong||phoneWrong?tips:''"></div>
      </div>
      <div class="register-content">
        <input
          class="username"
          :class="{wrong: usernameWrong}"
          type="text"
          name="username"
          @focus="verifyUsername()"
          placeholder="请输入您的账号：3-10字符"
          v-model="username"
        >
        <input
          class="password"
          :class="{wrong: passwordWrong}"
          type="password"
          name="password"
          @focus="verifyPassword()"
          placeholder="请设置您的密码：6-16字符，包含数字、字母"
          v-model="password"
        >
        <input
          class="confirmPassword"
          :class="{wrong: confirmPasswordWrong }"
          type="password"
          name="confirmPassword"
          @focus="verifyConfirm()"
          placeholder="请重新输入您的密码"
          v-model="confirmPassword"
        >
        <div class="phone-verify">
          <div class="phone-box clearfix" :class="{focus: isPhoneBoxFocus, wrong: phoneWrong}">
            <i class="badge">+86</i>
            <input type="text" name="phone" v-model="phone" @blur="isPhoneBoxFocus = false" @focus="commitVerifyPhone()" placeholder="请输入您的手机号码">
          </div>
          <div class="phoneVerifyCode-box clearfix">
            <input type="text" name="phoneVerifyCode" v-model="phoneVerifyCode" @blur="isPhoneVerifyCode = false" @focus="isPhoneVerifyCode = true" placeholder="输入验证码">
            <button @click="getPhoneVerifyCode($event)">获取验证码</button>
          </div>
        </div>
        <div class="extra-option clearfix">
          <label class="agree-protocol">
            <input
              type="checkbox"
              v-model="agree"
            >
            同意<a
              href="#"
              style="color: rgb(104, 175, 233)"
              title="用户协议"
            >《用户协议书》</a>
          </label>
        </div>
        <button @click="submit($event)">注册</button>
        <p class="jumpToLogin">
          已有账号？立即
          <router-link to="/login">登录</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { mapMutations } from "vuex"
//加盐算法
import md5 from 'md5'

export default {
  data() {
    return {
      username: "",
      password: "",
      confirmPassword: "",
      phone: "",
      phoneVerifyCode: "",

      //输入手机号表单focus
      isPhoneBoxFocus: false,
      isPhoneVerifyCode: false,

      //同意协议
      agree: false,

      tips: '',

      //表单验证样式
      usernameWrong: false,
      passwordWrong: false,
      confirmPasswordWrong: false,
      phoneWrong: false
    };
  },
  computed: {

  },
  watch: {
    username(){
      this.usernameWrong = this.verifyUsername()
    },
    password(){
      this.passwordWrong = this.verifyPassword()
      if (this.confirmPassword != ''){
        this.confirmPasswordWrong = this.verifyConfirm()
      }
    },
    confirmPassword(){
      this.confirmPasswordWrong = this.verifyConfirm()
    },
    phone(){
      this.phoneWrong = this.verifyPhone()
    }
  },
  methods: {
    ...mapMutations(["changeUser"]),
    commitVerifyPhone(){
      this.isPhoneBoxFocus = true
      this.verifyPhone()
    },
    //用户名检测
    verifyUsername(){
      if (this.username === ''){
        this.tips = ''
        return false
      }
      //检测是否有空格
      var reg1 = /[\s\./]+/g
      //检测字符长度3-10
      var reg2 = /^[\w\u4e00-\u9fa5]{3,10}$/g
      if (reg1.test(this.username)) {
        this.tips = '用户名不能存在空格等非法字符'
        return true
      } else if (reg2.test(this.username)) {
        //前端验证完毕，后台验证
        this.$http.get('register/verifyUsername', {
          params: {
            username: this.username
          }
        }).then(res => {
          this.tips = res.data.ret_msg
          //数据库处理成功回执
          if (res.data.ok) {
            if (res.data.hasUser) {
              this.usernameWrong = true
            } else {
              this.usernameWrong = false
            }
          }
        })
      } else {
        this.tips = '请输入3-10字用户名，不能有非法字符'
        return true
      }
    },
    //密码检测
    //1.密码安全性检测 6-16字符 要有英文和数字
    verifyPassword(){
      if (this.password === ''){
        this.tips = ''
        return false
      }
      //6-16字符
      var reg1 = /^[\w`!~@#$%^&*()+-?<>]{6,16}$/g
      //包含英文和数字
      var reg2 = /\d+/g
      var reg3 = /[a-zA-Z]+/g
      if (!reg1.test(this.password)) {
        this.tips = "请输入6-16字符密码，不能包含空格"
        return true
      } else if (!(reg2.test(this.password) && reg3.test(this.password))){
        this.tips = "密码必须包含数字和字母"
        return true
      } else {
        this.tips = "密码可以使用"
        return false
      }
    },
    //2.重复密码检测
    verifyConfirm(){
      if (this.verifyPassword === ""){
        this.tips = ""
        return false
      }
      if (this.password != this.confirmPassword){
        this.tips = "两次输入密码不一致"
        return true
      } else {
        this.tips = ""
        this.verifyPassword()
        return false
      }
    },
    //手机合法性检测
    verifyPhone(){
      if (this.phone === ""){
        this.tips = ""
        return false
      }
      var reg = /^1[0-9]{10}$/
      if (!reg.test(this.phone)) {
        this.tips = "您输入的手机号有误"
        return true
      } else {
        //验证手机是否注册
        this.$http.get('register/verifyPhone', {
          params: {
            phone: this.phone
          }
        }).then(res => {
          if (!res.data.ok) {
            this.tips = '服务器出错'
            this.phoneWrong = true
            return false
          } else {
            if (res.data.data.length > 0) {
              //手机号已经注册
              this.tips = '手机号已经注册过'
              this.phoneWrong = true
            } else {
              //手机号可以注册
              this.tips = '手机号可以注册'
              this.phoneWrong = false
            }
          }
        })
      }
    },
    //获取手机验证码
    getPhoneVerifyCode(event){
      var event = event
      if (this.phoneWrong || this.phone === ''){
        this.tips = '请输入正确的手机号再获取验证码'
        return false
      }
      this.$http.get('smsCode', {
        params: {
          phone: this.phone,
          purpose: "register"
        }
      }).then(res => {
        if (res.data.ok) {
          event.target.disabled = true
          var timeLimit = 60
          var timer = setInterval(() => {
            event.target.style.backgroundColor = "#c8c8c8"
            event.target.innerText = "验证码已发送:" + timeLimit + "s"
            timeLimit--
            if(timeLimit === 0){
              clearInterval(timer)
              event.target.disabled = false
              event.target.innerText = "获取验证码"
              event.target.style.backgroundColor = "rgb(104, 175, 233)"
            }
          }, 1000);
        } else {
          event.target.innerText = "服务器未响应"
        }
      })
    },
    //点击注册按钮提交
    submit(event) {
      var dom = event.target
      //判断是否有空表单
      if (!(this.username && this.password && this.confirmPassword && this.phone && this.phoneVerifyCode)) {
        this.tips = '请检查表单是否完整'
        return false
      }
      //判断表单是否有错
      if (this.usernameWrong || this.passwordWrong || this.confirmPasswordWrong || this.phoneWrong) {
        this.tips = '请检查表单是否无误'
        return false
      }
      //是否同意协议
      if (!this.agree) {
        this.tips = '请同意协议完成注册'
        return false
      }
      //md5加密并验证验证码是否正确
      //1.加密
      var salt = parseInt(Math.random()*1000).toString()
      var password = md5(this.password + salt)
      //2.请求
      this.$http.get('register/verifySmsCode', {
        params: {
          username: this.username,
          password,
          salt,
          phone: this.phone,
          code: this.phoneVerifyCode
        }
      }).then(res => {
        //注册失败
        if (!res.data.ok) {
          if (res.data.status === 0 || res.data.status === 1) {
            this.tips = '验证码已过期'
            return false
          } else if (res.data.status === 2) {
            this.tips = '手机验证码错误'
            return false
          }
        } else {
          //注册成功
          alert('注册成功！即将返回登录页面')
          this.$router.push('/login')
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@media screen and (max-width: 520px) {
  #app-contain {
    width: calc(100% - 4px) !important;
    width: -o-calc(100% - 4px) !important;
    width: -webkit-calc(100% - 4px) !important;
    width: -ms-calc(100% - 4px) !important;
    width: -moz-calc(100% - 4px) !important;
    .register-wrap {
      padding-top: 0 !important;
      .register-box {
        width: calc(100% - 2.5rem) !important;
      }
    }
  }
}

//验证码css设置
#v_container {
  width: 30%;
  height: 2.8125rem;
  margin-left: 0.625rem;
}
#verifyCanvas {
  width: 100%;
  height: 100%;
  cursor: pointer;
}
input.wrong {
  border-color: rgb(228, 10, 10) !important;
}

.register-wrap {
  width: 100%;
  padding: 1.25rem 0;
  background: #9ee;
  .register-box {
    width: 23.75rem;
    padding: 1.25rem 1.25rem;
    margin: 0 auto;
    border-radius: 0.625rem;
    -ms-border-radius: 0.625rem;
    -webkit-border-radius: 0.625rem;
    -o-border-radius: 0.625rem;
    -moz-border-radius: 0.625rem;
    background-color: rgba(230, 230, 230, 0.5);
    box-shadow: 0px 5px 30px 5px #fff;
    -webkit-box-shadow: 0px 5px 30px 5px #fff;
    -ms-box-shadow: 0px 5px 30px 5px #fff;
    -o-box-shadow: 0px 5px 30px 5px #fff;
    -moz-box-shadow: 0px 5px 30px 5px #fff;
    .register-top {
      position: relative;
      border-bottom: 2px solid #68afe9;
      padding: 0.9375rem 1.25rem;
      p {
        font-size: 1.875rem;
        color: #68afe9;
      }
      .tips {
        position: absolute;
        top: 30%;
        left: 50%;
        color: rgb(228, 10, 10);
        text-align: center
      }
    }
    .register-content {
      width: 100%;
      padding: 1.25rem 0;
      .phone-verify {
        width: 100%;
        margin: 0.625rem auto; //10px
        .phone-box {
          margin: 0.625rem auto;
          width: 100%;
          &.focus {
            .badge, >input {
              border-color: #68afe9;
            }
          }
          &.wrong {
            .badge, >input {
              border-color: rgb(228, 10, 10);
            }
          }
          .badge {
            float: left;
            display: inline-block;
            height: 2.8125rem;
            width: 15%;
            text-align: center;
            line-height: 2.8125rem; //45px
            background-color: rgb(200, 200, 200);
            border: 2px solid transparent;
            border-right: none;
            border-top-left-radius: 0.625rem;
            -ms-border-top-left-radius: 0.625rem;
            -webkit-border-top-left-radius: 0.625rem;
            -o-border-top-left-radius: 0.625rem;
            -moz-border-top-left-radius: 0.625rem;
            border-bottom-left-radius: 0.625rem;
            -ms-border-bottom-left-radius: 0.625rem;
            -webkit-border-bottom-left-radius: 0.625rem;
            -o-border-bottom-left-radius: 0.625rem;
            -moz-border-bottom-left-radius: 0.625rem;
            transition: border-color ease .5s;
          }
          >input {
            float: left;
            width: calc(85% - 4px);
            height: 2.8125rem;
            background-color: rgb(232, 240, 230);
            border: 2px solid transparent;
            border-left: none;
            border-top-right-radius: 0.625rem;
            -ms-border-top-right-radius: 0.625rem;
            -webkit-border-top-right-radius: 0.625rem;
            -o-border-top-right-radius: 0.625rem;
            -moz-border-top-right-radius: 0.625rem;
            border-bottom-right-radius: 0.625rem;
            -ms-border-bottom-right-radius: 0.625rem;
            -webkit-border-bottom-right-radius: 0.625rem;
            -o-border-bottom-right-radius: 0.625rem;
            -moz-border-bottom-right-radius: 0.625rem;
            text-indent: 0.625rem;
            font-size: 1rem;
            transition: border-color ease .5s;
          }
        }
        .phoneVerifyCode-box {
          margin: 0.625rem auto;
          width: 100%;
          >input{
            float: left;
            width: 50%;
            height: 2.8125rem;//45px
            border: 2px solid transparent;
            border-radius: 0.625rem;
            -ms-border-radius: 0.625rem;
            -webkit-border-radius: 0.625rem;
            -o-border-radius: 0.625rem;
            -moz-border-radius: 0.625rem;
            text-indent: 0.625rem;
            text-indent: 1.25rem;
            background-color: rgb(232, 240, 230);
            font-size: 1rem;
            transition: border-color .5s;
            &:focus{
              border-color: #68afe9;
            }
          }
          >button {
            float: left;
            cursor: pointer;
            width: 40%;
            height: 2.5rem;//40px
            margin: 0.2813rem 0 0.2813rem 1.25rem;
            color: #fff;
            background-color: #68afe9;
            border-radius: 0.625rem;
            -ms-border-radius: 0.625rem;
            -webkit-border-radius: 0.625rem;
            -o-border-radius: 0.625rem;
            -moz-border-radius: 0.625rem;
          }
        }
      }
      >input {
        border: 2px solid transparent;
        border-radius: 0.625rem;
        -ms-border-radius: 0.625rem;
        -webkit-border-radius: 0.625rem;
        -o-border-radius: 0.625rem;
        -moz-border-radius: 0.625rem;
        display: block;
        width: calc(100% - 4px);
        width: -o-calc(100% - 4px);
        width: -moz-calc(100% - 4px);
        width: -webkit-calc(100% - 4px);
        width: -ms-calc(100% - 4px);
        height: 2.8125rem; //45px
        margin: 0.625rem auto; //10px
        text-indent: 1.25rem;
        font-size: 1rem;
        color: #333;
        background-color: rgb(232, 240, 230);
        transition: border-color 0.5s;
        -webkit-transition: border-color 0.5s;
        -o-transition: border-color 0.5s;
        -moz-transition: border-color 0.5s;
        -ms-transition: border-color 0.5s;
        background-color: rgb(232, 240, 254);
        &:focus {
          border-color: #68afe9;
        }
      }
      .extra-option {
        width: 100%;
        margin: 1.25rem auto;
        label {
          float: left;
          width: 50%;
          text-align: center;
          font-size: 1rem;
        }
      }
      >button {
        cursor: pointer;
        width: 100%;
        height: 3.125rem;
        text-align: center;
        line-height: 3.125rem;
        font-size: 1.25rem;
        color: #fff;
        background-color: rgb(104, 175, 233);
        padding: 0;
        border-radius: 0.5rem;
      }
      .jumpToLogin {
        margin-top: 1.25rem;
        font-size: 1rem;
        text-indent: 1.25rem;
        a {
          color: rgb(221, 169, 72);
        }
      }
    }
  }
}
</style>
