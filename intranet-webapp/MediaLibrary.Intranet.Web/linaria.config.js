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
      // Do not ignore ES-modules
      test: (filename, code) => {
        if (!/\/node_modules\//.test(filename)) {
          return false;
        }

        return /(?:^|\n|;)\s*(?:export|import)\s+/.test(code);
      },
      action: require.resolve('@linaria/shaker'),
    },
  ],
}
