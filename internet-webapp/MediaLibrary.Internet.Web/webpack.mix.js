const mix = require('laravel-mix')
const path = require('path')

mix.setPublicPath(path.normalize('wwwroot'))
mix.webpackConfig({
  externals: {
    jquery: 'jQuery',
  },
})
mix.sourceMaps(false) // enable source maps in dev mode, but not prod

mix
  .js('assets/scripts/site.js', 'scripts')
  .sass('assets/styles/site.scss', 'styles')
