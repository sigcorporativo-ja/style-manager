const path = require("path");
const webpack = require("webpack");

module.exports = (env) => {
  const entry = [];
  if (env) {
    console.log("Construyendo para configuración: ", env); // 'local'
    entry.push(path.resolve(__dirname, "../src/config/config." + env + ".js"));
  } else {
    console.log("Construyendo sin configuración de entorno");
  }

  entry.push(path.resolve(__dirname, "..", "test", "test.js"));

  return {
    mode: "development",
    entry: entry,
    resolve: {
      alias: {
        templates: path.resolve(__dirname, "../src/templates"),
        assets: path.resolve(__dirname, "../src/facade/assets"),
        impl: path.resolve(__dirname, "../src/impl/ol/js"),
        facade: path.resolve(__dirname, "../src/facade/js"),
      },
      extensions: [".wasm", ".mjs", ".js", ".json", ".css", ".hbs", ".html"],
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          loader: "eslint-loader",
          exclude: [/node_modules/, /lib/, /test/, /dist/],
        },
        {
          test: [/\.hbs$/, /\.html$/],
          loader: "html-loader",
          exclude: /node_modules/,
        },
        {
          test: /\.css$/,
          loader: "style-loader!css-loader",
          exclude: [/node_modules/],
        },
        {
          test: /\.(woff|woff2|eot|ttf|svg)$/,
          exclude: /node_modules/,
          loader: "url-loader?name=fonts/[name].[ext]",
        },
      ],
    },
    plugins: [new webpack.HotModuleReplacementPlugin()],
    devServer: {
      hot: true,
      open: true,
      port: 6124,
      openPage: "test/dev.html",
      watchOptions: {
        poll: 1000,
      },
    },
    devtool: "eval-source-map",
  };
};
