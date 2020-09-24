<template>
  <div class="upload-video-wrap clearfix">
    <div class="sel-video-wrap">选择您的视频文件(&lt;=500M&nbsp;mp4/ogg/webm)：
      <label
        for="sel-video"
        class="sel-video-label"
        :title="selBtnMsg"
      >
        {{selBtnMsg}}
      </label>
      <input
        ref="file"
        id="sel-video"
        type="file"
        @change="getfile()"
        accept="video/mp4, video/ogg, video/webm"
      >
    </div>
    <div v-show="videoShow">
      <div class="video-option-wrap">
        <div  class="video-wrap">
          视频预览：
          <video
            :src="videoSrc"
            width="320"
            height="180"
            controls
            ref="video"
          >您的浏览器不支持H5，请升级浏览器</video>
        </div>
      </div>
      <div class="select-cover-wrap" v-show="videoShow">
        <label for="select-cover">（可选）视频封面(16:9)jpg/png:
          <img :src="coverSrc" alt="视频封面" :title="coverMsg">
        </label>
        <input ref="cover" type="file" id="select-cover" accept="image/*" @change="getCover()">
      </div>
      <div class="video-introduce">
        <div class="video-name-wrap">
          <input type="text" placeholder="视频名称（不得多于25个字）" v-model="videoname">
        </div>
        <div class="video-info-wrap">
          <p><span style="color: red; margin:0 2px 0 0">*</span><span style="color: #00a1e7">视频简介：</span>（不得多于100个字）&nbsp;&nbsp;可用：{{leaveInfo}}字</p>
          <textarea v-model="videoInfo"></textarea>
        </div>
        <div class="video-type-wrap">
          <span><span style="color: red; margin:0 2px 0 0">*</span><span style="color: #00a1e7;margin-right: 0">视频分类：</span>（正确的分类会增加您的播放量）</span>
          <select v-model="videoType">
            <option value="1" disabled>选择视频分类</option>
            <option :key="index" v-for="(item, index) in videoTypeList" :value="item">{{item}}</option>
          </select>
        </div>
        <div class="video-label-wrap">
          <div class="video-commonLabel-wrap">
            <p><span style="color: red; margin:0 2px 0 0;padding: 0">*</span><span style="color: #00a1e7;padding: 0">添加标签：</span>（不得多于五个标签）</p>
            <span>(常用标签):</span>
            <span @click="addLabel(item)" v-for="(item, index) in commonLabelLiist" :key="index" class="video-commonLabel">{{item}}</span>
          </div>
          <div class="newLabel">
            自定义标签：<input type="text" placeholder="创建自定义标签" v-model="newLabel" @keyup.enter="addLabel(newLabel)"><button class="addLabel-btn" @click="addLabel(newLabel)">确认添加</button>
          </div>
          <div class="video-label-wrap clearfix">
            <div class="now-label">当前标签:</div>
            <div v-if="videoLabel.length">
              <div class="video-label" v-for="(item, index) in videoLabel" :key="index">
                <div class="label-text">{{item}}</div>
                <div class="delete-label" @click="deleteLabel(item)">x</div>
              </div>
            </div>
            <div class="no-label" v-else>
              无标签
            </div>
          </div>
        </div>
      </div>
      <div class="progress-wrap" :class="{'show': showProgress}">
        <span style="color: #00a1e7">上传进度：{{progressRate}}</span>
        <div class="progress" > 
          <div ref="progress" class="now-progress"></div>
        </div>
      </div>
      <div class="submit">
        <button :disabled="isLoading" @click="submit()">立即投稿</button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  data() {
    return {
      timer: 0,

      videoTypeList: ['音乐','动漫','游戏','生活','影视','其他'],

      selBtnMsg: "点击选择文件",
      videoIsPass: false,
      videoShow: false,
      videoSrc: "",
      file: {},
      duration: 0,

      cover: {},
      coverMsg: "请选择您的封面",
      newCover: "",
      //常用标签信息，可从服务器获取
      commonLabelLiist: ['个人创作', '情感问题', 'web前端', 'vueJS'],

      videoname: "",
      videoInfo: "",
      videoType: '1',
      videoLabel: [],
      //自定义标签
      newLabel: "",
      videoMD5: "",

      //显示进度条
      showProgress: false,
      progressRate: "",

      //是否正在上传
      isLoading: false
    }
  },
  computed: {
    ...mapState(['user']),

    coverSrc() {
      return this.newCover?this.newCover:this.$http.options.root + 'public/imgs/add-cover.jpg'
    },
    leaveInfo() {
      return 100 - this.videoInfo.length
    }
  },
  watch: {
    videoname(val) {
      if (val.length >= 25) {
        this.$toast('视频名称不得多于25个字')
        this.videoname = val.slice(0, 25)
      }
    },
    videoInfo(val) {
      if (val.length >= 100) {
        this.$toast('视频简介不得多于100个字')
        this.videoInfo = val.slice(0, 100)
      }
    },  
  },
  beforeDestroy() {
    clearInterval(this.timer)
  },
  mounted(){
    this.$refs.video.addEventListener('click', function() {
      if (this.paused) {
        this.play()
      } else {
        this.pause()
      }
    })
  },
  methods: {
    init(){
      this.selBtnMsg = "点击选择文件",
      this.videoIsPass = false,
      this.videoShow = false,
      this.videoSrc = "",
      this.file = {},
      this.duration = 0,

      this.$refs.file.value = null
      this.$refs.cover.value = null

      this.cover = {},
      this.coverMsg = "请选择您的封面",
      this.newCover = "",

      this.videoname = "",
      this.videoInfo = "",
      this.videoType = '1',
      this.videoLabel = [],
      //自定义标签
      this.newLabel = "",
      this.videoMD5 = "",

      //显示进度条
      this.showProgress = false,
      this.progressRate = ""
      this.$refs.progress.style.width = 0
    },
    getfile() {
      if (!this.$refs.file.files[0]) {
        this.selBtnMsg = "点击选择文件"
        this.videoShow = false
        this.file = {}
        this.videoSrc = ""
        this.videoIsPass = false
        if (this.timer) {
          clearInterval(this.timer)
          this.timer = 0
        }
        this.duration = 0
        return false
      }
      this.file = this.$refs.file.files[0]
      var fileSize = this.file.size
      this.selBtnMsg = "已选择视频: " + this.file.name
      if (this.checkVideo(this.file.name)) {
        //文件类型正确
        this.videoShow = true
        this.videoSrc = this.getFileURL(this.file)
        //获取视频时间
        this.timer = setInterval(() => {
          this.duration = this.$refs.video.duration
          if (!isNaN(this.duration)) {
            this.duration = parseInt(this.duration)
            clearInterval(this.timer)
          }
        }, 500)
      } else {
        this.$toast("请选择正确的文件类型")
      }
    },
    //获取当前视频本地URL
    getFileURL(file) {
      var getUrl = null;
      if (window.createObjectURL != undefined) {
        // basic
        getUrl = window.createObjectURL(file);
      } else if (window.URL != undefined) {
        // mozilla(firefox)
        getUrl = window.URL.createObjectURL(file);
      } else if (window.webkitURL != undefined) {
        // webkit or chrome
        getUrl = window.webkitURL.createObjectURL(file);
      }
      return getUrl;
    },
    //检测是否为视频文件
    checkVideo(str) {
      str = str.toLowerCase()
      // let reg = /^.+\.(avi|mp4|ogg|webm)$/g
      let reg = /^.+$/g
      if (reg.test(str)) {
        this.videoIsPass = true
        return true
      } else {
        this.videoIsPass = false 
        return false
      }
    },
    //获取封面
    getCover() {
      if (!this.$refs.cover.files[0]) {
        this.coverMsg = "请选择您的封面"
        this.cover = {}
        this.newCover = ""
        return false
      }
      this.cover = this.$refs.cover.files[0]
      this.newCover = this.getFileURL(this.cover)
    },
    addLabel(str) {
      if (!str) {
        this.$toast('不可以添加空标签')
        return false
      }
      //多于10字
      if (str.length > 10) {
        this.$toast('标签不可以多于10字')
        return false
      }
      if (this.videoLabel.length != 0) {
        if (this.checkLabel(str) != -1) {
          this.$toast('不可以重复添加标签')
          return false
        }
        if (this.videoLabel.length == 5) {
          this.$toast('最多添加五个标签')
          return false
        }
      }
      this.videoLabel.push(str)
      this.newLabel = ""
    },
    //检测标签是否存在
    checkLabel(str){
      var hasLabel = false
      var i = -1
      this.videoLabel.forEach((item, index) => {
        if (item == str) {
          hasLabel = true
          i = index
        }
      })
      return i
    },
    deleteLabel(str) {
      var i = this.checkLabel(str)
      if (i != -1) {
        this.videoLabel.splice(i, 1)
      }
    },
    //上传视频和封面等信息
    submit() {
      if (!this.videoIsPass) {
        this.$toast('请选择正确的视频文件！')
        return false
      }
      if (!this.videoname || !this.videoInfo || this.videoType == '1' || !this.videoLabel.length) {
        this.$toast('请检查表单是否完整')
        return false
      }
      if (isNaN(this.duration)) {
        this.$toast('视频出错，请检查能否正常播放')
        return false
      }
      if (this.file.size > 500 * 1024 * 1024) {
        this.$toast('视频文件过大(500M),无法上传')
        return false
      }
      //获取文件
      var fileReader = new FileReader()
      let form = new FormData()
      form.append("file", this.file)
      form.append("type", this.file.type.replace(/^.+\//, ""))
      form.append("userID", this.user.userID)
      if (this.cover.type) {
        form.append("cover", this.cover)
      }
      form.append("videoname", this.videoname)
      form.append("videoInfo", this.videoInfo)
      form.append("videoType", this.videoType)
      form.append("videoLabel", this.videoLabel)
      form.append("videoDuration", "" + this.duration)
      //显示进度条
      this.showProgress = true
      var This = this
      this.isLoading = true
      this.$http.post('userCenter/uploadVideo', form, {
        //上传事件
        progress(event) {
          var rate = parseInt(event.loaded / event.total * 100) + '%'
          This.$refs.progress.style.width = This.progressRate = rate
        }
      }).then(res => {
        if (res.data.ok) {
          this.$toast('上传成功！')
          this.init()
          this.isLoading = false
          this.$router.push({
            name: 'mysubmit',
            params: {
              needLoad: true
            }
          })
        } else {
          this.$toast(res.data.ret_msg)
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
#sel-video {
  display: none;
}
#select-cover {
  display: none;
}
.upload-video-wrap {
  .sel-video-wrap {
    width: 80%;
    margin: 0 auto;
    line-height: 30px;
    text-align: center;
    .sel-video-label {
      display: inline-block;
      padding: 0 10px;
      width: 100%;
      height: 30px;
      box-sizing: border-box;
      background-color: rgb(42, 151, 87);
      color: #fff;
      text-align: center;
      border-radius: 10px;
      -o-border-radius: 10px;
      -moz-border-radius: 10px;
      -webkit-border-radius: 10px;
      -ms-border-radius: 10px;
      cursor: pointer;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }
  .video-option-wrap {
    .video-wrap {
      text-align: center;
      video {
        display: block;
        width: 80%;
        height: auto;
        margin: 10px auto 0;
      }
    }
  }
  .select-cover-wrap {
    width: 100%;
    label {
      display: block;
      width: 320px;
      margin: 10px auto 0;
      text-align: center;
      line-height: 30px;
      img {
        display: block;
        width: 320px;
        height: 180px;
        margin: 0 auto
      }
    }
  }
  .video-introduce {
    width: 80%;
    margin: 0 auto;
    input:focus, textarea:focus {
      border: 1px solid #009711 !important;
    }
    .video-name-wrap {
      width: 100%;
      margin-top: 10px;
      input {
        display: block;
        width: 100%;
        height: 30px;
        text-indent: 10px;
        border: 1px solid #999;
        border-radius: 3px;
      }
    }
    .video-info-wrap {
      width: 100%;
      margin-top: 10px;
      p {
        margin: 10px 0;
      }
      textarea {
        width: 100%; 
        height: 100px;
        padding: 10px;
        box-sizing: border-box;
      }
    }
    .video-type-wrap {
      width: 100%;
      padding: 10px 0;
      vertical-align: center;
      line-height: 30px;
      span {
        margin-right: 20px;
      }
    }
    .video-label-wrap {
      .video-commonLabel-wrap {
        p {
          padding: 10px 0;
        }
        span {
          display: inline-block;
          padding: 10px 10px;
          text-align: center;
          &.video-commonLabel {
            background: #00a1e7;
            margin: 0 5px 10px;
            border-radius: 7px;
            color: #fff;
            cursor: pointer;
          }
        }
      }
      .newLabel {
        width: 100%;
        margin: 10px 0;
        line-height: 30px;
        input {
          width: 110px;
          text-indent: 10px;
          border-radius: 10px;
          border: 1px solid #999;
        }
        .addLabel-btn {
          height: 30px;
          margin-left: 20px;
          background-color: #009711;
          color: #fff;
          padding: 0 8px;
          border-radius: 5px;
        }
      }
      .video-label-wrap {
        width: 100%;
        .now-label, .no-label {
          float: left;
          display: inline-block;
          padding: 10px;
        }
        .video-label {
          float: left;
          display: inline-block;
          padding: 10px;
          background-color: #00a1e7;
          color: #fff;
          border-radius: 6px;
          margin-right: 10px;
          margin-bottom: 10px;
          zoom: 1;
          &::after {
            content:"\20";
	          clear:both;
	          display:block;
          }
          .label-text {
            float: left;
          }
          .delete-label {
            position: relative;
            top: -1px;
            left: 0;
            float: left;
            padding-left: 6px;
            cursor: pointer;
            &:hover {
              color: #f60;
            }
          }
        }
        
      }
    }
  }
  .progress-wrap {
    display: none;
    width: 80%;
    margin: 10px auto 0;
    &.show {
      display: block;
    }
  }
  .progress {
    position: relative;
    width: 100%;
    height: 5px;
    margin-top: 10px;
    border-radius: 2px;
    overflow: hidden;
    box-sizing: border-box;
    border: 1px solid #00a1e7;
    .now-progress {
      position: absolute;
      top: 0;
      left: 0;
      width: 0;
      height: 100%;
      background-color: #00a1e7;
    }
  }
  .submit {
    margin: 20px 0 50px;
    button {
      display: block;
      margin: 0 auto;
      width: 80%;
      height: 30px;
      background-color: #00a1e7;
      border-radius: 10px;
      color: #fff;
    }
  }
}
</style>
