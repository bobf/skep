const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: './files/js/application.jsx',
  output: {
    path: path.resolve(__dirname, 'files'),
    filename: 'bundle.js'
  },
  plugins: [
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.jQuery': 'jquery',
      Popper: ['popper.js', 'default'],
      React: 'react',
      ReactDOM: 'react-dom',
      moment: 'moment',
      numeral: 'numeral'
    }),
    new webpack.DefinePlugin({
      "process.env": {
         NODE_ENV: JSON.stringify(process.env.NODE_ENV)
      }
    })
  ],
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        resolve: {
          extensions: ['.js', '.jsx'],
        },
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          query: {
            presets: ["@babel/env", "@babel/react"]
          }
        }
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  node: {
     fs: "empty"
  }
};


