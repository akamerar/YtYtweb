<template>
  <van-cell-group class="cell-wrap">
    <van-row>
      <van-col span="16">
        <van-cell
          title="密保问题"
          :value="setMsg"
        >
        </van-cell>
      </van-col>
      <van-col span="8">
        <van-cell>
          <van-button
            size="small"
            type="info"
            to="/userCenter/security/verifySmsCode?to=setQuestion"
          >
            {{setButMsg}}
          </van-button>
        </van-cell>
      </van-col>
    </van-row>
    <van-row>
      <van-col span="16">
        <van-cell
          title="绑定手机"
          :value="user.phone?user.phone.start + '*****' + user.phone.end:'加载中...'"
        >
        </van-cell>
      </van-col>
      <van-col span="8">
        <van-cell>
          <van-button
            size="small"
            type="info"
            plain
            to="/userCenter/security/changePhone"
          >
            更改绑定
          </van-button>
        </van-cell>
      </van-col>
    </van-row>
  </van-cell-group>
</template>

<script>
import { mapState, mapGetters } from "vuex";

export default {
  data() {
    return {
      isSet: false,
      setMsg: "加载中..."
    };
  },
  computed: {
    ...mapState(["user"]),
    setButMsg() {
      return this.isSet ? "更改设置" : "立即设置"
    }
  },
  watch: {
    user: {
      handler(val) {
        if (val && val.userID){
          this.checkQuestionStatus()
        }
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    checkQuestionStatus() {
      this.$http
        .get(
          "userCenter/security/checkQuestionStatus",
          {
            params: {
              userID: this.user.userID
            }
          }
        )
        .then(res => {
          if (res.data.ok) {
            if (res.data.isSet) {
              this.setMsg = "已设置";
              this.isSet = true;
            } else {
              this.setMsg = "未设置";
              this.isSet = false;
            }
          } else {
            this.setMsg = "数据加载失败";
          }
        });
    }
  }
};
</script>

<style lang="scss" scoped>
.cell-wrap {
  padding-top: 3.125rem;
  .van-cell__value--alone {
    color: #323233;
    text-align: center;
  }
}
</style>

