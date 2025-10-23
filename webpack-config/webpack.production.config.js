const path = require('path');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const GenerateVersionPlugin = require('./GenerateVersionPlugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopywebpackPlugin = require('copy-webpack-plugin');

const PJSON_PATH = path.resolve(__dirname, '..', 'package.json');
const pjson = require(PJSON_PATH);

module.exports = (env) => {
  const entry = [];
  if(env)
  {
    console.log('Compilando para configuración: ', env);
    entry.push(path.resolve(__dirname, '../src/config/config.' + env + '.js'));
  } else {
    console.log('Compilando sin configuración de entorno');
  }

  entry.push(path.resolve(__dirname, '..', 'src', 'index.js'));

  return {
  mode: 'production',
  entry: {
    'stylemanager.ol.min': entry,
  },
  output: {
    path: path.resolve(__dirname, '..', 'dist'),
    filename: '[name].js',
  },
  resolve: {
    alias: {
      templates: path.resolve(__dirname, '../src/templates'),
      assets: path.resolve(__dirname, '../src/facade/assets'),
      impl: path.resolve(__dirname, '../src/impl/ol/js'),
      facade: path.resolve(__dirname, '../src/facade/js'),
    },
    extensions: ['.wasm', '.mjs', '.js', '.json', '.css', '.hbs', '.html'],
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'eslint-loader',
        exclude: /node_modules/,
      },
      {
        test: [/\.hbs$/, /\.html$/],
        loader: 'html-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        loader: MiniCssExtractPlugin.loader,
        exclude: /node_modules/,
      }, {
        test: /\.css$/,
        loader: 'css-loader',
        exclude: /node_modules/,

      },
      {
        test: /\.(woff|woff2|eot|ttf|svg)$/,
        exclude: /node_modules/,
        loader: 'url-loader?name=fonts/[name].[ext]',
      }
    ],
  },
  optimization: {
    noEmitOnErrors: true,
    minimizer: [
      new OptimizeCssAssetsPlugin(),
      new TerserPlugin({
        sourceMap: true,
      }),
    ],
  },
  plugins: [
    // new GenerateVersionPlugin({
    //   version: pjson.version,
    //   regex: /([A-Za-z]+)(\..*)/,
    // }),
    new MiniCssExtractPlugin({
      filename: '[name].css',
    }),
    new CopywebpackPlugin([{
      from: 'src/api.json',
      to: 'api.json',
    }]),
  ],
  devtool: 'source-map',
}
};
