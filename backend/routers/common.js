var express = require('express')
var router = express.Router()
//导入数据库中间件
var mysql = require('mysql')
//阿里云短信服务
const Core = require('@alicloud/pop-core')
var client = new Core({
  accessKeyId: 'LTAIONioW3U0jBcP',
  accessKeySecret: 'FqHN215WkmyIl9QatYNO8h1ahXlDIG',
  endpoint: 'https://dysmsapi.aliyuncs.com',
  apiVersion: '2017-05-25'
})
//计时器存储器
const timer = {}
//短信请求设置
var requestOption = {
  method: 'POST'
}
//短信参数
var params = {
  "RegionId": "cn-hangzhou",
  "PhoneNumbers": "",
  "SignName": "ytyt视频网站",
  "TemplateCode": "SMS_160577004",
  "TemplateParam": ""
}
//获得随机验证码
function getCode(n) {
  var arr = []
  var arrList = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']
  for (var i = 0; i < n; i++) {
    var random = parseInt(Math.random() * 10)
    arr.push(arrList[random])
  }
  arr = arr.join('')
  return arr
}

//数据库配置参数
dbOptions = {
  host: 'localhost',
  user: 'root',
  password: '',
  port: '3306',
  database: 'ytytweb'
}
const connection = mysql.createConnection(dbOptions)
connection.connect()

router.get('/', function (req, res) {
  res.html('../dist/index.html')
})

//自动登录and保持登录and更新最新信息
router.get('/user', function (req, res) {
  if (req.session && req.session.user) {
    var data = req.session.user
    var date = new Date()
    connection.query('update user set lastLoginTime = ? where userID = ?', [date, data.userID])
    res.status(200).json({
      "ok": true,
      "data": data
    })
  } else {
    console.log('没有读到session')
    res.status(200).json({
      "ok": false
    })
  }
})

//用户退出登录
router.get('/exit', function (req, res) {
  if (req.session && req.session.user) {
    req.session.user = null
  }
  req.session.destroy()
  res.status(200).json(({
    "ok": true,
    "ret_msg": '退出成功'
  }))
})

//3.手机验证码业务 (通用业务验证码业务)
router.get('/smsCode', function (req, res) {
  var phone = req.query.phone
  var purpose = req.query.purpose
  params.PhoneNumbers = phone
  var code = getCode(4)
  params.TemplateParam = JSON.stringify({
    "code": code
  })
  // console.log(params)
  client.request('SendSms', params, requestOption).then((result) => {
    console.log(result)
    //设置session
    req.session.smsCode = {
      phone,
      code,
      purpose
    }
    //如果是第一次
    if (!timer["p" + phone]) {
      timer["p" + phone] = {}
    }
    //如果上次的计时器还没停止则手动停止
    if (timer["p" + phone].timer && !timer["p" + phone].timer._destroyed) {
      clearInterval(timer["p" + phone].timer)
    }
    //新开一个计时器
    //设置验证码过期时间
    timer["p" + phone].time = 300
    timer["p" + phone].timer = setInterval(() => {
      timer["p" + phone].time--
      if (timer["p" + phone].time <= 0) {
        req.session.smsCode = null
        req.session.save()
        clearInterval(timer["p" + phone].timer)
      }
    }, 1000)

    res.status(200).json({
      ok: true,
      ret_msg: '短信发送成功'
    })
  }, (err) => {
    console.log(err)
    res.status(200).json({
      ok: false,
      ret_msg: '短信发送失败，请重试'
    })
  })
})

//4.使验证码过期
router.get('/clearSms', function (req, res) {
  if (req.session && req.session.smsCode) {
    req.session.smsCode = null
    res.status(200).json({
      ok: true,
      ret_msg: '清除成功'
    })
  } else {
    res.status(200).json({
      ok: false,
      ret_msg: '无sms记录'
    })
  }
})

//5.检查手机号是否存在
router.get('/searchPhone', function (req, res) { 
  var phone = req.query.phone
  connection.query('select phone from user where phone = ?', [phone], function (err, data, fields) {
    if (err) {
      console.log(err)
      res.status(500).json({
        ok: false,
        ret_msg: '数据库访问出错'
      })
    } else {
      if (data.length == 0) {
        res.status(200).json({
          ok: false,
          ret_msg: '无此手机号'
        })
      } else {
        res.status(200).json({
          ok: true,
          ret_msg: '有次手机号'
        })
      }
    }
  })
})

//获取用户名
router.get('/getUserName', function (req, res) { 
  var userID = +req.query.userID
  connection.query('select username from user where userID = ?', [userID], function (err, data) {
    if (err) {
      console.log(err)
      res.json({
        "ok": false,
        "ret_msg": "服务器出错"
      })
    } else {
      res.json({
        "ok": true,
        "data": data[0].username,
        "ret_msg": "success"
      })
    }
  })
})
module.exports = router