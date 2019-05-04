const HtmlWebpackHarddiskPlugin = require('html-webpack-harddisk-plugin')
const path = require('path')
const isProduction = process.env.NODE_ENV === 'production'
const chalk = require('chalk')

// je potreba dynamicky menit adresu vzhledem k aktualni pridelene adrese zarizeni
function getIPAddress() {
    let interfaces = require('os').networkInterfaces()
    for (let devName in interfaces) {
        if (devName !== 'Wi-Fi' && devName !== 'Ethernet')
            continue
        let iface = interfaces[devName]
        for (let i = 0; i < iface.length; i++) {
            let alias = iface[i]
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal)
                return alias.address
        }
    }
    return "localhost"
}

const url = 'http://' + getIPAddress() + ':3000/'
console.log(chalk.magenta.bold('Aplikace je přístupná v celé síti na adrese: ' + url))

module.exports = function ({command}) {
    let config = {
        type: 'react-app'
    }
    // react-hot-loader
    // * Only include react-hot-loader config when serving a development build
    if (command.startsWith('serve')) {
        config.babel = {plugins: 'react-hot-loader/babel'}
        config.webpack = {
            config(webpackConfig) {
                // React Hot Loader's patch module needs to run before your app
                webpackConfig.entry.unshift('react-hot-loader/patch')
                return webpackConfig
            }
        }
    }
    config.webpack = {
        // react-hot-loader
        aliases: {
            'react-dom': '@hot-loader/react-dom'
        },
        // automaticke generovani html souboru do templates slozky s prislusnymi odkazy na zdrojove soubory
        html: {
            //this setting is required for HtmlWebpackHarddiskPlugin to work
            alwaysWriteToDisk: true,
            filename: 'react-autogenerate.html'
        },
        publicPath: isProduction ? "/static/" : url,
        extra: {
            plugins: [
                // this will copy an `index.html` for django to use
                new HtmlWebpackHarddiskPlugin({
                    outputPath: path.resolve(__dirname + "/../", 'admin', 'templates')
                })
            ]
        },
        config: function (webpackConfig) {
            if (!isProduction) {
                webpackConfig.entry = [
                    'webpack-dev-server/client?http://0.0.0.0:3000',
                    'webpack/hot/only-dev-server',
                    './src/index.js'
                ]
            }
            return webpackConfig
        },
        rules: {
            postcss: {
                plugins: [
                    // dependence z nwb
                    require('autoprefixer'),
                    require('cssnano')
                ]
            }
        }
    }
    config.devServer = {
        // allow django host, in case you use custom domain for django app
        allowedHosts: ["0.0.0.0"]
    }
    return config
}
