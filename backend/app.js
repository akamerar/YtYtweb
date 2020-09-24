var express = require('express')
var session = require('express-session')
//session本地存储
var FileStore = require('session-file-store')(session)
var bodyParser = require('body-parser')

//挂载路由
var common = require('./routers/common')
var login = require('./routers/login')
var register = require('./routers/register')
var userCenter = require('./routers/userCenter')
var forgetPassword = require('./routers/forgetPsw')
var video = require('./routers/video')

var app = express()

// 处理跨域cors
app.all('*', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:8080')
  res.header(
      'Access-Control-Allow-Headers',
      'Content-Type,Content-Length, Authorization, Accept,X-Requested-With'
  )
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS')
  res.header('X-Powered-By', ' 3.2.1')
  if (req.method == 'OPTIONS') res.send(200) /*让options请求快速返回*/
  else next()
})

//开放静态资源
app.use('/public', express.static('public'))
app.use('/', express.static('dist'))


//body-parser配置
//parse application/x-www-from-urlencoded
app.use(bodyParser.urlencoded({
  extended: false
}))
//parse application/json
app.use(bodyParser.json())

//use session配置session
app.use(session({
  secret: 'ytsecret', //用于cookie加密字符串
  //下面选项保证了不记住密码用户可以保持登录状态
  resave: true,
  //是否未初始化就给一个session
  saveUninitialized: false,
  store: new FileStore({
    path: './sessions',
    retries: 0, //不重试
    reapInterval: 60 * 60, //清除过期会话每1hour
  }),//本地存储session（文本文件，也可以选择其他store，比如redis的）
  cookie: {
    maxAge: 1000 * 60 * 5  //默认时效五分钟
  },
  // rolling: ture //每次请求时强制设置cookie 会重置过期时间
}))

app.engine('html', require('express-art-template'))
//更改模板引擎渲染默认目录
// app.set('views', 'dist')

// middleware that is specific to this router
app.use(function timeLog(req, res, next) {
  console.log('Time: ', Date.now())
  next()
})

//挂载路由
app.use('/login', login)
app.use('/register', register)
app.use('/userCenter', userCenter)
app.use('/forgetPassword', forgetPassword)
app.use('/video', video)
app.use('/', common)

app.listen(2000, function () {
  console.log('server is running on port 2000!')
})