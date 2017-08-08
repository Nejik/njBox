module.exports = {
  plugins: [
    require('postcss-nested'),
    require('postcss-cssnext')({
      features: {
        nesting: false
      }
    })
  ]
};