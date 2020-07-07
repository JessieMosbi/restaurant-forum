const db = require('../models')
const Category = db.Category

const categoryController = {
  getCategories: (req, res) => {
    return Category.findAll({
      raw: true,
      nest: true
    })
      .then(categories => {
        return res.render('admin/categories', { categories })
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
  }
}
module.exports = categoryController
