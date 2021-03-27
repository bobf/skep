const path = require('path');
const webpack = require('webpack');

module.exports = {
  mode: 'none',
  entry: './files/js/application.jsx',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
      {
        test: /\.s[ac]ss$/i,
        use: ["style-loader", "css-loader", "sass-loader"],
      },
      {
        test: /\.svg/,
        type: 'asset/inline',
      },
    ],
  },
  plugins: [
    new webpack.EnvironmentPlugin({ NODE_ENV: 'development' }),
  ],
  resolve: {
    extensions: ['*', '.js', '.jsx'],
    alias: {
      process: "process/browser"
    },
  },
};
