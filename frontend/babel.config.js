module.exports = {
    env: {
        production: {
            // vycleneni useESModules pouze na produkci kvuli nefunkcnimu Jestu
            plugins: [
                [
                    "@babel/plugin-transform-runtime",
                    {
                        useESModules: true,
                    },
                ],
            ],
        },
        test: {
            // Jest deps
            plugins: [["@babel/plugin-transform-runtime"]],
        },
    },
    presets: ["@babel/preset-env", "@babel/preset-react", "@babel/preset-typescript"],
    plugins: [
        "react-hot-loader/babel",
        [
            "@babel/plugin-proposal-class-properties",
            {
                loose: true,
            },
        ],
    ],
}
