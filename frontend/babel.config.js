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
    plugins: ["react-hot-loader/babel"],
    // https://github.com/facebook/create-react-app/blob/main/packages/babel-preset-react-app/create.js
    // https://github.com/babel/babel/issues/15679#issuecomment-1573896798
    assumptions: {
        setPublicClassFields: true,
        privateFieldsAsProperties: true,
    },
}
