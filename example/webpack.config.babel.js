const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ESBuildMinifierWebpackPlugin = require('../dist');

const isProd = process.env.NODE_ENV == 'production';

module.exports = {
  mode: process.env.NODE_ENV,
  entry: {
    app: [path.resolve(__dirname, './app.js')],
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    publicPath: isProd ? '/' : '/dist/',
    filename: `static/js/[name].js`,
    chunkFilename: `static/js/[name].chunk.js`
  },
  resolve: {
    alias: {
      'react/lib/Object.assign': 'object-assign',
    },
    extensions: ['.web.js', '.ts', '.tsx', '.js', '.jsx', '.css', '.scss', '.less']
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              plugins: ['@babel/external-helpers'],
              cacheDirectory: true,
            },
          },
        ],
        exclude: /node_modules/,
      },
    ]
  },
  optimization: {
    splitChunks: {
      chunks: "all",
      cacheGroups: {
        vendors: {
          name: 'vendors',
          test: /[\\/]node_modules[\\/]/,
          priority: 2,
          minChunks: 2,
        },
        default: {
          name: 'common',
          priority: -20,
          minChunks: 2,
          reuseExistingChunk: true
        }
      }
    },
    minimizer: [new ESBuildMinifierWebpackPlugin({})],
  }
}


module.exports.plugins = [
  new HtmlWebpackPlugin({
    filename: 'index.html',
    template: path.resolve(__dirname, './index.template.html'),
    inject: true,
    chunks: ['app'],
    path: isProd ? '/static/js' : '../src/vendor',
  }),
  new webpack.DefinePlugin({
    __ENV: isProd ? "'pro'" : "'dev'",
    'process.env': {
      'NODE_ENV': JSON.stringify(isProd ? 'production' : 'development')
    }
  }),
];

if (!isProd) {
  module.exports.devtool = 'source-map'
}
