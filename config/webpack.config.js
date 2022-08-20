const HtmlWebpackPlugin = require("html-webpack-plugin");
const { resolve } = require("path");
const { ModuleFederationPlugin } = require("webpack").container;
module.exports = {
  mode: "development",
  output: {
    path: resolve(__dirname, "dist"),
    publicPath: "http://localhost:3001/",
  },
  devServer: {
    port: 3001,
    historyApiFallback: true,
  },
  module: {
    rules: [
      {
        test: /\.m?js$/i,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-react", "@babel/preset-env"],
            plugins: ["@babel/plugin-transform-runtime"],
          },
        },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./public/index.html",
    }),
  ],
};
