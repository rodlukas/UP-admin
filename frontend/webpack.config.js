const os = require("os")
const path = require("path")
const { CleanWebpackPlugin } = require("clean-webpack-plugin")
const HtmlWebPackPlugin = require("html-webpack-plugin")
const HtmlWebpackHarddiskPlugin = require("html-webpack-harddisk-plugin")
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin")
const TerserPlugin = require("terser-webpack-plugin")
const StylelintPlugin = require("stylelint-webpack-plugin")

// bez .local by nefungovalo na iOS
const hostName = `${os.hostname().toLowerCase()}.local`
const port = 3000
const urlLocal = `http://${hostName}:${port}/`
const urlProduction = "/static/assets/"
const pathBuild = path.resolve(__dirname, "build", "assets")
const htmlFile = "react-autogenerate.html"
const htmlSource = path.resolve(__dirname, "src", "index.html")
const htmlTarget = path.resolve(__dirname, "..", "admin", "templates")

// pouziva se cross-env pro crossplatform nastaveni env promenne
// napr. kvuli https://github.com/gaearon/react-hot-loader#what-about-production
const isProduction = process.env.NODE_ENV === "production"

// konfigurace je zalozena:
// - CRA: https://github.com/facebook/create-react-app/blob/v3.3.1/packages/react-scripts/config/webpack.config.js
// - castecne se take inspiruje u https://github.com/neutrinojs/neutrino a
//   https://github.com/insin/nwb/
// - stavi na puvodni pouzivane konfiguraci https://github.com/rodlukas/UP-admin/blob/0.18.1/frontend/nwb.config.js
module.exports = {
    mode: process.env.NODE_ENV,
    resolve: {
        alias: {
            // react-hot-loader
            "react-dom": "@hot-loader/react-dom",
        },
        extensions: [".ts", ".tsx", ".js", ".jsx"],
    },
    entry: ["react-hot-loader/patch", "./src/index"],
    module: {
        rules: [
            {
                test: /\.(ts|js)x?$/,
                enforce: "pre",
                exclude: /node_modules/,
                loader: "eslint-loader",
                options: {
                    // vsechny errors/warnings od eslint interpretuj jako warning
                    emitWarning: true,
                    // !! pri upravach eslint konfigurace deaktivovat, viz https://github.com/webpack-contrib/eslint-loader/issues/214
                    cache: true,
                },
            },
            {
                test: /\.(ts|js)x?$/,
                exclude: /node_modules/,
                loader: "babel-loader",
                options: {
                    cacheDirectory: true,
                    cacheCompression: false,
                    compact: isProduction,
                    sourceMaps: true,
                    inputSourceMap: true,
                },
            },
            {
                test: /\.css$/i,
                use: [
                    isProduction
                        ? {
                              loader: MiniCssExtractPlugin.loader,
                              options: {
                                  hmr: !isProduction,
                                  sourceMap: true,
                              },
                          }
                        : "style-loader",
                    {
                        loader: "css-loader",
                        options: { importLoaders: 1, sourceMap: true },
                    },
                    {
                        loader: "postcss-loader",
                        options: {
                            sourceMap: true,
                            ident: "postcss",
                            plugins: [require("postcss-preset-env")(), require("cssnano")()],
                        },
                    },
                ],
            },
        ],
    },
    plugins: [
        new StylelintPlugin({
            emitWarning: true,
            files: "src/*.css",
        }),
        new MiniCssExtractPlugin({
            filename: isProduction ? `[name].[contenthash:8].css` : "[name].css",
            chunkFilename: isProduction ? `[name].[contenthash:8].chunk.css` : "[name].chunk.css",
        }),
        new CleanWebpackPlugin(),
        new HtmlWebPackPlugin({
            // diky teto moznosti muze pak pracovat HtmlWebpackHarddiskPlugin
            alwaysWriteToDisk: true,
            scriptLoading: "defer",
            inject: "head",
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
                      ignoreCustomFragments: [/{%[\s\S]*?%}/],
                  }
                : false,
        }),
        // automaticke generovani html souboru do templates slozky s injected odkazy na zdrojove soubory
        new HtmlWebpackHarddiskPlugin({
            outputPath: htmlTarget,
        }),
    ],

    output: {
        // nazvy souboru odpovidaji https://create-react-app.dev/docs/production-build/
        chunkFilename: isProduction ? "[name].[contenthash:8].chunk.js" : "[name].chunk.js",
        filename: isProduction ? "[name].[contenthash:8].js" : "[name].js",
        path: pathBuild,
        publicPath: isProduction ? urlProduction : urlLocal,
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
        port: port,
        stats: {
            modules: false,
        },
    },
    stats: { children: false, modules: false },
    devtool: isProduction ? "source-map" : "cheap-module-source-map",
    optimization: {
        minimize: isProduction,
        splitChunks: {
            chunks: "all",
            name: !isProduction,
        },
        runtimeChunk: {
            name: (entrypoint) => `runtime-${entrypoint.name}`,
        },
        minimizer: [
            new TerserPlugin({
                sourceMap: true,
            }),
            new OptimizeCSSAssetsPlugin({
                cssProcessorOptions: {
                    map: {
                        inline: false,
                        annotation: true,
                    },
                },
                cssProcessorPluginOptions: {
                    preset: ["default", { minifyFontValues: { removeQuotes: false } }],
                },
            }),
        ],
    },
}
