const restrictedGlobals = require("confusing-browser-globals")

// castecne vychazi z: https://github.com/facebook/create-react-app/blob/master/packages/eslint-config-react-app/index.js
module.exports = {
    root: true,
    parser: "babel-eslint",
    env: {
        browser: true,
        node: true,
        es6: true
    },
    globals: {
        Atomics: "readonly",
        SharedArrayBuffer: "readonly"
    },
    parserOptions: {
        ecmaFeatures: {
            jsx: true
        },
        ecmaVersion: 2018,
        sourceType: "module"
    },
    plugins: ["import", "flowtype", "jsx-a11y", "react", "react-hooks", "prettier"],
    settings: {
        react: {
            version: "detect"
        }
    },
    extends: [
        "eslint:recommended",
        "plugin:react/recommended",
        "plugin:import/errors",
        "plugin:import/warnings",
        "plugin:jsx-a11y/recommended",
        "plugin:flowtype/recommended",
        "plugin:prettier/recommended",
        "prettier/babel",
        "prettier/flowtype",
        "prettier/react"
    ],
    rules: {
        "react/prop-types": 0,
        "no-restricted-globals": ["error"].concat(restrictedGlobals),
        "jsx-a11y/no-autofocus": 0,
        "react-hooks/rules-of-hooks": "error",
        "react-hooks/exhaustive-deps": "warn"
    }
}
