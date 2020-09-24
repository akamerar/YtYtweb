<template>
  <div class="set_question-wrap">
    <van-cell-group>
      <van-cell>
        问题1：
        <select
          value="密保问题1"
          v-model="question1"
        >
          <option
            value="0"
            disabled
            selected
          >请选择您的问题</option>
          <option
            :key="item.id"
            v-for="item in questionList"
          >{{item.content}}</option>
        </select>
      </van-cell>
      <van-field
        label="答案1:"
        v-model="answer1"
        placeholder="请输入第一问题的答案"
      >
      </van-field>
      <van-cell>
        问题2：
        <select
          value="密保问题2"
          v-model="question2"
        >
          <option
            value="0"
            disabled
            selected
          >请选择您的问题</option>
          <option
            :key="item.id"
            v-for="item in questionList"
          >{{item.content}}</option>
        </select>
      </van-cell>
      <van-field
        label="答案2:"
        v-model="answer2"
        placeholder="请输入第二问题的答案"
      >
      </van-field>
      <van-cell>
        问题3：
        <select
          value="密保问题3"
          v-model="question3"
        >
          <option
            value="0"
            disabled
            selected
          >请选择您的问题</option>
          <option
            :key="item.id"
            v-for="item in questionList"
          >{{item.content}}</option>
        </select>
      </van-cell>
      <van-field
        label="答案3:"
        v-model="answer3"
        placeholder="请输入第三问题的答案"
      >
      </van-field>
      <van-cell>
        <van-button
          type="info"
          size="small"
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
import { mapState } from 'vuex'

export default {
  data() {
    return {
      question1: "0",
      answer1: "",
      question2: "0",
      answer2: "",
      question3: "0",
      answer3: "",

      questionList: [
        {
          id: 1,
          content: "您父亲的姓名是?"
        },
        {
          id: 2,
          content: "您母亲的姓名是?"
        },
        {
          id: 3,
          content: "您的出生地是?"
        },
        {
          id: 4,
          content: "您最好的朋友的姓名?"
        },
        {
          id: 5,
          content: "您初吻的城市?"
        },
        {
          id: 6,
          content: "您初恋的名字?"
        },
        {
          id: 7,
          content: "您所上小学名字?"
        },
        {
          id: 8,
          content: "您所上大学的名字?"
        }
      ]
    }
  },
  computed: {
    ...mapState(['user', 'hasSmsVerify'])
  },
  methods: {
    submit(){
      if (this.question1 === "0" || this.question2 === "0" || this.question3 === "0" || this.answer1 === "" || this.answer2 === "" || this.answer3 === "") {
        this.$toast.fail({
          message: "请正确设置问题",
          duration: 1000
        })
        return false
      }
      this.$http.get('userCenter/security/setQuestion', {
        params: {
          userID: this.user.userID,
          question1: this.question1,
          question2: this.question2,
          question3: this.question3,
          answer1: this.answer1,
          answer2: this.answer2,
          answer3: this.answer3
        }
      }).then(res => {
        if (res.data.ok) {
          this.$toast.success({
            message: '提交成功',
            duration: 1000
          })
          this.$router.push({
            path: '/userCenter'
          })
        } else {
          this.$toast.fail({
            message: '提交失败',
            duration: 1000
          })
        }
      })
    }
  },
  created(){
    if (!this.hasSmsVerify.setQuestion) {
      this.$router.push({
        path: '/userCenter/security/verifySmsCode?to=setQuestion'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.set_question-wrap {
  width: 100%;
  select {
    width: 80%;
    height: 2.5rem;
    text-indent: 1.25rem;
    outline: none;
    border: none;
  }
}
</style>

