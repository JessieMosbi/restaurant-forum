const db = require('../../models')
const Category = db.Category
const Restaurant = db.Restaurant

const { Op } = require("sequelize");

const adminService = require('../../services/adminService.js')

const categoryController = {
  getCategories: (req, res) => {
    adminService.getCategories(req, res, (data) => {
      return res.json(data)
    })
  }
}

module.exports = categoryController
