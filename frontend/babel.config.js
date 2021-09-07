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
        // Enable loose mode to use assignment instead of defineProperty
        // See discussion in https://github.com/facebook/create-react-app/issues/4263
        // Note:
        // 'loose' mode configuration must be the same for
        // * @babel/plugin-proposal-class-properties
        // * @babel/plugin-proposal-private-methods
        // * @babel/plugin-proposal-private-property-in-object
        // (when they are enabled)
        [
            "@babel/plugin-proposal-class-properties",
            {
                loose: true,
            },
        ],
        [
            "@babel/plugin-proposal-private-methods",
            {
                loose: true,
            },
        ],
        [
            "@babel/plugin-proposal-private-property-in-object",
            {
                loose: true,
            },
        ],
    ],
}
