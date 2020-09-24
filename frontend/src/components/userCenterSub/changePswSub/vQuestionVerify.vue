<template>
  <div class="content-warp">
    <van-cell-group>
      <van-field
        label="问题1："
        v-model="question1"
        disabled
      >
      </van-field>
      <van-field
        label="回答1："
        v-model="answer1"
        placeholder="请输入问题1的答案"
      >
      </van-field>
      <van-field
        label="问题2："
        v-model="question2"
        disabled
      >
      </van-field>
      <van-field
        label="回答2："
        v-model="answer2"
        placeholder="请输入问题2的答案"
      >
      </van-field>
      <van-field
        label="问题3："
        v-model="question3"
        disabled
      >
      </van-field>
      <van-field
        label="回答3："
        v-model="answer3"
        placeholder="请输入问题3的答案"
      >
      </van-field>
      <van-cell>
        <van-button
          size="small"
          block
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
import { mapState, mapMutations } from "vuex"

export default {
  data() {
    return {
      question1: "",
      question2: "",
      question3: "",
      answer1: "",
      answer2: "",
      answer3: ""
    };
  },
  computed: {
    ...mapState(["user"])
  },
  methods: {
    ...mapMutations(['changeHasSmsVerify']),
    getQuestion() {
      this.$http
        .get("userCenter/changePassword/getQuestion", {
          params: {
            userID: this.user.userID
          }
        })
        .then(res => {
          if (res.data.ok) {
            if (res.data.data) {
              this.question1 = res.data.data.question1;
              this.question2 = res.data.data.question2;
              this.question3 = res.data.data.question3;
            } else {
              this.$toast.fail({
                message: "请先到安全中心设置密保！",
                duration: 1000
              });
              this.$router.push({
                path: "/userCenter/changePassword/"
              });
            }
          } else {
            this.$toast.fail("服务器出错！");
          }
        });
    },
    submit() {
      if (this.answer1 === "" || this.answer2 === "" || this.answer3 === "") {
        this.$toast.fail({
          message: "请检查答案是否输入完整！",
          duration: 1000
        });
      } else {
        //验证密保正确性
        this.$http
          .get(
            "userCenter/changePassword/verifyQuestion",
            {
              params: {
                userID: this.user.userID,
                question1: this.question1,
                question2: this.question2,
                question3: this.question3,
                answer1: this.answer1,
                answer2: this.answer2,
                answer3: this.answer3
              }
            }
          )
          .then(res => {
            if (res.data.ok) {
              this.changeHasSmsVerify('changePassword')
              this.$toast.success({
                message: res.data.ret_msg,
                duration: 1000
              })
              this.$router.push({
                path: '/userCenter/changePassword/basePage'
              })
            } else {
              this.$toast.fail({
                message: res.data.ret_msg,
                duration: 1000
              })
            }
          })
      }
    }
  },
  created() {
    if (this.user && this.user.userID) {
      this.getQuestion()
    }
  },
  watch: {
    user: {
      handler(val) {
        //获得密保问题 userID
        if (val && val.userID) {
          this.getQuestion();
        }
      }
    },
    deep: true,
    immediate: true
  }
}
</script>

<style>
.content-wrap {
  padding-top: 1.875rem;
}
</style>