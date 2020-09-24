<template>
  <div class="login-wrap">
    <div class="login-box">
      <div class="login-top">
        <p>登录</p>
        <div class="tips">{{tips}}</div>
      </div>
      <div class="login-content">
        <input
          class="username"
          :class="{wrong: userOrPswWrong}"
          type="text"
          name="username"
          placeholder="请输入您的账号/手机号"
          v-model="username"
        >
        <input
          class="password"
          :class="{wrong: userOrPswWrong}"
          type="password"
          name="password"
          placeholder="请输入您的密码"
          v-model="password"
        >
        <div
          id="v_container"
          title="点击换图"
        >
          <canvas id="verifyCanvas">您的浏览器不支持canvas</canvas>
        </div>
        <input
          type="text"
          :class="{wrong: verifyWrong}"
          id="code_input"
          value=""
          name="verify"
          placeholder="请输入验证码"
          v-model="verify"
        />
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
          <label class="remPsw">
            <input
              type="checkbox"
              v-model="remPsw"
            >
            记住密码
          </label>
        </div>
        <button @click="submit()">确定</button>
        <div class="bottom_jump-wrap clearfix">
          <div class="jumpToReg">
            没有账号？点击
            <router-link to="/register">注册</router-link>
          </div>
          <div class="jumpToForget">
            <router-link to="/forgetPassword">忘记密码</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import GVerify from "../assets/js/verify"
import { mapActions } from "vuex"
import md5 from "md5"

export default {
  data() {
    return {
      verifyCode: {},
      username: "",
      password: "",
      verify: "",

      agree: false,
      remPsw: false,

      tips: "",
      salt: "",

      //表单验证样式
      userOrPswWrong: false,
      verifyWrong: false
    }
  },
  watch: {
    username() {
      this.userOrPswWrong = false;
    },
    password() {
      this.userOrPswWrong = false;
    },
    verify() {
      this.verifyWrong = false;
    }
  },
  methods: {
    ...mapActions(["modifyUser"]),
    submit() {
      this.username = this.username.replace(/\ +/g, "");
      if (this.username && this.password) {
        var res = this.verifyCode.validate(this.verify);
        if (res) {
          if (this.agree) {
            //得到salt
            this.$http
              .get("login/getSalt", {
                params: {
                  username: this.username
                }
              })
              .then(res => {
                if (!res.data.ok) {
                  this.tips = "服务器出错";
                  return false;
                } else if (!res.data.salt) {
                  this.tips = "账号或者密码错误！";
                  this.userOrPswWrong = true;
                  return false;
                } else {
                  //账号没问题 开始计算hash值并准备验证密码
                  this.salt = res.data.salt;
                  //验证数据
                  var password = md5(this.password + this.salt);
                  this.$http
                    .get("login", {
                      params: {
                        username: this.username,
                        password,
                        remPsw: this.remPsw
                      }
                    })
                    .then(res => {
                      if (res.data.ok) {
                        this.modifyUser()
                        if (this.$route.query.returnVideo) {
                          this.$router.push({
                            path: "/video/" + this.$route.query.returnVideo,
                            query: {
                              nowTime: this.$route.query.nowTime
                            }
                          })
                        } else {
                          this.$router.push({
                            path: "/"
                          })
                        }
                        
                      } else if (res.data.err == 1) {
                        this.tips = "账号或密码错误"
                      } else {
                        this.tips = "服务器出错"
                      }
                    })
                }
              })
          } else {
            this.tips = "没有同意协议！";
          }
        } else {
          this.tips = "验证码错误";
          this.verifyWrong = true;
        }
      } else {
        this.tips = "账号或者密码不能为空";
        this.userOrPswWrong = true;
      }
    }
  },
  mounted() {
    this.verifyCode = new GVerify("v_container");
  },
  beforeDestroy() {
    this.verifyCode = null
  },
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
    .login-wrap {
      padding-top: 0 !important;
      .login-box {
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

.login-wrap {
  width: 100%;
  padding: 1.25rem 0;
  background: #9ee;
  .login-box {
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
    .login-top {
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
      }
    }
    .login-content {
      width: 100%;
      padding: 1.25rem 0;
      > input {
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
      button {
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
      .bottom_jump-wrap {
        width: 100%;
        .jumpToReg {
          float: left;
          width: 50%;
          margin-top: 1.25rem;
          font-size: 1rem;
          text-indent: 1.25rem;
          a {
            color: rgb(221, 169, 72);
          }
        }
        .jumpToForget {
          float: left;
          width: 50%;
          margin-top: 1.25rem;
          font-size: 1rem;
          text-align: center;
          a {
            color: rgb(221, 169, 72);
          }
        }
      }
    }
  }
}
</style>
