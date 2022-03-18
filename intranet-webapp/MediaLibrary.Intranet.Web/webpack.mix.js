const mix = require('laravel-mix')
const path = require('path')

mix.setPublicPath(path.normalize('wwwroot'))
mix.webpackConfig({
  externals: {
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
  .copy(
    [
      'node_modules/bootstrap/dist/js/bootstrap.bundle.min.js',
      'node_modules/jquery/dist/jquery.min.js',
      'node_modules/jquery-validation/dist/jquery.validate.min.js',
      'node_modules/jquery-validation-unobtrusive/dist/jquery.validate.unobtrusive.min.js',
      'node_modules/leaflet/dist/leaflet.js',
    ],
    'wwwroot/scripts'
  )
  .copy('node_modules/leaflet/dist/leaflet.css', 'wwwroot/styles')
  .copy('node_modules/leaflet/dist/images', 'wwwroot/styles/images')
  .js('assets/scripts/item.js', 'scripts')
  .js('assets/scripts/edit.js', 'scripts')
  .sass('assets/styles/site.scss', 'styles')
mix.js('assets/scripts/gallery/main.js', 'scripts/gallery.js').react()
