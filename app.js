if (process.env.NODE_ENV !== 'production') require('dotenv').config()
const PORT = process.env.PORT || 3000

const express = require('express')
const handlebars = require('express-handlebars')

const app = express()
app.engine('handlebars', handlebars({ defaultLayout: 'main', extname: '.hbs' }))
app.set('view engine', 'handlebars')

app.listen(PORT, () => {
  console.log(`web server start at port ${PORT}`)
})
