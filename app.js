// params
if (process.env.NODE_ENV !== 'production') require('dotenv').config()
const PORT = process.env.PORT || 3000

// modules and files
const express = require('express')
const handlebars = require('express-handlebars')

// web server settings
const app = express()
app.engine('.hbs', handlebars({ defaultLayout: 'main', extname: '.hbs' }))
app.set('view engine', '.hbs')

// database settings
const db = require('./models/index.js')

// routes
require('./routes/index.js')(app)

// start web server
app.listen(PORT, () => {
  console.log(`web server start at port ${PORT}`)
})
