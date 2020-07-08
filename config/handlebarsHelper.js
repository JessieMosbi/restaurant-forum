module.exports = {
  ifEqual: function (value1, value2) {
    return String(value1) === String(value2)
  },

  ifCond: function (a, b, options) {
    if (a === b) {
      return options.fn(this)
    }
    return options.inverse(this)
  }
}
