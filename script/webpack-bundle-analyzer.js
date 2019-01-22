/*
 * hack to run the analyzer as a webpack plugin taken from:
 * https://github.com/facebook/create-react-app/issues/3518
 */

process.env.NODE_ENV = "production"
var BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
  .BundleAnalyzerPlugin

const webpackConfigProd = require("react-scripts/config/webpack.config.prod")

webpackConfigProd.plugins.push(
  new BundleAnalyzerPlugin({
    analyzerMode: "static",
    reportFilename: "report.html",
  })
)

require("react-scripts/scripts/build")
