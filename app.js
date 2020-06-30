// params
if (process.env.NODE_ENV !== 'production') require('dotenv').config()
const PORT = process.env.PORT || 3000

// modules and files
const express = require('express')
const handlebars = require('express-handlebars')
const bodyParser = require('body-parser')
const flash = require('connect-flash')
const session = require('express-session')
const passport = require('./config/passport.js')

// web server settings
const app = express()
app.engine('.hbs', handlebars({ defaultLayout: 'main', extname: '.hbs' }))
app.set('view engine', '.hbs')

// other middleware settings, request will go through this part
app.use(bodyParser.urlencoded({ extended: true }))
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 60000 }
}))
app.use(flash())
app.use(passport.initialize())
app.use(passport.session())

// save local variables via Express for template to use
app.use((req, res, next) => {
  res.locals.success_messages = req.flash('success_messages')
  res.locals.error_messages = req.flash('error_messages')
  next()
})

// database settings
const db = require('./models/index.js')

// routes
require('./routes/index.js')(app, passport)

// start web server
app.listen(PORT, () => {
  console.log(`web server start at port ${PORT}`)
})
