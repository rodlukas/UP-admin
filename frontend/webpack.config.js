const os = require("os")
const path = require("path")
const { CleanWebpackPlugin } = require("clean-webpack-plugin")
const HtmlWebPackPlugin = require("html-webpack-plugin")
const HtmlWebpackHarddiskPlugin = require("html-webpack-harddisk-plugin")
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin")
const TerserPlugin = require("terser-webpack-plugin")

// bez .local by nefungovalo na iOS
const hostName = os.hostname().toLowerCase() + ".local"
const port = 3000
const url = `http://${hostName}:${port}/`
const urlProduction = "/static/assets/"
const htmlFile = "react-autogenerate.html"
const htmlSource = "src/index.html"
const htmlTarget = path.resolve(__dirname + "/../", "admin", "templates")

module.exports = (env, argv) => {
    const isProduction = argv.mode === "production"

    return {
        resolve: {
            alias: {
                // react-hot-loader
                "react-dom": "@hot-loader/react-dom"
            }
        },
        entry: ["react-hot-loader/patch", "./src/index"],
        module: {
            rules: [
                {
                    test: /\.js$/,
                    enforce: "pre",
                    exclude: /node_modules/,
                    loader: "eslint-loader",
                    options: {
                        cache: true
                    }
                },
                {
                    test: /\.m?js$/,
                    exclude: /(node_modules|bower_components)/,
                    loader: "babel-loader",
                    options: {
                        cacheDirectory: true,
                        cacheCompression: false,
                        compact: isProduction,
                        sourceMaps: true,
                        inputSourceMap: true
                    }
                },
                {
                    test: /\.html$/i,
                    loader: "html-loader"
                },
                {
                    test: /\.css$/i,
                    use: [
                        isProduction
                            ? {
                                  loader: MiniCssExtractPlugin.loader,
                                  options: {
                                      hmr: !isProduction,
                                      sourceMap: true
                                  }
                              }
                            : "style-loader",
                        {
                            loader: "css-loader",
                            options: { importLoaders: 1, sourceMap: true }
                        },
                        {
                            loader: "postcss-loader",
                            options: {
                                sourceMap: true,
                                ident: "postcss",
                                plugins: [require("postcss-preset-env")(), require("cssnano")()]
                            }
                        }
                    ]
                }
            ]
        },
        plugins: [
            new MiniCssExtractPlugin({
                filename: isProduction ? `[name].[contenthash:8].css` : "[name].css",
                chunkFilename: isProduction
                    ? `[name].[contenthash:8].chunk.css`
                    : "[name].chunk.css"
            }),
            new CleanWebpackPlugin(),
            new HtmlWebPackPlugin({
                // diky teto moznosti muze pak pracovat HtmlWebpackHarddiskPlugin
                alwaysWriteToDisk: true,
                template: htmlSource,
                filename: htmlFile,
                minify: isProduction
                    ? {
                          collapseWhitespace: true,
                          removeComments: true,
                          removeRedundantAttributes: true,
                          removeScriptTypeAttributes: true,
                          removeStyleLinkTypeAttributes: true,
                          useShortDoctype: true,
                          // ignoruj Django sablonovaci jazyk
                          ignoreCustomFragments: [/{%[\s\S]*?%}/]
                      }
                    : false
            }),
            // automaticke generovani html souboru do templates slozky s injected odkazy na zdrojove soubory
            new HtmlWebpackHarddiskPlugin({
                outputPath: htmlTarget
            })
        ],

        output: {
            chunkFilename: isProduction ? "[name].[contenthash:8].chunk.js" : "[name].chunk.js",
            filename: isProduction ? "[name].[contenthash:8].js" : "[name].js",
            path: path.resolve(__dirname, "build/assets"),
            publicPath: isProduction ? urlProduction : url
        },
        devServer: {
            // pro povoleni pristupu odkudkoliv (a z Djanga)
            allowedHosts: ["0.0.0.0", hostName],
            compress: true,
            headers: { "Access-Control-Allow-Origin": "*" },
            historyApiFallback: true,
            host: "0.0.0.0",
            hot: true,
            index: htmlFile,
            overlay: true,
            port: port
        },
        devtool: isProduction ? "source-map" : "cheap-module-source-map",
        optimization: {
            minimize: isProduction,
            splitChunks: {
                chunks: "all",
                name: !isProduction
            },
            runtimeChunk: {
                name: entrypoint => `runtime-${entrypoint.name}`
            },
            minimizer: [
                new TerserPlugin({
                    sourceMap: true
                }),
                new OptimizeCSSAssetsPlugin({
                    cssProcessorOptions: {
                        map: {
                            inline: false,
                            annotation: true
                        }
                    },
                    cssProcessorPluginOptions: {
                        preset: ["default", { minifyFontValues: { removeQuotes: false } }]
                    }
                })
            ]
        }
    }
}
