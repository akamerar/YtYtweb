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

//login业务
//1.登录验证
router.get('/', function (req, res) {
  //连接数据库
  var username = req.query.username
  var password = req.query.password
  connection.query('select userID,username,birthday,sex,phone,createTime,lastLoginTime from user where (username = ? or phone = ?) and password = ?', [username, username, password], function (err, data, fields) {
    if (err) {
      res.status(500).json({
        "ok": false,
        "err": 0,
        "ret_msg": '数据库访问失败'
      })
    } else {
      //账号密码错误
      if (data.length == 0) {
        res.status(200).json({
          "ok": false,
          "err": 1,
          "ret_msg": '账号密码错误'
        })
      } else {
        //账号密码正确
        //将时间格式化成"yyyy-mm-dd"形式
        var formatDate = (date) => {
          if (date == null) {
            return null
          }
          var y = date.getFullYear();
          var m = date.getMonth() + 1;
          m = m < 10 ? "0" + m : m;
          var d = date.getDate();
          d = d < 10 ? "0" + d : d;
          return y + "-" + m + "-" + d;
        }
        data[0].birthday = formatDate(data[0].birthday)
        var phone = data[0].phone
        var phoneStart = phone.substring(0, 3)
        var phoneEnd = phone.substring(8, 11)
        data[0].phone = {
          "all": phone,
          "start": phoneStart,
          "end": phoneEnd
        }
        req.session.user = data[0]
        if (data.length != 0 && req.query.remPsw === 'true') {
          req.session.cookie.maxAge = 1000 * 60 * 60 * 24 * 3 //保存三天
        } else {
          req.session.cookie.maxAge = 1000 * 60 * 5//保存五分钟
        }
        //写入最近登录时间
        var date = new Date()
        connection.query('update user set lastLoginTime = ? where userID = ?', [date, data[0].userID])
        res.status(200).json({
          "ok": true,
          "ret_msg": '登录成功'
        })
      }
    }
  })
})
//2.获得salt
router.get('/getSalt', function (req, res) {
  connection.query('select salt from user where username = ? or phone = ?', [req.query.username, req.query.username], function (err, data, fields) {
    if (err) {
      console.log(err)
      res.status(200).json({
        "ok": false,
        "ret_msg": '数据库访问失败'
      })
    } else {
      res.status(200).json({
        "ok": true,
        ...data[0],
        "ret_msg": '获取salt成功'
      })
    }
  })
})

module.exports = router