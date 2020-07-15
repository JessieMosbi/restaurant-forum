const db = require('../models')
const Restaurant = db.Restaurant
const User = db.User
const Category = db.Category

const fs = require('fs')
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID

const adminService = {
  getRestaurants: (req, res, callback) => {
    return Restaurant.findAll({
      raw: true,
      nest: true,
      include: [Category]
    })
      .then(restaurants => {
        callback({ restaurants: restaurants })
      })
  },

  getRestaurant: (req, res, callback) => {
    return Restaurant.findByPk(
      req.params.id,
      { include: [Category] }
    )
      .then(restaurant => {
        callback({ restaurant })
      })
  },

  deleteRestaurant: (req, res, callback) => {
    return Restaurant.findByPk(req.params.id)
      .then(restaurant => {
        restaurant.destroy()
          .then(restaurant => {
            callback({ status: 'success', message: '' })
          })
      })
  },

  postRestaurant: (req, res, callback) => {
    const name = (req.body.name) ? req.body.name.trim() : req.body.name
    if (!name) {
      callback({ status: 'error', message: 'name didn\'t exist' })
    }
    const { file } = req // equal to const file = req.file
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID);
      imgur.upload(file.path, (err, img) => {
        if (err) console.log(err)
        return Restaurant.findByPk(req.params.id)
          .then((restaurant) => {
            Restaurant.create({
              name,
              tel: req.body.tel,
              address: req.body.address,
              opening_hours: req.body.opening_hours,
              description: req.body.description,
              image: file ? img.data.link : null,
              CategoryId: req.body.categoryId
            })
              .then((restaurant) => {
                callback({ status: 'success', message: 'restaurant was successfully created' })
              })
          })
      })
    } else {
      return Restaurant.create({
        name,
        tel: req.body.tel,
        address: req.body.address,
        opening_hours: req.body.opening_hours,
        description: req.body.description,
        CategoryId: req.body.categoryId
      })
        .then((restaurant) => {
          callback({ status: 'success', message: 'restaurant was successfully created' })
        })
    }
  },

  putRestaurant: (req, res, callback) => {
    const name = (req.body.name) ? req.body.name.trim() : req.body.name
    if (!name) {
      callback({ status: 'error', message: 'name didn\'t exist' })
      // req.flash('error_messages', "name didn't exist")
      // return res.redirect('back')
    }

    const { file } = req
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID);
      imgur.upload(file.path, (err, img) => {
        if (err) console.log(err)
        return Restaurant.findByPk(req.params.id)
          .then((restaurant) => {
            restaurant.update({
              name,
              tel: req.body.tel,
              address: req.body.address,
              opening_hours: req.body.opening_hours,
              description: req.body.description,
              image: file ? img.data.link : restaurant.image,
              CategoryId: req.body.categoryId
            })
              .then((restaurant) => {
                callback({ status: 'success', message: 'restaurant was successfully to update' })
                // req.flash('success_messages', 'restaurant was successfully to update')
                // res.redirect('/admin/restaurants')
              })
          })
      })
    } else {
      return Restaurant.findByPk(req.params.id)
        .then((restaurant) => {
          restaurant.update({
            name,
            tel: req.body.tel,
            address: req.body.address,
            opening_hours: req.body.opening_hours,
            description: req.body.description,
            CategoryId: req.body.categoryId
          })
            .then(restaurant => {
              callback({ status: 'success', message: 'restaurant was successfully to update' })
              // req.flash('success_messages', 'restaurant was successfully to update')
              // res.redirect('/admin/restaurants')
            })
        })
    }
  },

  getCategories: (req, res, callback) => {
    return Category.findAll({
      raw: true,
      nest: true
    })
      .then(categories => {
        callback({ categories })
      })
  },

  postCategory: (req, res, callback) => {
    const name = (req.body.name) ? req.body.name.trim() : req.body.name
    if (!name) {
      callback({ status: 'error', message: 'name didn\'t exist' })
      // req.flash('error_messages', 'name didn\'t exist')
      // return res.redirect('back')
    } else {
      return Category.findOne({
        where: { name }
      })
        .then(category => {
          if (category) {
            callback({ status: 'error', message: `${category.name} already exist` })
            // req.flash('error_messages', `${category.name} already exist`)
            // return res.redirect('back')
          }
          return Category.create({ name })
        })
        .then(category => {
          callback({ status: 'success', message: `${category.name} successfully create` })
          // req.flash('success_messages', `${category.name} successfully create`)
          // res.redirect('/admin/categories')
        })
        .catch(err => console.log(err))
    }
  },
}

module.exports = adminService
