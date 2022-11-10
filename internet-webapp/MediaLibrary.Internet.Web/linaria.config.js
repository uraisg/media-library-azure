module.exports = {
  rules: [
    {
      action: require('@linaria/shaker').default,
    },
    {
      test: /\/node_modules\//,
      action: 'ignore',
    },
    {
      test: /\/node_modules\/react-bootstrap\/esm\//,
      action: require('@linaria/shaker').default,
    },
  ],
}
