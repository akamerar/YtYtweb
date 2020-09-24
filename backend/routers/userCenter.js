var express = require('express'),
    router = express.Router(),

    fs = require('fs'),
    path = require('path'),
    //处理文件表单
    formidable = require('formidable'),

//导入数据库中间件
    mysql = require('mysql'),
//阿里云短信服务
    Core = require('@alicloud/pop-core')

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

//用户中心业务
//1.更新用户数据
router.get('/updateUserMsg', function (req, res) {
  //验证用户合法性
  //不合法
  if (!req.session || !req.session.user || req.session.user.userID != req.query.userID) {
    res.status(500).json({
      "ok": false,
      "ret_msg": "您的操作不合法！"
    })
  } else {
    //合法
    var username = req.query.username,
        sex = req.query.sex,
        birthday = req.query.birthday || null,
        userID = req.query.userID
    connection.query('update user set username = ?, sex = ?, birthday = ? where userID = ?', [username, sex, birthday, userID], function (err, data, fields) {
      if (err) {
        console.log(err)
        res.status(200).json({
          "ok": false
        })
      } else {
        //修改session信息
        if (req.session && req.session.user) {
          req.session.user.sex = sex
          req.session.user.username = username
          req.session.user.birthday = birthday
        }
        res.status(200).json({
          "ok": true
        })
      }
    })
  }
})
//2.安全中心
//2.1检查密保问题
router.get('/security/checkQuestionStatus', function (req, res) {
  //验证用户合法性
  //不合法
  if (!req.session || !req.session.user || req.session.user.userID != req.query.userID) {
    res.status(500).json({
      "ok": false,
      "ret_msg": "您的操作不合法！"
    })
  } else {
    var userID = req.query.userID
    connection.query('select * from user_security inner join user on user_security.userID = user.userID where user.userID = ?', [userID], function (err, data, feilds) {
      if (err) {
        //数据库访问出错
        console.log(err)
        res.status(200).json({
          "ok": false
        })
      } else {
        //访问到数据
        if (data.length != 0) {
          //已经设置了密保
          res.status(200).json({
            "ok": true,
            "isSet": true,
          })
        } else {
          //没有设置密保
          res.status(200).json({
            "ok": true,
            "isSet": false,
          })
        }
      }
    })
  }
})
//2.2发送验证码
//2.3验证验证码
router.get('/security/verifySmsCode', function (req, res) {
  var phone = req.query.phone,
      code = req.query.code,
      purpose = req.query.purpose
  if (!req.session.smsCode || req.session.smsCode.phone != phone) {
    res.status(200).json({
      "ok": false,
      "err": 0,
      "ret_msg": "您的验证码已过期"
    })
  } else if (req.session.smsCode.code === code && req.session.smsCode.purpose === purpose) {
    req.session.smsCode.hasPass = true
    res.status(200).json({
      "ok": true,
      "ret_msg": "验证成功"
    })
  } else {
    res.status(200).json({
      "ok": false,
      "err": 1,
      "ret_msg": "验证码错误"
    })
  }
})
//2.4设置密保问题
router.get('/security/setQuestion', function (req, res) {
  var userID = req.query.userID
  //验证码是否通过
  if (!req.session || !req.session.smsCode || req.session.smsCode.purpose != "setQuestion" || req.session.smsCode.hasPass == false) {
    res.status(500).json({
      "ok": false,
      "ret_msg": "您还未通过验证"
    })
    //用户是否登录    
  } else if (!req.session.user || req.session.user.userID != userID) {
    res.status(500).json({
      "ok": false,
      "ret_msg": "您的操作不合法"
    })
  } else {

    var question1 = req.query.question1
    var question2 = req.query.question2
    var question3 = req.query.question3

    var answer1 = req.query.answer1
    var answer2 = req.query.answer2
    var answer3 = req.query.answer3

    connection.query('insert into user_security values (?, ?, ?, ?, ?, ?, ?)', [userID, question1, answer1, question2, answer2, question3, answer3], function (err, data, fields) {
      if (err) {
        console.log(err)
        res.status(200).json({
          "ok": false,
          "ret_msg": "写入失败，数据库访问失败"
        })
      } else {
        //清空验证码
        req.session.smsCode = null
        res.status(200).json({
          "ok": true,
          "ret_msg": "写入成功"
        })
      }
    })
  }
})
//2.5设置新手机
router.get('/security/setPhone', function (req, res) {
  var userID = req.query.userID
  //验证验证码是否通过
  if (!req.session || !req.session.smsCode || req.session.smsCode.purpose != "setPhone" || req.session.smsCode.hasPass == false) {
    res.status(500).json({
      "ok": false,
      "ret_msg": "您还未通过验证"
    })
    //验证是否登录
  } else if (!req.session.user || !req.session.userID != userID) {
    res.status(500).json({
      "ok": false,
      "ret_msg": "您未登录，操作非法"
    })
  } else {
    var phone = req.query.phone
    connection.query('update user set phone = ? where userID = ?', [phone, userID], function (err, data, fields) {
      if (err) {
        console.log(err)
        res.status(200).json({
          "ok": false,
          "ret_msg": "写入失败，数据库访问失败"
        })
      } else {
        //清除验证码
        req.session.smsCode = null
        res.status(200).json({
          "ok": true,
          "ret_msg": "修改成功"
        })
      }
    })
  }
})

//3.修改密码
//3.1获得密保问题（无答案）
router.get('/changePassword/getQuestion', function (req, res) { 
  var userID = req.query.userID
  //验证用户是否登录
  if (!req.session || !req.session.user || req.session.user.userID != userID) {
    res.status(500).json({
      "ok": false,
      "ret_msg": "您的操作非法"
    })
  } else {
    connection.query('select question1, question2, question3 from user_security where userID = ?', [userID], function(err, data, fields) {
      if (err) {
        console.log(err)
        res.status(500).json({
          "ok": false,
          "ret_msg": "数据库访问失败"
        })
      } else {
        if (data.length == 0) {
          res.status(200).json({
            "ok": true,
            "ret_msg": "您还未设置密保"
          })
        } else {
          res.status(200).json({
            "ok": true,
            "data": data[0],
            "ret_msg": "成功"
          })
        }
      }
    })
  }
})
//3.2验证密保正确性
router.get('/changePassword/verifyQuestion', function (req, res) {
  var userID = req.query.userID,
      question1 = req.query.question1,
      question2 = req.query.question2,
      question3 = req.query.question3,
      answer1 = req.query.answer1,
      answer2 = req.query.answer2,
      answer3 = req.query.answer3
  if (!req.session || !req.session.user || req.session.user.userID != userID) {
    res.status(500).json({
      "ok": false,
      "ret_msg": "您的操作非法"
    })
  } else {
    connection.query('select answer1, answer2, answer3 from user_security where userID = ? and question1 = ? and question2 = ? and question3 = ?', [userID, question1, question2, question3], function (err, data, fields) { 
      if (err) {
        console.log(err)
        res.status(500).json({
          "ok": false,
          "err": 0,
          "ret_msg": "数据库访问失败"
        })
      } else {
        if (data.length == 0) {
          res.status(200).json({
            "ok": false,
            "err": 1,
            "ret_msg": "您有非法操作!"
          })
        } else if (data[0].answer1 != answer1 || data[0].answer2 != answer2 || data[0].answer3 != answer3){
          res.status(200).json({
            "ok": false,
            "err": 2,
            "ret_msg": "验证失败，回答有错"
          })
        } else {
          req.session.questionPass = true
          res.status(200).json({
            "ok": true,
            "ret_msg": "验证成功"
          })
        }
      }
    })
  }
})
//3.3修改密码(必须登录)
router.get('/changePassword/setNewPassword', function (req, res) {
  var userID = req.query.userID,
      password = req.query.password,
      salt = req.query.salt
  if (!req.session || !req.session.user || req.session.user.userID != userID) {
    res.status(500).json({
      "ok": false,
      "ret_msg": "您有非法操作!"
    })
  } else if ((!req.session.smsCode || req.session.smsCode.purpose != 'changePassword' || req.session.smsCode.hasPass == false) && (!req.session.questionPass || req.session.questionPass != true)) {
    res.status(200).json({
      "ok": false,
      "ret_msg": "您未通过验证或验证时间已过!"
    })
  } else {
    connection.query('update user set password = ?, salt = ? where userID = ?', [password, salt, userID], function(err) {
      if (err) {
        console.log(err)
        res.status(500).json({
          "ok": false,
          "ret_msg": "服务器错误"
        })
      } else {
        req.session.questionPass = false
        res.status(200).json({
          "ok": true,
          "ret_msg": "修改成功"
        })
      }
    })
  }
})

//上传视频
router.post('/uploadVideo', function (req, res) {
  var fileType = "",
      fileHash = "",
      videoID = 0,
      videoname = "",
      videoInfo = "",
      videoType = "",
      videoLabel = [],
      videoDuration = "",
      userID = null,
      cover = "0",
      oldFilePath = "",
      oldCoverPath = "",
      coverType = "",
      desDir = ""
  //创建文件表单解析对象
  var form = new formidable.IncomingForm({
    uploadDir: path.resolve(__dirname, '../public/videos/'),
    maxFileSize: 500 * 1024 * 1024,//文件大小限制500m
    keepExtensions: false,
    hash: 'md5'
  })
  form.parse(req, function(err, fields, files) {  
    //身份验证
    userID = fields.userID
    if (!req.session || !req.session.user || req.session.user.userID != userID) {
      res.status(200).json({
        "ok": false,
        "ret_msg": "您未通过验证!"
      })
      return false
    } else {
      fileType = files.file.type.replace(/^.+\//g, "")
      fileHash = files.file.hash
      //视频默认保存地址
      oldFilePath = files.file.path
      //是否有封面 没有为null
      if (files.cover) {
        cover = "1"
        oldCoverPath = files.cover.path
        coverType = files.cover.type.replace(/^.+\//g, "")
      }
      videoname = fields.videoname
      videoInfo = fields.videoInfo
      videoType = fields.videoType
      videoLabel = fields.videoLabel
      videoDuration = fields.videoDuration
    }
  })
  form.on('end', function() {
    f()
    async function f() {
      try {
        //存入数据库
        await new Promise((resolve, reject) => {
          connection.query('insert into video (videoID, userID, videoname, videoInfo, videoType, videoLabel, videoDuration, format, cover, coverType, videoMD5, videoCreateTime) values (?,?,?,?,?,?,?,?,?,?,?,?)', [+videoID, +userID, videoname, videoInfo, videoType, videoLabel, videoDuration, fileType, cover, coverType, fileHash, new Date()], function (err, data) {
            if (err) {
              reject(err)
            } else {
              videoID = "" + data.insertId
              resolve(videoID)
            }
          })
        })
        desDir = path.resolve(__dirname, '../public/videos/', videoID)
        //新建文件夹
        await new Promise((resolve, reject) => {
          fs.exists(desDir, function (exists) {
            if (!exists) {
              fs.mkdir(desDir, function (err) { 
                if (err) {
                  reject(err)
                } else {
                  resolve()
                }
              })
            }
          })
        })
        //在文件夹中复制文件
        //复制视频
        await new Promise((resolve, reject) => {
          fs.rename(oldFilePath, path.resolve(__dirname, '../public/videos/', videoID, videoname + '.' + fileType), function (err) { 
            if (err) {
              reject(err)
            } else {
              resolve()
            }
          })
        })
        //是否有cover
        if (oldCoverPath) {
          //如果有
          await new Promise((resolve, reject) => {
            fs.rename(oldCoverPath, path.resolve(__dirname, '../public/videos/', videoID, "cover." + coverType), function (err) { 
              if (err) {
                reject(err)
              } else {
                resolve()
              }
            })
          })
        }
        res.status(200).json({
          "ok": true,
          "ret_msg": "上传成功！"
        })
      } catch (err) {
        console.log(err)
        res.status(200).json({
          "ok": false,
          "ret_msg": "上传失败！"
        })
      }
    }
  })
  form.on('aborted', function() {
    res.status(200).json({
      "ok": false,
      "ret_msg": "上传中断"
    })
  })

  
  /**
   * form.encoding = 'utf-8'
     是否包含扩展名
      form.keepExtensions = true
     限制字段大小20m
      form.maxFieldsSize = 20 * 1024 * 1024
     限制文件大小200m
      form.maxFileSize = 200 * 1024 * 1024
     如果要为传入文件计算校验和，请将其设置为'sha1'或'md5'
      form.hash = true
     如果启用此选项，则在调用时form.parse，files参数将包含用于使用HTML5 multiple属性提交多个文件的输入的文件数组。
      form.multiples = false
     到目前为止，此表单收到的字节数
      form.bytesReceived
     此表单中的预期字节数
      form.bytesExpected
     传入解析req数据
   * file.size 当前已经上传的文件字节大小
     file.path 当前文件正在写入的路径
     file.name 文件的名字
     file.mime 文件mime类型
     file.hash 读取文件16bithash
     文件进度
     form.on('progress', function(bytesReceived, bytesExpected) {

     })
     收到字段/值发出
     form.on('field', function(name, value) {
     })
     收到文件/字段发出
     form.on('file', function(name, file) {
     });
     新文件接收
     form.on('fileBegin', function(name, file) {
     });
     接收出错
     form.on('error', function(err) {
     })
     中止
     form.on('aborted', function() {
     });
     完毕
     form.on('end', function() {
     });
   * 
   */
  
})

//获取userID 第n-m个投稿通过/未通过/待审核的视频信息
router.get('/getMySubmit', function (req, res) { 
  var userID = +req.query.userID,
      start = +req.query.start,
      number = +req.query.number,
      type = req.query.type //0:uncheck 1:pass 2:unpass String
  //验证用户合法性
  if (!req.session || !req.session.user || req.session.user.userID != userID) {
    res.status(200).json({
      "ok": false,
      "ret_msg": "您未通过验证"
    })
  } else {
    connection.query('select videoID, videoname, videoInfo, videoType, videoLabel, viewCount, videoDuration, cover, coverType, bulletCount, videoCreateTime from video where userID = ? and checkPass = ? group by videoID order by videoCreateTime desc limit ?,?', [userID, type, start, number], function (err, data) { 
      if (err) {
        console.log(err)
        res.status(500).json({
          "ok": false,
          "ret_msg": "服务器出错"
        })
      } else {
        res.status(200).json({
          "ok": true,
          "data": data,
          "ret_msg": "查询成功"
        })
      }
    })
  }
})

//获取userID 各种视频数量
router.get('/getVideoTypeCount', function (req, res) { 
  var userID = +req.query.userID,
      type = "" + req.query.type
  if (!req.session || !req.session.user || req.session.user.userID != userID) {
    res.status(200).json({
      "ok": false,
      "ret_msg": "您未通过验证"
    })
  } else {
    connection.query('select count(*) as total from video where userID = ? and checkPass = ?', [userID, type], function (err, data) { 
      if (err) {
        console.log(err)
        res.status(200).json({
          "ok": false,
          "ret_msg": "服务器出错"
        })
      } else {
        res.status(200).json({
          "ok": true,
          "data": data[0],
          "ret_msg": "数据获取成功"
        })
      }
    })
  }
})
module.exports = router