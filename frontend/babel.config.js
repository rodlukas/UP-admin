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
    presets: [
        [
            "@babel/preset-env",
            {
                // webpack4 nepdporuje optional chaining, aby fungoval build, je potreba transformovat operatory,
                // viz https://github.com/vercel/next.js/issues/17273#issuecomment-700700214,
                // https://github.com/webpack/webpack/issues/10227
                include: [
                    "@babel/plugin-proposal-optional-chaining",
                    "@babel/plugin-proposal-nullish-coalescing-operator",
                    "@babel/plugin-proposal-numeric-separator",
                    "@babel/plugin-proposal-logical-assignment-operators",
                ],
            },
        ],
        "@babel/preset-react",
        "@babel/preset-typescript",
    ],
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
