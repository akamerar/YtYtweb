<template>
  <div id="app-video">
    <div class="title">正在播放：{{isLoading?'加载中':videoMsg.videoname}}</div>
    <div ref="wrap" class="video-wrap" :class="{'full-screen': isFullScreen}">
      <video 
        :class="{'full-screen': isFullScreen}" 
        ref="video" :width="videoWidth" 
        :height="canvasHeight" 
        :src="!checkPass?'':'/public/videos/' + videoMsg.videoID + '/' + videoMsg.videoname + '.' + videoMsg.format" 
        :poster="videoMsg.cover == '1'&&checkPass?'/public/videos/' + videoMsg.videoID + '/cover.' + videoMsg.coverType:''" :controls="sysType == 'PC'?false:true"
        preload="auto"
      >
      </video>
      <div v-if="isLoading || !checkPass" class="loadingOrError-msg">
        {{msg}}
      </div> 
      <canvas 
        v-if="sysType === 'PC'" 
        :class="{'full-screen': isFullScreen}" ref="canvas"
        :width="videoWidth" :height="canvasHeight" 
        @click="togglePlay($event)"
      >
      </canvas>
      <div ref='controls' v-if="sysType === 'PC'" @click="updateTime()" class="controls clearfix" :class="{'hide': controlsHide, 'full-screen': isFullScreen}" >
        <div class="controls-progress" @mousedown="drapProgreess($event)">
          <div ref='progressTunnel' class="progress-tunnel">
            <div v-show="!controlsHide" ref='progressDot' class="progress-dot">
            </div>
          </div>
        </div>
        <div class="controls-left clearfix">
          <div class="playcontrol" :class="{'play': !isPlay, 'pause': isPlay}" @click="togglePlay()"></div>
          <div class="bullet-status" :class="{off: bulletStatus == 0}" @click="toggleBullet()">
            弹
            <div class="mask" :class="{show: bulletStatus == 2}"></div>
          </div>
          <div>{{parseInt(nowTime) | MillisecondToDate }} / {{+videoMsg.videoDuration | MillisecondToDate }}</div>
        </div>
        <div v-if="user.username" class="controls-center clearfix">
          <label for="sendBullet">发送弹幕：</label>
          <input id="sendBullet" v-model="newBullet" placeholder="输入弹幕内容">
          <input style="float:left; width:50px;margin-left:10px;" type="color" v-model="bulletColor">
          <button @click="sendBullet()">发送</button>
        </div>
        <div v-else style="color: #00a1e7;">
          请先
          <router-link :to="{path:'/login', query: {'returnVideo': videoMsg.videoID, 'nowTime': this.nowTime}}" style="color:#fff">&nbsp;登录&nbsp;</router-link>
          再发表弹幕
        </div>
        <div class="controls-right clearfix">
          <div class="full-screen-btn" @click="changeScreen()"></div>
          <div class="volume" @click.stop="toggleVolume()">
            <div ref="tunnel" class="tunnel" @click.stop=";" @mousedown="updateVolumeByDrag($event)" v-show="tunnelShow">
              <div ref="dot" class="dot" @click.stop=";"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Comment :videoMsg="videoMsg" :user="user" :sysType="sysType"></Comment>
  </div>
</template>

<script>
//引入弹幕对象
import CanvasBarrage from '../assets/js/canvasBarrage'

import { mapState } from 'vuex'
//评论组件
import Comment from './vComment.vue'

export default {
  data() {
    return {
      //设备属性
      sysType: 'PC',
      screen: 'large',
      //计时器
      timer: 0,
      lastdate: 0,
      cleared : true,
      videoMsg: {},
      bullet: [],

      //视频信息正在获取中
      isLoading: true,
      //视频是否通过审核
      checkPass: false,
      //弹幕是否加载完成
      bulletHasLoaded: false,


      //video标签宽度
      videoWidth: 780,
      //弹幕系统
      bulletSys: null,
      msg: "正在加载...",

      //浏览器controls属性
      //隐藏控件
      controlsHide: true,
      isPlay: false,
      //弹幕开关
      //0关 1开 2半屏
      bulletStatus: 1,

      //音量开关
      tunnelShow: false,
      muted: false,
      volume: 50,

      //是否全屏
      isFullScreen: false,
      reverse: false,
      //全屏节流
      FullScreenTime: new Date(),

      //video cruenttime
      //video定时器
      nowTimer: 0,
      hasPlay: 0,
      nowTime: 0,

      //发送弹幕
      newBullet: "",
      bulletColor: '#ffffff',

      //计算是否算一次播放
      timerForCount: 0,
      hasCount: false,
      hasPlayTime: 0,
    }
  },
  filters: {
    MillisecondToDate(msd) {
      let time = parseFloat(msd);
      if (null!= time &&""!== time) {
          if (time >=60&& time <60*60) {
              let minute = parseInt(time /60.0) + '';
              let second = parseInt((parseFloat(time /60.0) - parseInt(time /60.0)) *60) + '';
              time = minute.padStart(2,'0') +':'+ second.padStart(2,'0');
          }else if (time >=60*60&& time <60*60*24) {
              let hour = parseInt(time /3600.0) + '';
              let minute = parseInt((parseFloat(time /3600.0) - parseInt(time /3600.0)) *60) +'';
              let second = parseInt((parseFloat((parseFloat(time /3600.0) - parseInt(time /3600.0)) *60) -
                  parseInt((parseFloat(time /3600.0) - parseInt(time /3600.0)) *60)) *60) + '';
              time = hour.padStart(2,'0')+':'+minute.padStart(2,'0') +':'+ second.padStart(2,'0');
          }else {
              let temp = parseInt(time) + '';
              time = temp.padStart(5,'00:00') ;
          }
      }else{
          time = "00:00";
      }
      return time;
    }
  },
  computed: {
    ...mapState(['user']),

    canvasHeight() {
      return parseInt(this.videoWidth/16*9)
    },
    countRange() {
      return parseInt(+this.videoMsg.videoDuration / 4)
    }
  },
  watch: {
    //审核通过则加载弹幕系统
    checkPass(val) {
      if (val && this.sysType == 'PC') {
        var canvas = this.$refs.canvas
        var video = this.$refs.video
        var bullet = this.bullet
        this.bulletSys = new CanvasBarrage(canvas, video, {
          "data": bullet
        })
        this.bulletHasLoaded = true
        if (window.innerWidth <= 414) {
          this.bulletSys.fontSize = 10
        }
        //视窗大小改变时改变videoWidth
        if (this.sysType =='PC') {
          window.onresize = (ev) => {
            if (new Date() - this.FullScreenTime < 100) {
              return false
            }
            var event = ev || event
            if (window.innerWidth <= 414) {
              this.videoWidth = this.$refs.wrap.offsetWidth
              this.bulletSys.fontSize = 10
              this.screen = 'small'
            } else {
              if (!this.reverse) {
                if (this.isFullScreen) {
                  this.videoWidth = window.screen.width
                  this.reverse = true
                } else {
                  this.videoWidth = 780
                }
              } else {
                this.videoWidth = 780
                this.reverse = false
                this.isFullScreen = false
              }
              this.bulletSys.fontSize = 24
              this.screen = 'large'
              this.FullScreenTime = new Date()
            }
            var translate = parseInt(this.videoWidth * (this.nowTime / +this.videoMsg.videoDuration))
            this.$refs.progressDot.style.transform = 'translateX(' + (translate-4) + 'px)'
          }
        }
      } else {
        var video = this.$refs.video
        video.onplay = () => {
          this.isPlay = true
        }
        video.onpause = () => {
          this.isPlay = false
        }
        video.onended = () => {
          this.isPlay = false
        }
      }
    },
    bulletStatus(val) {
      if (val == 0) {
        this.$refs.canvas.style.opacity = 0
      } else if (val == 1) {
        this.bulletSys.range = [0, 1]
        this.$refs.canvas.style.opacity = 1
      } else if (val == 2) {
        this.bulletSys.range = [0, 0.5]
      }
    },
    volume(val) {
      this.$refs.video.volume = val/100
      this.$refs.dot.style.transform = 'translateY(-' + val + 'px)'
    },
    isFullScreen(val) {
      if (val) {
        document.getElementsByTagName('body')[0].style="overflow-y:hidden"
        console.log(document.getElementsByTagName('body'))
        this.fullScreen()
      } else {
        document.getElementsByTagName('body')[0].style="overflow-y: none"
        this.exitFullScreen()
      }
    },
    nowTime(val) {
      if (this.sysType != "PC") {
        return false
      }
      var translate = parseInt(this.videoWidth * (val / +this.videoMsg.videoDuration))
      this.$refs.progressDot.style.transform = 'translateX(' + (translate-4) + 'px)'
    },
    isPlay(val) {
      if (val && !this.hasCount) {
        this.timerForCount = setInterval(() => {
          this.hasPlayTime++
          if (this.hasPlayTime >= this.countRange) {
            clearInterval(this.timerForCount)
            this.hasCount = true
          }
        }, 1000)
      } else {
        if (!this.hasCount) {
          clearInterval(this.timerForCount)
        } else {
          return
        }
      }
    },
    hasCount(val) {
      if (val) {
        this.$http.get('video/addViewCount', {
          params: {
            videoID: this.videoMsg.videoID
          }
        }).then(res => {
          if (!res.data.ok) {
            this.$toast('服务器出错')
          }
        })
      }
    }
  },
  methods: {
    updateTime() {
      this.lastdate = 0
      this.tunnelShow = false
    },
    //获取视频信息和弹幕
    getVideoMsgAndBullet() {
      this.$http.get('video/videoMsgAndBullet', {
        params: {
          videoID: this.$attrs.videoID
        }
      }).then(res => {
        if (res.data.ok) {
          this.videoMsg = res.data.data.videoInfo
          this.bullet = res.data.data.bullet
          this.isLoading = false
          this.checkPass = this.videoMsg.checkPass === '1'?true:false
          if (!this.checkPass) {
            this.msg = '视频未通过审核，无法观看'
            this.videoMsg = {}
            this.$refs.video.src = ""
          }
          //将视频音量调到.5
          this.volume = 50
        } else {
          console.log(res.data.ret_msg)
        }
      })
    },
    //点击切换播放暂停
    togglePlay() {
      var video = this.$refs.video
      if (video.paused) {
        video.play()
      } else {
        video.pause()
      }
      this.isPlay = !this.isPlay
    },
    toggleBullet() {
      if (this.bulletStatus == 2) {
        this.bulletStatus = 0
      } else {
        this.bulletStatus++
      }
    },
    toggleVolume() {
      this.tunnelShow = !this.tunnelShow
      this.lastdate = 0
    },
    updateVolumeByDrag(event) {
      var tunnel = event.currentTarget
      //开始位置
      var start = event.pageY
      var dot = this.$refs.dot
      var startTransform = dot.style.transform.replace(/[(translateY\()|px\)]/g, '')
      if (!startTransform) {
        startTransform = 0
      }
      var endTransform = 0
      //如果点的是tunnel
      if (tunnel == event.target) {
        this.volume = 100 - event.offsetY
      }
      var now,distance,endVolume = this.volume
      window.onmousemove = (e) => {
        now = e.pageY
        distance =  start - now
        //上小下大
        if (endVolume + distance >= 100) {
          this.volume = 100
        } else if (endVolume + distance <= 0) {
          this.volume = 0
        } else {
          this.volume = distance + endVolume
        }
      }
      window.onmouseup = () => {
        window.onmousemove = null
      }
    },
    changeScreen() {
      this.isFullScreen = !this.isFullScreen
    },
    fullScreen() {
      var docElm = document.documentElement;
      //W3C 
      if (docElm.requestFullscreen) {
          docElm.requestFullscreen()
      }
      this.videoWidth = window.screen.width
    },
    exitFullScreen() {
      try {
        if (document.exitFullscreen) {
          document.exitFullscreen()
        }
        this.videoWidth = 780
      } catch (err) {
        console.log(err)
      }
    },
    //拖动进度条
    drapProgreess(event) {
      var startX = event.pageX
      var dot = this.$refs.progressDot
      var tunnel = event.currentTarget
      var distance = this.getElementLeft(tunnel)
      var transform = startX - distance
      var rate = transform / this.videoWidth
      var nowVolume = this.volume
      this.$refs.video.currentTime = parseInt(rate * this.videoMsg.videoDuration)
      window.onmousemove = (e) => {
        this.$refs.video.volume = 0
        var end = e.pageX
        var dis = end - startX
        var endX = transform + dis
        rate = endX / this.videoWidth
        if (parseInt(rate * this.videoMsg.videoDuration) >= this.videoMsg.videoDuration) {
          this.$refs.video.currentTime = this.videoMsg.videoDuration
        } else if (parseInt(rate * this.videoMsg.videoDuration) <= 0) {
          this.$refs.video.currentTime = 0
        } else {
          this.$refs.video.currentTime = parseInt(rate * this.videoMsg.videoDuration)
        }
      }
      window.onmouseup = () => {
        window.onmousemove = null
        this.$refs.video.volume = nowVolume/100
      }
    },
    //获得元素到左边距的距离
    getElementLeft(element) {
      var actualLeft = element.offsetLeft
      var current = element.offsetParent
      while (current !== null) {
        actualLeft += current.offsetLeft
        current = current.offsetParent
        }
        return actualLeft
    },
    sendBullet() {
      if (this.newBullet == "") {
        this.$toast("弹幕内容不能为空")
      } else {
        if (this.newBullet.length > 50) {
          this.$toast('弹幕内容不能超过50字')
          return false
        }
        this.$http.get('video/sendBullet', {
          params: {
            userID: this.user.userID,
            videoID: this.videoMsg.videoID,
            bulletContent: this.newBullet,
            color: this.bulletColor,
            time: this.nowTime,
          }
        }).then(res => {
          if (res.data.ok) {
            this.bulletSys.add({
              bulletContent: this.newBullet,
              color: this.bulletColor,
              time: this.nowTime + 1
            })
            this.newBullet = "",
            this.videoMsg.bulletCount++
            this.bulletColor = "#ffffff"
          } else {
            this.$toast('发送失败，服务器出错！')
          }
        })
      }
    }
  },
  mounted() {
    //检测设备属性
    if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
      this.sysType = 'phone'
    }
    //移动端
    if (window.innerWidth <= 414) {
      this.videoWidth = this.$refs.wrap.offsetWidth   
      this.screen = 'small'
    }
    //加载当前视频信息
    this.getVideoMsgAndBullet()
    this.$refs.video.oncanplay = () => {
      if (this.$route.query.nowTime) {
        this.$refs.video.currentTime = this.$route.query.nowTime
        this.$route.query.nowTime = 0
      }
      //定时器实时获取当前播放时间
      if (this.nowTimer == 0 || this.sysType == 'PC') {
        this.nowTimer = setInterval(()=> {
          this.nowTime = this.$refs.video.currentTime
          //检测视屏是否结束
          if (this.$refs.video.ended) {
            this.isPlay = false
          }
        }, 13)
      }
    }
    
    
    
    if (this.sysType === 'PC') {
      this.$refs.wrap.onmouseenter = () => {
        this.controlsHide = false
        //长时间不动则controls下去
        this.lastdate = 0
        if (!this.cleared) {
          return false
        }
        this.cleared = false
        this.timer = setInterval(() => {
          if (this.lastdate >= 3) {
            this.controlsHide = true
            this.tunnelShow = false
            this.cleared = true
            clearInterval(this.timer)
          } else {
            this.lastdate++
          }
        }, 1000)
      }
      this.$refs.wrap.onmousemove = () => { 
        this.lastdate = 0
        this.controlsHide = false
        if (this.cleared) {
          this.cleared = false
          this.timer = setInterval(() => {      
            if (this.lastdate >= 3) {
              this.controlsHide = true                
              this.tunnelShow = false
              this.cleared = true
              clearInterval(this.timer)
            } else {
              this.lastdate++
            }
          }, 1000)
        }
      }
      this.$refs.wrap.onmouseleave = () => {
        this.lastdate = 0
      }
      //点击键盘controls不下滑
      window.onkeydown = () => {
        this.lastdate = 0
      }
    }
  },
  beforeDestroy() {
    window.onresize = null
    this.bulletSys = null
    window.onresize = null
    this.$refs.wrap.onmousemove = null
    this.$refs.wrap.onmouseleave = null
    this.$refs.wrap.onmouseenter = null
    window.onmouseup = null
    window.onmousemove = null
    window.onkeydown = null
    clearInterval(this.timer)
    clearInterval(this.nowTimer)
    clearInterval(this.timerForCount)
  },
  components: {
    Comment
  }
}
</script>

<style lang="scss" scoped>
@media screen and (max-width: 1300px){
  #app-video {
    width: 780px !important;
  }
}

@media screen and (max-width: 414px){
  #app-video {
    width: 100% !important;
    .video-wrap {
      width: 100% !important;
      .controls-left,.controls-right {
        width: 50%!important;

      }
      .controls-center {
        width: 0!important;
        overflow: hidden !important;
      }
    }
  }
}

 #app-video {
   width: 1300px;
   background-color: #eee;
   overflow: hidden;
   .title {
     width: 100%;
     text-align: center;
     color: #ddd;
     padding: 10px 0;
     white-space: nowrap;
     text-overflow: ellipsis;
     overflow: hidden;
     background-color: #444;
   }
   .video-wrap {
     position: relative;
     top: 0;
     left: 0;
     width: 780px;
     height: auto;
     margin: 0 auto;
     background-color: #000;
     overflow: hidden;
     &.full-screen {
      position: fixed;
      top: 0;
      left: 0;
      width: 120%;
      height: 100%;
      overflow: hidden;
      z-index: 500;
    }
     video {
       position: relative;
       margin: 0 auto;
       z-index: 98;
       object-fit: fill;
     }
     .loadingOrError-msg {
       position: absolute;
       top: 0;
       left: 0;
       width: 100%;
       height: 100%;
       font-size: 20px;
       text-align: center;
       color: #fff;
       background-color: #000;
       z-index: 101;
     }
     canvas {
      position: absolute;
      top: 0;
      left: 0;
      z-index: 99;
     }
   }
   //height 40px
   .controls {
     position: absolute;
     bottom: 0;
     left: 0;
     width: 100%;
     height: 40px;
     background-color: rgba($color: #333, $alpha: 1);
     z-index: 100;
     transform: translateY(0px);
     transition: transform .5s;
     z-index: 100;
     line-height: 40px;
     opacity: .8;
     &.hide {
       transform: translateY(40px);
     }
     &.full-screen {
       position: fixed;
       bottom: 0;
       left: 0;
       width: 100%;
       z-index: 6000;
     }
      .controls-progress {
       width: 100%;
       position: absolute;
       top: 0;
       left: 0;
       cursor: pointer;
       .progress-tunnel {
         position: relative;
         width: 100%;
         height: 3px;
         background-color: #666;
         .progress-dot {
           position: absolute;
           top: -2px;
           left: 0;
           width: 8px;
           height: 8px;
           background-color: #00a1e7;
           border-radius: 50%;
           transform: translateX(0);
           z-index: 3000;
         }
       }
      }
      .controls-left {
        width: 20%;
        float: left;
        line-height: 40px;
        vertical-align: middle;
        .playcontrol {
          float: left;
          width: 16px;
          height: 40px;
          margin-left: 15px;
          cursor: pointer;   
          background-position: center;
          background-repeat: no-repeat;
          &.play {
            background-image: url("http://192.168.43.22:2000/public/imgs/play.png");      
          }
          &.pause {
            background-image: url("http://192.168.43.22:2000/public/imgs/pause.png");   
          }
        }
        .bullet-status {
          position: relative;
          float: left;
          width: 18px;
          color: #00a1e7;
          font-size: 14px;
          line-height: 40px;
          margin-left: 14px;
          cursor: pointer;
          &.off {
            color: #ddd;
          }
          // border: 1px solid #ddd;
          // border-radius: 50%;
          .mask {
            display: none;
            position: absolute;
            top: 20px;
            left: -3px;
            width: 0;
            height: 0;
            border: 9px solid rgba($color: #333, $alpha: 1);
            border-radius: 50%;
            border-top: transparent;
            border-top-left-radius: 0;
            border-top-right-radius: 0;
            &.show {
              display: block;
            }
          }
        }
      }
      .controls-center {
        float: left;
        width: 60%;
        height: 40px;
        label {
          float: left;
          height: 40px;
          color: #ddd;
        }
        input {
          float: left;
          margin: 8px 0;
          width: 50%;
          height: 24px;
          border-radius: 10px;
          text-indent: 10px;
        }
        button {
          float: left;
          padding: 0 10px;
          height: 24px;
          background-color: #00a1e7;
          margin: 8px 0;
          color: #fff;
          border-radius: 8px;
          margin-left: 10px;
          line-height: 24px;
          cursor: pointer;
        }
      }
      .controls-right {
        float: left;
        width: 20%;
        height: 40px;
        .volume {
          position: relative;
          float: right;
          width: 18px;
          height: 18px;
          margin: 10px;
          background: url("http://192.168.43.22:2000/public/imgs/volume.png");
          background-size: cover;
          .tunnel {
            position: absolute;
            bottom: 0;
            left: 0px;
            height: 100px;
            transform: translateY(-16px);
            background-color: #333;
            &:after {
              position: absolute;
              background-color: #ddd;
              content: "";
              left: 7px;
              width: 4px;
              height: 100px;
            }
            .dot {
                position: absolute;
                left: 5px;
                bottom: 0px;
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background-color: #00a1e7;
                z-index: 20;
                transform: translateY(-50px)
              }
            
          }
        }
        .full-screen-btn {
          float: right;
          width: 18px;
          height: 18px;
          margin: 10px;
          background: url("http://192.168.43.22:2000/public/imgs/full_screen.png") no-repeat;
          background-size: cover;
        }
      }
   }
 }
</style>
