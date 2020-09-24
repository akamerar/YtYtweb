<template>
  <div class="basic-info">
    <div class="title">
      <div class="badge"></div>
      基本信息
    </div>
    <div class="user-info-top">
      <van-cell-group>
        <van-field
          class="username-inputBox"
          v-model="username"
          required
          clearable
          label="用户名:"
          right-icon="question-o"
          placeholder="请输入新的用户名"
          :error-message="usernameWrong?errMsg:''"
          @input="usernameWrong = verifyUsername()"
          @click-right-icon="$toast({
          message: '请输入3-10字用户名',
          duration: 1000
          })"
        />
        <van-cell
          required
          title="性别:"
        >
        </van-cell>
        <van-cell>
          <van-radio-group v-model="sex">
            <van-row>
              <van-col>
                <van-radio name="0">男</van-radio>
              </van-col>
              <van-col>
                <van-radio name="1">女</van-radio>
              </van-col>
              <van-col>
                <van-radio name="2">保密</van-radio>
              </van-col>
            </van-row>
          </van-radio-group>
        </van-cell>
        <van-field
          v-model="birthday"
          clearable
          label="生日:"
          type="date"
        >
        </van-field>
      </van-cell-group>
    </div>
    <div class="user-info-bottom">
      <van-cell-group>
        <van-cell>
          <van-button
            type="info"
            size="small"
            round
            block
            :disabled="usernameWrong"
            @click="verifyUpdate()"
          >
            保存
          </van-button>
        </van-cell>
      </van-cell-group>
    </div>
  </div>
</template>

<script>
import { mapState , mapActions } from "vuex";

export default {
  data() {
    return {
      errMsg: "",
      username: "",
      usernameWrong: false,
      sex: "",
      birthday: ""
    };
  },
  computed: {
    ...mapState(["user"])
  },
  watch: {
    user: {
      handler(val) {
        this.username = val.username;
        this.sex = val.sex;
        this.birthday = val.birthday;
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    ...mapActions(['modifyUser']),
    //验证用户名
    verifyUsername() {
      //用户还是使用的原来的名字
      if (this.username === this.user.username) {
        this.errMsg = "";
        return false;
      }
      //没有填写内容
      if (this.username === "") {
        this.errMsg = "用户名不能为空";
        return true;
      }
      //检测是否有空格
      var reg1 = /[\s\./]+/g;
      //检测字符长度3-10
      var reg2 = /^[\w\u4e00-\u9fa5]{3,10}$/g;
      if (reg1.test(this.username)) {
        this.errMsg = "用户名不能存在空格等非法字符";
        return true;
      } else if (reg2.test(this.username)) {
        //前端验证完毕，后台验证
        this.$http
          .get("register/verifyUsername", {
            params: {
              username: this.username
            }
          })
          .then(res => {
            this.errMsg = res.data.ret_msg;
            //数据库处理成功回执
            if (res.data.ok) {
              if (res.data.hasUser) {
                this.usernameWrong = true;
              } else {
                this.usernameWrong = false;
              }
            }
          });
      } else {
        this.errMsg = "请输入3-10字用户名，不能有非法字符";
        return true;
      }
    },
    //日期转yyy-mm-dd
    formatDate(date) {
      var y = date.getFullYear();
      var m = date.getMonth() + 1;
      m = m < 10 ? "0" + m : m;
      var d = date.getDate();
      d = d < 10 ? "0" + d : d;
      return y + "-" + m + "-" + d;
    },
    //验证修改
    verifyUpdate() {
      //判断是否改变了内容
      if (
        this.username === this.user.username &&
        this.sex === this.user.sex &&
        this.birthday === this.user.birthday
      ) {
        //没有改变内容
        this.$toast.fail({
          message: "您没有改变资料的任何内容",
          duration: 2000
        })
      } else {
        this.submitUpdate()
      }
    },
    //提交修改
    submitUpdate() {
      this.$http.get("userCenter/updateUserMsg", {
        params: {
          userID: this.user.userID,
          username: this.username,
          sex: this.sex,
          birthday: this.birthday
        }
      }).then((res) => {
        if (res.data.ok) {
          this.$toast.success({
            message: '修改成功！',
            duration: 1000
          })
          this.modifyUser()
        } else {
          this.$toast.fail({
            message: '修改失败，请重试！',
            duration: 1000
          })
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@media screen and (max-width: 520px) {
}

.basic-info {
  text-indent: 1.125rem;
  .title {
    position: relative;
    width: calc(100% - 1.25rem);
    height: 3.125rem;
    line-height: 3.125rem;
    color: #fff;
    background-color: rgba(0, 161, 231, 0.9);
    font-size: 1.25rem;
    padding-left: 1.25rem;
    .badge {
      position: absolute;
      width: 0.5rem;
      height: 1rem;
      top: 50%;
      left: 1.25rem;
      margin-top: -0.5rem;
      background-color: rgb(255, 255, 255);
      border-radius: 4px;
    }
  }
  .user-info-bottom {
    width: 50%;
    margin: 0 auto;
  }
  
}
</style>
