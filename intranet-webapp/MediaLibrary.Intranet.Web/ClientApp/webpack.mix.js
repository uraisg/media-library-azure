const mix = require('laravel-mix')
const path = require('path')

mix.setPublicPath(path.normalize('../wwwroot/js'))
mix.webpackConfig({
  externals: {
    jquery: 'jQuery',
    leaflet: 'L',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
})
mix.babelConfig({
  plugins: ['transform-class-properties'],
})
mix.js('src/main.js', '../wwwroot/js/main.min.js').react()
