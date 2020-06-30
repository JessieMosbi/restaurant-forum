const passport = require('passport')
const LocalStrategy = require('passport-local')
const bcrypt = require('bcryptjs')
const db = require('../models/index.js')
const User = db.User

// setup passport strategy
passport.use(new LocalStrategy(
  // customize user field
  {
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  },
  // authenticate user
  (req, username, password, cb) => {
    User.findOne({ where: { email: username } })
      .then(user => {
        if (!user) return cb(null, false, req.flash('error_messages', '帳號或密碼輸入錯誤'))
        if (!bcrypt.compareSync(password, user.password)) return cb(null, false, req.flash('error_messages', '帳號或密碼輸入錯誤！'))
        // TODO: 為何這裡的 user 不用 user.toJSON()? 是因為下面 return 會把 user 塞入 req.user，但最下面 deserializeUser 是要給 template 用的? >> 看一下 passport 工作坊 or try 一下
        return cb(null, user)
      })
      .catch(err => cb(err, false))
  }
))

// serialize and deserialize user
passport.serializeUser((user, cb) => {
  cb(null, user.id)
})
passport.deserializeUser((id, cb) => {
  User.findByPk(id)
    .then(user => {
      user = user.toJSON()
      return cb(null, user)
    })
    .catch(err => cb(err, false))
})

module.exports = passport
