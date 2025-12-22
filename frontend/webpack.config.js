const os = require("os")
const path = require("path")
const HtmlWebPackPlugin = require("html-webpack-plugin")
const HtmlWebpackHarddiskPlugin = require("html-webpack-harddisk-plugin")
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin")
const TerserPlugin = require("terser-webpack-plugin")
const StylelintPlugin = require("stylelint-webpack-plugin")
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin
const ESLintPlugin = require("eslint-webpack-plugin")

const port = 3000
// Ziskani sitove IP adresy (univerzalni pro Windows i macOS)
const networkIP =
    Object.values(os.networkInterfaces())
        .flat()
        .find((iface) => (iface.family === "IPv4" || iface.family === 4) && !iface.internal)
        ?.address || "localhost"
const urlLocal = `http://${networkIP}:${port}/`
const urlProduction = "/static/assets/"
const pathBuild = path.resolve(__dirname, "build", "assets")
const htmlFile = "react-autogenerate.html"
const htmlSource = path.resolve(__dirname, "src", "index.html")
const htmlTarget = path.resolve(__dirname, "..", "admin", "templates")

// pouziva se cross-env pro crossplatform nastaveni env promenne
// napr. kvuli https://github.com/gaearon/react-hot-loader#what-about-production
const isProduction = process.env.NODE_ENV === "production"

const isBundleAnalyze = process.env.BUNDLE_ANALYZE === "true"

// konfigurace je zalozena:
// - CRA: https://github.com/facebook/create-react-app/blob/v3.3.1/packages/react-scripts/config/webpack.config.js
//   - plus novejsi verze CRA (nejen webpack config, ale i dalsi)
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
                    isProduction ? MiniCssExtractPlugin.loader : "style-loader",
                    {
                        loader: "css-loader",
                        options: { importLoaders: 1, sourceMap: true },
                    },
                    {
                        loader: "postcss-loader",
                        options: {
                            postcssOptions: {
                                plugins: ["postcss-preset-env", "cssnano"],
                            },
                            sourceMap: true,
                        },
                    },
                ],
            },
        ],
    },
    plugins: [
        new ESLintPlugin({ extensions: ["js", "jsx", "ts", "tsx"] }),
        new StylelintPlugin({
            emitWarning: true,
            files: "src/*.css",
        }),
        new MiniCssExtractPlugin({
            filename: isProduction ? `[name].[contenthash:8].css` : "[name].css",
            chunkFilename: isProduction ? `[name].[contenthash:8].chunk.css` : "[name].chunk.css",
        }),
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
        clean: true,
    },
    devServer: {
        // pro povoleni pristupu odkudkoliv (a z Djanga)
        allowedHosts: ["0.0.0.0"],
        compress: true,
        client: {
            overlay: true,
        },
        devMiddleware: {
            index: htmlFile,
            stats: {
                modules: false,
            },
        },
        headers: { "Access-Control-Allow-Origin": "*" },
        historyApiFallback: true,
        host: "0.0.0.0",
        hot: true,
        port: port,
    },
    stats: { children: false, modules: false },
    devtool: isProduction ? "source-map" : "cheap-module-source-map",
    optimization: {
        minimize: isProduction,
        splitChunks: {
            chunks: "all",
        },
        runtimeChunk: {
            name: (entrypoint) => `runtime-${entrypoint.name}`,
        },
        minimizer: [new TerserPlugin(), new CssMinimizerPlugin()],
        // TODO zapnout, az bude fixnuty html-webpack-plugin, viz
        // https://github.com/jantimon/html-webpack-plugin/issues/1638
        realContentHash: false,
    },
}

if (isBundleAnalyze) {
    module.exports.plugins.push(new BundleAnalyzerPlugin())
}
