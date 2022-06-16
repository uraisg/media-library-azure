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
mix.override((config) => {
  config.module.rules.forEach((rule) => {
    // get the rule that contains babel-loader
    if (rule.use?.find((loader) => loader.loader?.includes('babel-loader'))) {
      // add @linaria/webpack5-loader to the rule
      rule.use.push({
        loader: '@linaria/webpack5-loader',
      })
    }
  })
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
  .js('assets/scripts/dashboard.js', 'scripts')
  .js('assets/scripts/ActivityReport.js', 'scripts')
  .js('assets/scripts/FileReport.js', 'scripts')
  .js('assets/scripts/Staff.js', 'scripts')
  .js('assets/scripts/StaffActivityReport.js', 'scripts')
  .sass('assets/styles/site.scss', 'styles')
mix
  .js('assets/scripts/gallery/main.js', 'scripts/gallery.js')
  .react({ extractStyles: true })
