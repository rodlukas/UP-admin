const HtmlWebpackHarddiskPlugin = require('html-webpack-harddisk-plugin');
const path = require('path');
const isPro = process.env.NODE_ENV === 'production';
module.exports = {
    type: 'react-app',
    webpack: {
        // dont forget delete src/index.html to use this config: mountid, title, favicon
        html: {
            mountId: 'app',
            title: 'Django react',
            // favicon: 'src/favicon.ico'
            //this setting is required for HtmlWebpackHarddiskPlugin to work
            alwaysWriteToDisk: true,
            filename: 'react.html'
        },
        publicPath: isPro ? "/static/" : "http://localhost:3000/",
        extra: {
            plugins: [
                // this will copy an `index.html` for django to use
                new HtmlWebpackHarddiskPlugin({
                    outputPath: path.resolve(__dirname + "/../", 'admin', 'templates')
                })
            ]
        },
        config: function (config) {
            if (!isPro) {
                config.entry = [
                    'webpack-dev-server/client?http://0.0.0.0:3000',
                    'webpack/hot/only-dev-server',
                    './src/index.js'
                ];
            }

            return config
        }
    },
    devServer: {
        // allow django host, in case you use custom domain for django app
        allowedHosts: ["0.0.0.0"]
    }
};
