module.exports = {
    env: {
        development: {
            plugins: ["react-refresh/babel"],
        },
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
        "@babel/preset-env",
        [
            "@babel/preset-react",
            {
                runtime: "automatic",
                development: process.env.NODE_ENV !== "production",
            },
        ],
        "@babel/preset-typescript",
    ],
    // https://github.com/facebook/create-react-app/blob/main/packages/babel-preset-react-app/create.js
    // https://github.com/babel/babel/issues/15679#issuecomment-1573896798
    assumptions: {
        setPublicClassFields: true,
        privateFieldsAsProperties: true,
    },
}
