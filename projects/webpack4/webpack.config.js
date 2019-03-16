const FlowWebpackPlugin = require('../../dist/index');

module.exports = {
  mode: 'development',
  entry: './main.js',
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader'
      }
    ]
  },
  plugins: [
    new FlowWebpackPlugin({
      failOnError: false,
      failOnErrorWatch: false,
      reportingSeverity: 'warning',
      flowPath: require.main.require('flow-bin'),
      flowArgs: ['--color=always'],
    }),
  ]
};