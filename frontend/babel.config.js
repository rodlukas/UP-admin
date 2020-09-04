module.exports = {
    env: {
        production: {
            // vycleneni pouze na production kvuli nefunkcnimu Jestu
            plugins: [
                [
                    "@babel/plugin-transform-runtime",
                    {
                        useESModules: true,
                    },
                ],
            ],
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
