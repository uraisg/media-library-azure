const mix = require('laravel-mix')
const path = require('path')

mix.setPublicPath(path.normalize('wwwroot'))
mix.webpackConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'assets/scripts/UploadPortal'),
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
    ],
    'wwwroot/scripts'
  )
  .sass('assets/styles/site.scss', 'styles')
mix.
  js('assets/scripts/UploadPortal/main.js', 'scripts/upload_portal.js')
  .react({ extractStyles: true })
