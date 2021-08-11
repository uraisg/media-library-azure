const mix = require('laravel-mix')
const path = require('path')

mix.setPublicPath(path.normalize('wwwroot'))
mix.webpackConfig({
  externals: {
    jquery: 'jQuery',
    leaflet: 'L',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'assets/scripts/gallery'),
    },
  },
})
mix.sourceMaps(false) // enable source maps in dev mode, but not prod

mix
  .js('assets/scripts/site.js', 'scripts')
  .js('assets/scripts/item.js', 'scripts')
  .js('assets/scripts/search.js', 'scripts')
  .js('assets/scripts/map.js', 'scripts')
  .sass('assets/styles/site.scss', 'styles')
mix.js('assets/scripts/gallery/main.js', 'scripts/gallery.js').react()
