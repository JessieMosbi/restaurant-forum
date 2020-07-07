const db = require('../models')
const Category = db.Category
const Restaurant = db.Restaurant

const { Op } = require("sequelize");

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
    if (!req.body.name.trim()) {
      req.flash('error_messages', 'name didn\'t exist')
      return res.redirect('back')
    } else {
      return Category.findOne({
        where: { name: req.body.name }
      })
        .then(category => {
          if (category) {
            req.flash('error_messages', `${category.name} already exist`)
            return res.redirect('back')
          }
          return Category.create({
            name: req.body.name
          })
        })
        .then(category => {
          req.flash('success_messages', `${category.name} successfully create`)
          res.redirect('/admin/categories')
        })
        .catch(err => console.log(err))
    }
  },

  putCategory: (req, res) => {
    if (!req.body.name) {
      req.flash('error_messages', 'name didn\'t exist')
      return res.redirect('back')
    } else {
      return Category.findOne({
        where: {
          [Op.and]: [
            { name: req.body.name },
            {
              id: {
                [Op.ne]: req.params.id // 要排除自己，以防什麼都沒改就點更新
              }
            }
          ]
        }
      })
        .then(category => {
          if (category) {
            req.flash('error_messages', `${category.name} already exist`)
            return res.redirect('back')
          }
          return Category.findByPk(req.params.id)
            .then(category => {
              console.log(req.body)
              category.update(req.body)
                .then(category => {
                  req.flash('success_messages', `${category.name} successfully update`)
                  res.redirect('/admin/categories')
                })
                .catch(err => console.log(err))
            })
        })
        .catch(err => console.log(err))
    }
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
