// params
const pageLimit = 10
let nowNavTab

const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category
const Comment = db.Comment
const User = db.User

const restController = {
  getRestaurants: (req, res) => {
    nowNavTab = 'restaurant'

    let offset, page
    const whereQuery = {}
    const categoryId = Number(req.query.categoryId) || '' // 給 sequelize 需為數字

    if (req.query.page) offset = (req.query.page - 1) * pageLimit
    if (categoryId) whereQuery.CategoryId = categoryId

    return Restaurant.findAndCountAll({
      include: Category, where: whereQuery, offset, limit: pageLimit
    })
      .then(result => {
        // data for pagination
        const page = Number(req.query.page) || 1
        const pages = Math.ceil(result.count / pageLimit)
        const totalPage = Array.from({ length: pages }).map((item, index) => index + 1)
        const prev = (page - 1 < 1) ? 1 : page - 1
        const next = (page + 1 > pages) ? pages : page + 1

        // console.log(totalPage)

        // clean up data
        const data = result.rows.map(r => ({
          ...r.dataValues,
          description: r.description.substring(0, 50),
          categoryName: r.Category.name,
          isFavorited: req.user.FavoritedRestaurants.map(d => d.id).includes(r.id),
          isLiked: req.user.LikedRestaurants.map(d => d.id).includes(r.id)
        }))

        Category.findAll({
          raw: true,
          nest: true
        })
          .then(categories => {
            return res.render('restaurants', {
              nowNavTab,
              restaurants: data,
              categories,
              categoryId,
              page,
              totalPage,
              prev,
              next
            })
          })
      })
  },

  getRestaurant: (req, res) => {
    return Restaurant.findByPk(req.params.id, {
      include: [
        Category,
        { model: Comment, include: User },
        { model: User, as: 'FavoritedUsers' },
        { model: User, as: 'LikedUsers' }
      ]
    })
      .then(restaurant => {
        // update viewCounts
        restaurant.viewCounts++
        return restaurant.save({
          fields: ['viewCounts']
        })
          .then(restaurant => {
            const isFavorited = restaurant.FavoritedUsers.map(d => d.id).includes(req.user.id)
            const isLiked = restaurant.LikedUsers.map(d => d.id).includes(req.user.id)
            return res.render('restaurant', {
              restaurant: restaurant.toJSON(),
              isFavorited: isFavorited,
              isLiked
            })
          })
      })
  },

  getFeeds: (req, res) => {
    nowNavTab = 'feeds'

    return Restaurant.findAll({
      raw: true,
      nest: true,
      order: [['createdAt', 'DESC']],
      include: Category,
      limit: 10
    })
      .then(restaurants => {
        Comment.findAll({
          raw: true,
          nest: true,
          order: [['createdAt', 'DESC']],
          include: [User, Restaurant],
          limit: 10
        })
          .then(comments => {
            return res.render('feeds', {
              nowNavTab,
              restaurants,
              comments
            })
          })
      })
  },

  getRestaurantDashboard: (req, res) => {
    return Restaurant.findByPk(req.params.id, {
      include: [
        Category,
        Comment,
        { model: User, as: 'FavoritedUsers' }
      ]
    })
      .then(restaurant => {
        return res.render('dashboard', {
          restaurant: restaurant.toJSON(),
          commentCount: restaurant.Comments.length,
          FavoritedCount: restaurant.FavoritedUsers.length
        })
      })
  },

  getTopRestaurant: (req, res) => {
    nowNavTab = 'resTop'

    return Restaurant.findAll({
      include: [
        { model: User, as: 'FavoritedUsers' },
        { model: User, as: 'LikedUsers' }
      ]
    })
      .then(restaurants => {
        restaurants = restaurants.map(r => ({
          ...r.dataValues,
          description: r.description.substring(0, 150),
          FavoritedCount: r.FavoritedUsers.length,
          isFavorited: r.FavoritedUsers.map(d => d.id).includes(req.user.id),
          isLiked: r.LikedUsers.map(d => d.id).includes(req.user.id)
        }))
        // 收藏數最多的 10 筆
        restaurants = restaurants.sort((a, b) => b.FavoritedCount - a.FavoritedCount)
        restaurants = restaurants.filter((r, index) => index <= 9)
        return res.render('topRestaurant', {
          restaurants,
          nowNavTab
        })
      })
  }
}
module.exports = restController
