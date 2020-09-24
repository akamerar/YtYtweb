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

//修改密码 不需要登录
router.get('/setNewPassword', function (req, res) {
  var password = req.query.password,
      salt = req.query.salt,
      phone = req.query.phone
  connection.query('update user set password = ?, salt = ? where phone = ?', [password, salt, phone], function (err, data) { 
    if (err) {
      console.log(err)
      res.status(200).json({
        ok: false,
        ret_msg: '修改失败，请重试'
      })
    } else {
      res.status(200).json({
        ok: true,
        ret_msg: '修改成功'
      })
    }
  })
})

module.exports = router