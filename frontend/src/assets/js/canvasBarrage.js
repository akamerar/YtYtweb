export default function CanvasBarrage(canvas, video, options) {
  if (!canvas || !video) {
    console.error('请正确传入参数')
    return false
  }
  var defaults = {
    opacity: 100,
    fontSize: 24,
    speed: 2,
    range: [0, 1],
    color: 'white',
    data: []
  }
  options = options || {}
  var params = {}
  for (var key in defaults) {
    if (options[key]) {
      params[key] = options[key]
    } else {
      params[key] = defaults[key]
    }
    this[key] = params[key]
  }
  var top = this
  var data = top.data
  if (!data || !data.length) {
		console.log('无数据！')
  }
  var context = canvas.getContext('2d')
  var bullet = {}
  // 暂停与否
  var isPause = true
  // 播放时长
  var time = video.currentTime
  // 弹幕实例方法
  var Barrage = function (obj) {
    this.bulletContent = obj.bulletContent
    this.time = obj.time
    this.init = function () {
      var speed = top.speed
      if (obj.hasOwnProperty('speed')) {
        speed = obj.speed
      }
      if (speed !== 0) {
        speed = speed + obj.bulletContent.length / 100
      }
      // 字号大小
      var fontSize = obj.fontSize || top.fontSize
      //文字颜色
      var color = obj.color || top.color
      // 转换成rgb颜色
      color = (function () {
        var div = document.createElement('div')
        div.style.backgroundColor = color
        document.body.appendChild(div)
        var c = window.getComputedStyle(div).backgroundColor
        document.body.removeChild(div)
        return c
      })()
      // range范围
      var range = obj.range || top.range
      // 透明度
      var opacity = obj.opacity || top.opacity
      opacity = opacity / 100
      // 计算出内容长度
      var span = document.createElement('span')
      span.style.position = 'absolute'
      span.style.whiteSpace = 'nowrap'
      span.style.font = 'bold ' + fontSize + 'px "microsoft yahei", sans-serif'
      span.innerText = obj.bulletContent
      span.textContent = obj.bulletContent
      document.body.appendChild(span)
      // 求得文字内容宽度
      this.width = span.clientWidth
      // 移除dom元素
      document.body.removeChild(span)
      // 初始水平位置和垂直位置
      this.x = canvas.width
      if (speed == 0) {
        this.x = (this.x - this.width) / 2
      }
      this.actualX = canvas.width
      this.y = range[0] * canvas.height + (range[1] - range[0]) * canvas.height * Math.random()
      if (this.y < fontSize) {
        this.y = fontSize
      } else if (this.y > canvas.height - fontSize) {
        this.y = canvas.height - fontSize
      }
      this.moveX = speed
      this.opacity = opacity
      this.color = color
      this.range = range
      this.fontSize = fontSize
    }
    this.draw = function () {
      // 根据此时x位置绘制文本
      context.shadowColor = 'rgba(0,0,0,' + this.opacity + ')'
      context.shadowBlur = 2
      context.font = this.fontSize + 'px "microsoft yahei", sans-serif'
      if (/rgb\(/.test(this.color)) {
        context.fillStyle = 'rgba(' + this.color.split('(')[1].split(')')[0] + ',' + this.opacity + ')'
      } else {
        context.fillStyle = this.color
      }
      // 填色
      context.fillText(this.bulletContent, this.x, this.y)
    }
  }
  //加载弹幕
  data.forEach(function (obj, index) {
    bullet[index] = new Barrage(obj)
  })
  // 绘制弹幕文本
  var draw = function () {
    for (var index in bullet) {
      var barrage = bullet[index]
      if (barrage && !barrage.disabled && time >= barrage.time) {
        if (!barrage.inited) {
          barrage.init()
          barrage.inited = true
        }
        barrage.x -= barrage.moveX
        if (barrage.moveX == 0) {
          // 不动的弹幕
          barrage.actualX -= top.speed
        } else {
          barrage.actualX = barrage.x
        }
        // 移出屏幕
        if (barrage.actualX < -1 * barrage.width) {
          // 下面这行给speed为0的弹幕
          barrage.x = barrage.actualX
          // 该弹幕不运动
          barrage.disabled = true
        }
        // 根据新位置绘制圆圈圈
        barrage.draw()
      }
    }
  }
  // 画布渲染
  var render = function () {
    // 更新已经播放时间
    time = video.currentTime
    // 清除画布
    context.clearRect(0, 0, canvas.width, canvas.height)
    // 绘制画布
    draw()
    // 继续渲染
    if (isPause == false) {
      requestAnimationFrame(render)
    }
	}
	
	// 重置
  this.reset = function () {
    this.time = video.currentTime
    // 画布清除
    context.clearRect(0, 0, canvas.width, canvas.height)
    for (var index in bullet) {
      var barrage = bullet[index]
      if (barrage) {
        // 状态变化
        barrage.disabled = false
        // 根据时间判断哪些可以走起
        if (time < barrage.time) {
          // 视频时间小于播放时间
          // barrage.disabled = true
          barrage.inited = null
        } else {
          // 视频时间大于播放时间
          barrage.disabled = true
        }
      }
    }
	}
	this.add = function (obj) {
    bullet[Object.keys(bullet).length] = new Barrage(obj)
  }

  // 视频处理
  video.addEventListener('play', function () {
    isPause = false
    render()
  })
  video.addEventListener('pause', function () {
    isPause = true
  })
  video.addEventListener('seeked', function () {
    // 跳转播放需要清屏
    top.reset()
  })
}
