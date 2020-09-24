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

//注册业务
//1.验证用户名是否存在
router.get('/verifyUsername', function (req, res) {
  connection.query('select * from user where username = ?', [req.query.username], function (err, data, fields) {
    if (err) {
      console.log('数据库访问出错：', err)
      //访问数据库出错
      res.status(200).json({
        "ok": false,
        "ret_msg": '数据库访问失败'
      })
    } else {
      if (data.length != 0) {
        //存在用户名
        res.status(200).json({
          "ok": true,
          "hasUser": true,
          "ret_msg": '用户名已被注册'
        })
      } else {
        //不存在用户名
        res.status(200).json({
          "ok": true,
          "hasUser": false,
          "ret_msg": '用户名可以使用'
        })
      }
    }
  })
})
//2.验证手机号是否存在
router.get('/verifyPhone', function (req, res) {
  connection.query('select phone from user where phone = ?', [req.query.phone], function (err, data, fields) {
    if (err) {
      res.status(500).json({
        "ok": false,
        "ret_msg": '数据库写入失败'
      })
    } else {
      res.status(200).json({
        "ok": true,
        data,
        "ret_msg": '查询成功'
      })
    }
  })
})
//3.手机验证码业务 (通用业务验证码业务)

//4.验证及注册
router.get('/verifySmsCode', function (req, res) {
  //session不存在
  if (!(req.session && req.session.smsCode && req.session.smsCode.purpose === 'register' && req.session.smsCode.hasPass == false)) {
    res.status(200).json({
      "ok": false,
      "status": 0,
      "ret_msg": '验证码已过期'
    })
  } else if (req.session.smsCode.phone != req.query.phone) {
    //手机号不一致
    res.status(200).json({
      "ok": false,
      "status": 1,
      "ret_msg": '验证码已过期,可能是手机号码改变'
    })
  } else if (req.session.smsCode.code != req.query.code) {
    //验证码不一致
    res.status(200).json({
      "ok": false,
      "status": 2,
      "ret_msg": '验证码不一致'
    })
  } else {
    //注册成功
    req.session.smsCode.hasPass = true
    if (req.session.smsCode.hasPass) {
      var date = new Date()
      connection.query('insert into user (username, password, salt, phone, createTime) values(?, ?, ?, ?, ?)', [req.query.username, req.query.password, req.query.salt, req.query.phone, date], function (err, data, fields) {
        if (err) {
          console.log(err)
          res.status(500).json({
            "ok": false,
            "status": 0,
            "ret_msg": "数据库写入失败"
          })
        } else {
          res.status(200).json({
            "ok": true,
            "status": 0,
            "ret_msg": "注册成功"
          })
        }
      })
    } else {
      res.status(500).json({
        "ok": false,
        "ret_msg": "您的操作非法"
      })
    }
  }
})

module.exports = router