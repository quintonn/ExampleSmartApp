const glob = require('glob');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WebpackBuildNotifierPlugin = require('webpack-build-notifier');
const PostCompile = require('post-compile-webpack-plugin');
const ncp = require('ncp').ncp;

module.exports = {
  mode: 'development',
  context: __dirname,
  entry: {
    TwatTest: glob.sync('./src/scripts/**/*.ts*'),
  },
  output: {
    path: __dirname + '/www',
    filename: 'bundle.js',
  },
  plugins: [
    new PostCompile(() => {
      ncp(__dirname + '/www', __dirname + '/webApp', function (err) {
        if (err) {
          return console.error(err);
        }
      });
    }),
    new WebpackBuildNotifierPlugin({
      title: 'Webpack - TwatTest',
      alwaysNotify: true,
      //logo: path.resolve("./img/favicon.png"),
      suppressSuccess: false,
      sound: false,
      wait: true,
    }),
    new HtmlWebpackPlugin({
      hash: true,
      title: 'Lyniate QMS',
      myPageHeader: 'Lynaite QMS',
      template: './src/scripts/index.html',
      filename: '../www/index.html', //relative to root of the application
    }),
  ],
  optimization: {
    minimize: true,
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
      },
      {
        test: /\.html$/,
        use: 'html-loader',
      },
      {
        test: /\.svg$/,
        use: 'raw-loader',
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|jpe?g|gif)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: './images/[name].[ext]',
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: [
      //'',
      '.webpack.js',
      '.web.js',
      '.ts',
      '.tsx',
      '.js',
    ],
  },
  devtool: 'source-map',
};
