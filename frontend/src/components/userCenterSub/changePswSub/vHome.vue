<template>
  <div class="content-wrap">
    <van-row>
      <van-col span="16">
        <van-cell center>
          使用密保问题验证
        </van-cell>
      </van-col>
      <van-col span="8">
        <van-cell center>
          <van-button
            type="info"
            plain
            size="small"
            @click="toQuestionVerify()"
          >
            立即验证
          </van-button>
        </van-cell>
      </van-col>
    </van-row>
    <van-row>
      <van-col span="16">
        <van-cell center>
          使用手机验证码验证
        </van-cell>
      </van-col>
      <van-col span="8">
        <van-cell center>
          <van-button
            type="info"
            plain
            size="small"
            @click="toSmsVerify()"
          >
            立即验证
          </van-button>
        </van-cell>
      </van-col>
    </van-row>
  </div>
</template>

<script>
export default {
  data(){
    return {

    }
  },
  methods: {
    toQuestionVerify(){
      this.$router.push('/userCenter/changePassword/questionVerify')
    },
    toSmsVerify(){
      this.$router.push('/userCenter/changePassword/smsVerify')
    }
  },
}
</script>

<style lang="scss" scoped>
.content-wrap {
  padding-top: 1.875rem;
}
</style>

