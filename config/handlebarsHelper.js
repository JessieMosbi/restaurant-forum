const moment = require('moment')

module.exports = {
  ifEqual: function (value1, value2) {
    return String(value1) === String(value2)
  },

  ifNotEqual: function (value1, value2) {
    return String(value1) !== String(value2)
  },

  ifCond: function (a, b, options) {
    if (a === b) {
      return options.fn(this)
    }
    return options.inverse(this)
  },

  moment: function (a) {
    return moment(a).fromNow()
  }
}
