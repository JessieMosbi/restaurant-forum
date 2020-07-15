const db = require('../models')
const Category = db.Category
const Restaurant = db.Restaurant

const { Op } = require("sequelize")
const adminService = require('../services/adminService.js')

const categoryController = {
  getCategories: (req, res) => {
    return Category.findAll({
      raw: true,
      nest: true
    })
      .then(categories => {
        if (req.params.id) {
          Category.findByPk(req.params.id)
            .then(category => {
              return res.render('admin/categories', {
                categories,
                category: category.toJSON()
              })
            })
        } else {
          return res.render('admin/categories', { categories })
        }
      })
  },

  postCategory: (req, res) => {
    adminService.postCategory(req, res, (data) => {
      if (data.status === 'error') {
        req.flash('error_messages', data.message)
        return res.redirect('back')
      }
      req.flash('success_messages', data.message)
      return res.redirect('/admin/categories')
    })
  },

  putCategory: (req, res) => {
    adminService.putCategory(req, res, (data) => {
      if (data.status === 'error') {
        req.flash('error_messages', data.message)
        return res.redirect('back')
      }
      req.flash('success_messages', data.message)
      return res.redirect('/admin/categories')
    })
  },

  deleteCategory: async (req, res) => {
    // 查看分類底下是否有餐廳
    const amount = await Restaurant.count({
      where: { CategoryId: req.params.id }
    })

    return Category.findByPk(req.params.id)
      .then(category => {
        if (amount) {
          req.flash('error_messages', `${category.name} do have some restaurant, can't be delete`)
          return res.redirect('/admin/categories')
        }
        category.destroy()
          .then(category => {
            req.flash('success_messages', `${category.name} successfully delete`)
            res.redirect('/admin/categories')
          })
          .catch(err => console.log(err))
      })
      .catch(err => console.log(err))
  }
}
module.exports = categoryController
