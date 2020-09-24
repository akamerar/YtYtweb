var express = require('express')
var router = express.Router()
//导入数据库中间件
var mysql = require('mysql')

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

router.get('/getList', function (req, res) { 
  var type = req.query.type
  var number = +req.query.number
  if (type === '热门') {
    connection.query('select videoID, videoname, videoType, videoLabel, viewCount, cover, coverType, bulletCount, videoCreateTime from video where checkPass = 1 and (viewCount > 500 or bulletCount > 1000) order by RAND() limit ? ', [number], function (err, data) {
      if (err) {
        console.log(err) 
        res.status(200).json({
          "ok": false,
          "ret_msg": '服务器出错'
        })
      } else {
        res.status(200).json({
          "ok": true,
          "data": data,
          "ret_msg": "数据获取成功"
        })
      }
    })
  } else {
    connection.query('select videoID, videoname, videoType, videoLabel, viewCount, cover, coverType, bulletCount, videoCreateTime from video where checkPass = 1 and videoType = ? order by RAND() limit ? ', [type, number], function (err, data) {
      if (err) {
        console.log(err) 
        res.status(200).json({
          "ok": false,
          "ret_msg": '服务器出错'
        })
      } else {
        res.status(200).json({
          "ok": true,
          "data": data,
          "ret_msg": "数据获取成功"
        })
      }
    })
  }
})
//获得指定视频和弹幕的信息
router.get('/videoMsgAndBullet', function (req, res) { 
  var videoID = req.query.videoID
  connection.query('select * from video where videoID = ?', [videoID], function (err, data) { 
    if (err) {
      console.log(err)
      res.json({
        "ok": false,
        "ret_msg": "视频获取失败"
      })
    } else {
      connection.query('select * from bullet where videoID = ?', [videoID], function (err, bullet) { 
        if (err) {
          console.log(err)
          res.json({
            "ok": false,
            "ret_msg": "视频获取失败"
          })
        } else {
          res.json({
            "ok": true,
            "data": {
              "videoInfo": data[0],
              bullet,
            },
            "ret_msg": "视频信息获取成功"
          })
        }
      })
    }
  })
})

router.get('/getPageNumber', function (req, res) {
  var videoID = +req.query.videoID,
      perNumber = req.query.perNumber
  connection.query('select count(*) as total from comment where videoID = ? group by videoID', [videoID], function (err, data) { 
    if (err) {
      console.log(err)
      res.json({
        "ok": false,
        "ret_msg": "服务器出错"
      }) 
    } else if (data.length != 0){
      res.json({
        "ok": true,
        "data": parseInt(data[0].total%perNumber?data[0].total/perNumber+1:data[0].total/perNumber),
        "ret_msg": "查询成功"
      }) 
    }
  })
})
router.get('/sendBullet', function (req, res) {
  var userID = req.query.userID
  if (!req.session || !req.session.user || req.session.user.userID != userID) {
    res.json({
      "ok": false,
      "ret_msg": "您未通过验证"
    })
  } else {
    connection.query('insert into bullet(userID, videoID, bulletContent, color, time, bulletCreateTime) values (?,?,?,?,?,?)', [+userID, +req.query.videoID, req.query.bulletContent, req.query.color, +req.query.time, new Date()], function (err, data) {
      if (err) {
        console.log(err)
        res.json({
          "ok": false,
          "ret_msg": "服务器出错，发送失败"
        })
      } else {
        res.json({
          "ok": true,
          "ret_msg": "发送成功"
        })
      }
    })
  }
})
router.get('/getAuthorMsg', function (req, res) {
  var videoID = req.query.videoID
  connection.query('select * from user where userID = (select userID from video where videoID = ?)', [videoID], function (err, data) { 
    if (err) {
      console.log(err)
      res.json({
        "ok": false,
        "ret_msg": "服务器出错"
      })
    } else {
      res.json({
        "ok": true,
        "data": data[0],
        "ret_msg": "查询成功"
      })
    }
  })
})
router.get('/sendComment', function (req, res) {
  var videoID = req.query.videoID,
      userID = req.query.userID,
      commentContent = req.query.commentContent
  if (!req.session || !req.session.user || req.session.user.userID != userID) {
    res.json({
      "ok": false,
      "ret_msg": "您未通过验证"
    })
  } else {
    connection.query('insert into comment(userID, videoID, commentContent, commentCreateTime) values(?,?,?,?)', [userID, videoID, commentContent, new Date()], function (err) { 
      if (err) {
        console.log(err)
        res.json({
          "ok": false,
          "ret_msg": "服务器出错"
        })
      } else {
        res.json({
          "ok": true,
          "ret_msg": "评论成功"
        })
      }
    })
  }
})
router.get('/getComment', function (req, res) { 
  var videoID = +req.query.videoID
      number = +req.query.number
      page = +req.query.page
  connection.query('select * from comment join user on comment.userID = user.userID where videoID = ? order by commentCreateTime desc limit ?,? ', [videoID, (page-1)*number, number], function (err, data) { 
    if (err) {
      console.log(err)
      res.json({
        "ok": false,
        "ret_msg": "服务器出错"
      })
    } else {
      //查询每一条评论的回复评论
      data.forEach((item, index) => {
        connection.query('select replyCommentID,replyContent,replyCreateTime,replyType,replyToUserID,replyUserID,username from reply_comment join user on replyUserID = userID where commentID = ? order by replyCreateTime desc', [item.commentID], function (err, repdata) { 
          if (err) {
            console.log(err)
            res.json({
              "ok": false,
              "ret_msg": "服务器出错"
            })
          } else if (repdata.length != 0) {
            item.reply = repdata
          } else {
            item.reply = []
          }
          if (index == data.length - 1) {
            res.json({
              "ok": true,
              data,
              "ret_msg": "succees"
            })
          }
        })
      })
    }
  })
})
router.get('/sendReply', function (req, res) { 
  var commentID = +req.query.commentID,
      replyUserID = +req.query.replyUserID,
      replyToUserID = +req.query.replyToUserID,
      videoID = +req.query.videoID,
      replyContent = req.query.replyContent,
      replyType = req.query.replyType
  if (!req.session || !req.session.user || req.session.user.userID != replyUserID) {
    res.json({
      "ok": false,
      "ret_msg": "您未通过验证"
    })
  } else {
    connection.query('insert into reply_comment(commentID,replyUserID,replyToUserID,videoID,replyContent,replyType,replyCreateTime) values(?,?,?,?,?,?,?)', [commentID,replyUserID,replyToUserID,videoID,replyContent,replyType,new Date()], function (err) {
      if (err) {
        console.log(err)
        res.json({
          "ok": false,
          "ret_msg": "服务器出错"
        })
      } else {
        res.json({
          "ok": true,
          "ret_msg": "回复成功"
        })
      }
    })
  }
})
router.get('/searchVideo', function (req, res) {
  var keyWord = req.query.keyWord,
      page = +req.query.page,
      number = +req.query.number
  connection.query('select * from video where videoname like ? or videoInfo like ? or videoType like ? or videoLabel like ? or videoname like ? or videoInfo like ? or videoType like ? or videoLabel like ? limit ?,?',['%' + keyWord.toLowerCase() + '%', '%' + keyWord.toLowerCase() + '%', '%' + keyWord.toLowerCase() + '%', '%' + keyWord.toLowerCase() + '%', '%' + keyWord.toUpperCase() + '%', '%' + keyWord.toUpperCase() + '%', '%' + keyWord.toUpperCase() + '%', '%' + keyWord.toUpperCase() + '%', (page-1)*number, number], function (err, data) { 
    if (err) {
      console.log(err)
      res.json({
        "ok": false,
        "ret_msg": "服务器出错"
      })
    } else {
      res.json({
        "ok": true,
        "data": data,
        "ret_msg": "查询成功"
      })
    }
  })
})
router.get('/addViewCount', function (req, res) {
  var videoID = req.query.videoID
  connection.query('update video set viewCount = viewCount + 1 where videoID = ?', [videoID], function (err) { 
    if (err) {
      console.log(err)
      res.json({
        "ok": false,
        "ret_msg": "服务器出错"
      })
    } else {
      res.json({
        "ok": true,
        "ret_msg": "添加成功"
      })
    }
  })
})

module.exports = router