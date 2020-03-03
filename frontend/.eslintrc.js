const restrictedGlobals = require("confusing-browser-globals")

// castecne vychazi z: https://github.com/facebook/create-react-app/blob/master/packages/eslint-config-react-app/index.js
module.exports = {
    root: true,
    parser: "@typescript-eslint/parser",
    env: {
        browser: true,
        node: true,
        es6: true
    },
    globals: {
        Atomics: "readonly",
        SharedArrayBuffer: "readonly"
    },
    ignorePatterns: ["webpack.config.js"],
    parserOptions: {
        ecmaFeatures: {
            jsx: true
        },
        ecmaVersion: 2018,
        sourceType: "module",

        // nastaveni potrebna pro type-aware typescript-eslint
        // viz https://github.com/typescript-eslint/typescript-eslint/blob/master/docs/getting-started/linting/TYPED_LINTING.md
        tsconfigRootDir: __dirname,
        project: "./tsconfig.json"
    },
    plugins: ["import", "jsx-a11y", "react", "react-hooks", "prettier", "@typescript-eslint"],
    settings: {
        react: {
            version: "detect"
        },
        // resolver eslint-import-resolver-typescript zaridi spravne chovani k @types
        // viz https://github.com/benmosher/eslint-plugin-import/issues/1341
        "import/resolver": {
            typescript: { alwaysTryTypes: true }
        },
        // kvuli false positives "ESLint: 'contrast' not found in imported namespace 'chroma'.(import/namespace)"
        "import/ignore": ["chroma"]
    },
    extends: [
        "eslint:recommended",

        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended",
        // pravidla zahrnujici typy
        // viz https://github.com/typescript-eslint/typescript-eslint/blob/master/docs/getting-started/linting/TYPED_LINTING.md
        "plugin:@typescript-eslint/recommended-requiring-type-checking",

        "plugin:react/recommended",

        "plugin:import/errors",
        "plugin:import/warnings",
        "plugin:import/typescript",

        "plugin:jsx-a11y/recommended",

        "plugin:prettier/recommended",
        "prettier/@typescript-eslint",
        "prettier/babel",
        "prettier/react"
    ],
    rules: {
        "react/prop-types": 0,

        "no-restricted-globals": ["error"].concat(restrictedGlobals),
        // zakaz console.log
        "no-console": ["error", { allow: ["warn", "debug", "error", "info"] }],

        "jsx-a11y/no-autofocus": 0,

        "react-hooks/rules-of-hooks": "error",
        "react-hooks/exhaustive-deps": "warn",

        "@typescript-eslint/no-explicit-any": 0,
        "@typescript-eslint/no-use-before-define": ["error", { functions: false }],

        // vlastni pravidla camelCase, viz https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/camelcase.md
        camelcase: "off",
        // deaktivace pro properties kvuli DRF API
        "@typescript-eslint/camelcase": ["warn", { properties: "never" }],

        "import/namespace": [2, { allowComputed: true }]
    }
}
