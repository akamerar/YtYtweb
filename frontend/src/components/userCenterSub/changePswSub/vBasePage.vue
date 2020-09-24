<template>
  <div class="content-wrap">
    <van-cell-group>
      <van-field
        label="设置新密码"
        type="password"
        v-model="password"
        :error-message="tips1"
        placeholder="请输入新密码"
        required
      >
      </van-field>
      <van-field
        label="确认密码"
        type="password"
        v-model="confirmPassword"
        :error-message="tips2"
        placeholder="请确认新密码"
        required
      >
      </van-field>
      <van-cell>
        <van-button
          size="small"
          type="info"
          block
          @click="submit()"
        >
          提交
        </van-button>
      </van-cell>
      
    </van-cell-group>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
import md5 from "md5"

export default {
  data(){
    return {
      password: "",
      confirmPassword: "",
      tips1: "",
      tips2: "",
      passwordErr: false,
      confirmErr: false
    }
  },
  computed: {
    ...mapState(['hasSmsVerify', 'user'])
  },
  methods: {
    ...mapMutations(['clearVerify']),
    //检测页面合法性(user成功获取之后)
    verifyPage(){
      if (!this.hasSmsVerify.changePassword) {
        this.$router.push({
          path: '/userCenter/changePassword'
        })
      }
    },
    //检测密码合法性
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
    //提交
    submit() {
      if (this.password == '' || this.confirmPassword == '' ) {
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
        //1.加密
        var salt = parseInt(Math.random()*1000).toString()
        var password = md5(this.password + salt)
        //发送
        this.$http.get('userCenter/changePassword/setNewPassword', {
          params: {
            userID: this.user.userID,
            password,
            salt
          }
        }).then(res => {
          if (res.data.ok) {
            this.$toast('修改成功')
            this.clearVerify('changePassword')
            this.$router.push({
              path: "/userCenter/changePassword"
            })
          } else {
            this.$toast(res.data.ret_msg)
          }
        })
      }
    }
  },
  watch: {
    password() {
      this.passwordErr = this.verifyPassword()
    },
    confirmPassword() {
      this.confirmErr = this.verifyConfirm()
    },
  },
  created() {
    if (this.hasSmsVerify) {
      this.verifyPage()
    }
  }
}
</script>

<style lang="scss" scoped>
.content-wrap {
  padding-top: 3.125rem;
}
</style>

