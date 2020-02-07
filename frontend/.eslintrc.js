const restrictedGlobals = require("confusing-browser-globals")

module.exports = {
    root: true,
    parser: "babel-eslint",
    env: {
        browser: true,
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
    }
    // TODO - vytvorit, pouzit pluginy a pripadne presety/CRA pristup viz
    //  https://github.com/facebook/create-react-app/blob/master/packages/eslint-config-react-app/index.js
    //  + restrictedGlobals
    //extends: ["eslint:recommended", "plugin:react/recommended"],
    //rules: { "react/prop-types": 0 }
}
