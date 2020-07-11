// params
let nowNavTab

const bcrypt = require('bcryptjs')
const db = require('../models/index.js')
const User = db.User
const Restaurant = db.Restaurant
const Comment = db.Comment
const Favorite = db.Favorite
const Like = db.Like

const fs = require('fs')
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID

const userController = {
  signUpPage: (req, res) => {
    return res.render('signup')
  },

  signUp: (req, res) => {
    // confirm password
    if (req.body.passwordCheck !== req.body.password) {
      req.flash('error_messages', '兩次密碼輸入不同！')
      return res.redirect('/signup')
    }
    // confirm unique user email
    User.findOne({ where: { email: req.body.email } })
      .then(user => {
        if (user) {
          req.flash('error_messages', '信箱重複！')
          return res.redirect('/signup')
        }
        return User.create({
          name: req.body.name,
          email: req.body.email,
          password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10), null)
        })
      })
      .then(user => {
        req.flash('success_messages', '成功註冊帳號！')
        return res.redirect('/signin')
      })
  },

  signInPage: (req, res) => {
    return res.render('signin')
  },

  signIn: (req, res) => {
    req.flash('success_messages', '成功登入！')
    res.redirect('/restaurants')
  },

  logout: (req, res) => {
    req.flash('success_messages', '登出成功！')
    req.logout()
    res.redirect('/signin')
  },

  getUser: (req, res) => {
    User.findByPk(req.params.id, {
      include: [
        { model: Comment, include: Restaurant }
      ]
    })
      .then(user => {
        // console.log(user.toJSON())
        // console.log(user.toJSON().Comments[0].Restaurant)
        const commentCount = user.toJSON().Comments.length // TODO: 暫時有幾個評論就顯示幾個，不管評論的餐廳是否重複，因還沒找到 DISTINCT 怎麼用
        return res.render('profile', { profileUser: user.toJSON(), commentCount })
      })
      .catch(err => console.log(err))
  },

  editUser: (req, res) => {
    User.findByPk(req.params.id)
      .then(user => {
        return res.render('profileEdit', { profileUser: user.toJSON() })
      })
      .catch(err => console.log(err))
  },

  putUser: (req, res) => {
    if (!req.body.name.trim()) {
      req.flash('error_messages', 'name must exist')
      return res.redirect('back')
    }

    const { file } = req
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID);
      imgur.upload(file.path, (err, img) => {
        if (err) console.log(err)
        return User.findByPk(req.user.id)
          .then(user => {
            user.update({
              name: req.body.name,
              image: file ? img.data.link : user.image
            })
              .then(user => {
                req.flash('success_messages', 'user profile was successfully to update')
                res.redirect(`/users/${req.user.id}`)
              })
          })
      })
    } else {
      return User.findByPk(req.params.id)
        .then(user => {
          user.update({
            name: req.body.name
          })
            .then(user => {
              req.flash('success_messages', 'user profile was successfully to update')
              res.redirect(`/users/${req.user.id}`)
            })
        })
    }
  },

  editUserPassword: (req, res) => {
    // lock authorization for test accounts
    let isEditable = 1
    if (req.user.email === 'root@example.com' || req.user.email === 'user1@example.com' || req.user.email === 'user2@example.com') isEditable = ''

    return res.render('password', { isEditable })
  },

  putUserPassword: (req, res) => {
    if (!req.body.oldPassword.trim() || !req.body.newPassword.trim() || !req.body.newPasswordCheck.trim()) {
      req.flash('error_messages', 'each column must be insert')
      return res.redirect('back')
    }

    // confirm password
    if (req.body.newPassword !== req.body.newPasswordCheck) {
      req.flash('error_messages', 'Tow New Password is not the same！')
      return res.redirect('back')
    }

    // check old password then update to new one
    return User.findByPk(req.user.id)
      .then(user => {
        if (!bcrypt.compareSync(req.body.oldPassword, user.password)) {
          req.flash('error_messages', 'Old Password is not correct！')
          return res.redirect('back')
        }

        return user.update({
          password: bcrypt.hashSync(req.body.newPassword, bcrypt.genSaltSync(10), null)
        })
      })
      .then(user => {
        req.flash('success_messages', 'user password was successfully to update')
        res.redirect('/password')
      })
      .catch(err => console.log(err))
  },

  addFavorite: (req, res) => {
    return Favorite.create({
      UserId: req.user.id,
      RestaurantId: req.params.restaurantId
    })
      .then(favorite => {
        return res.redirect('back')
      })
  },

  removeFavorite: (req, res) => {
    return Favorite.findOne({
      where: {
        UserId: req.user.id,
        RestaurantId: req.params.restaurantId
      }
    })
      .then(favorite => {
        favorite.destroy()
          .then(restaurant => {
            return res.redirect('back')
          })
      })
  },

  addLike: (req, res) => {
    return Like.create({
      UserId: req.user.id,
      RestaurantId: req.params.restaurantId
    })
      .then(like => {
        return res.redirect('back')
      })
  },

  removeLike: (req, res) => {
    return Like.findOne({
      where: {
        UserId: req.user.id,
        RestaurantId: req.params.restaurantId
      }
    })
      .then(like => {
        like.destroy()
          .then(restaurant => {
            return res.redirect('back')
          })
      })
  },

  getTopUser: (req, res) => {
    nowNavTab = 'userTop'

    return User.findAll({
      include: [
        { model: User, as: 'Followers' }
      ]
    }).then(users => {
      users = users.map(user => ({
        ...user.dataValues,
        FollowerCount: user.Followers.length,
        isFollowed: req.user.Followings.map(d => d.id).includes(user.id)
      }))
      // 依追蹤者人數排序清單
      users = users.sort((a, b) => b.FollowerCount - a.FollowerCount)
      return res.render('topUser', {
        users: users,
        nowNavTab
      })
    })
  }
}

module.exports = userController
