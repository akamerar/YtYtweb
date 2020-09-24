<template>
  <van-cell-group class="cell-wrap">
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
            to="/userCenter/security/verifySmsCode?to=setPhone"
          >
            验证手机
          </van-button>
        </van-cell>
      </van-col>
    </van-row>
    <van-row>
      <van-col span="16">
        <van-cell
          title="当前手机无法使用？"
        >
        </van-cell>
      </van-col>
      <van-col span="8">
        <van-cell>
          <van-button
            size="small"
            type="info"
            plain
            to="/aboutMe"
          >
            请联系我
          </van-button>
        </van-cell>
      </van-col>
    </van-row>
  </van-cell-group>
</template>

<script>
import { mapState } from "vuex";

export default {
  data() {
    return {};
  },
  computed: {
    ...mapState(["user"])
  },
  methods: {}
};
</script>

<style lang="scss" scoped>
.cell-wrap {
  padding-top: 3.125rem;
}
</style>
