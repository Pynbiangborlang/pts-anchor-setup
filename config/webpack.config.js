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
    hot: true,
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: ["babel-loader"],
      },
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
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(png|jpg|gif)$/i,
        type: "asset/resource",
      },
      {
        test: /\.svg$/i,
        type: "asset",
        resourceQuery: /url/, // *.svg?url
      },
      {
        test: /\.svg$/i,
        issuer: /\.[jt]sx?$/,
        resourceQuery: { not: [/url/] }, // exclude react component if *.svg?url
        use: ["@svgr/webpack"],
      },
    ],
  },
  plugins: [
    new ModuleFederationPlugin({
      name: "ptsAnchorSetup",
      filename: "remoteEntry.js",
      exposes: {
        "./PTSAnchorSetup": "./src/bootstrap",
      },
    }),
    new HtmlWebpackPlugin({
      template: "./public/index.html",
    }),
  ],
};
