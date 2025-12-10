const restrictedGlobals = require("confusing-browser-globals")

// castecne vychazi z:
// https://github.com/facebook/create-react-app/blob/master/packages/eslint-config-react-app/index.js
module.exports = {
    root: true,
    parser: "@typescript-eslint/parser",
    env: {
        browser: true,
        node: true,
        es6: true,
        jest: true,
    },
    globals: {
        Atomics: "readonly",
        SharedArrayBuffer: "readonly",
    },
    overrides: [
        {
            files: ["*.ts", "*.tsx", "*.js", "*.jsx"],
        },
    ],
    // ignorace souboru v urovni s konfiguraci
    ignorePatterns: ["/*.js", "/*.ts", "build/*", "node_modules/*", "__mocks__/*"],
    parserOptions: {
        ecmaFeatures: {
            jsx: true,
        },
        ecmaVersion: 2018,
        sourceType: "module",

        tsconfigRootDir: __dirname,
        projectService: true,
    },
    plugins: [
        "import",
        "jsx-a11y",
        "react",
        "react-hooks",
        "prettier",
        "@typescript-eslint",
        "jest-dom",
        "testing-library",
    ],
    settings: {
        react: {
            version: "detect",
        },
        // resolver eslint-import-resolver-typescript zaridi spravne chovani k @types
        // viz https://github.com/benmosher/eslint-plugin-import/issues/1341
        "import/resolver": {
            typescript: { alwaysTryTypes: true },
        },
        // kvuli false positives "ESLint: 'contrast' not found in imported namespace 'chroma'.(import/namespace)"
        "import/ignore": ["chroma"],
    },
    extends: [
        "eslint:recommended",

        "plugin:@typescript-eslint/recommended-type-checked",
        "plugin:@typescript-eslint/stylistic-type-checked",

        "plugin:react/recommended",

        "plugin:import/errors",
        "plugin:import/warnings",
        "plugin:import/typescript",

        "plugin:jsx-a11y/recommended",

        "plugin:prettier/recommended",

        "plugin:jest-dom/recommended",
        "plugin:testing-library/react",
    ],
    rules: {
        "react/prop-types": 0,

        curly: "error",
        "no-console": ["error", { allow: ["warn", "debug", "error", "info"] }], // zakaz console.log
        "no-restricted-globals": ["error"].concat(restrictedGlobals),
        "no-shadow": "off",
        "no-template-curly-in-string": "error",
        "no-throw-literal": "error",
        "no-useless-concat": "error",
        "prefer-template": "error",

        "jsx-a11y/no-autofocus": 0,

        "testing-library/no-container": "warn",
        "testing-library/no-node-access": "warn",

        "react-hooks/exhaustive-deps": "warn",
        "react-hooks/rules-of-hooks": "error",

        "@typescript-eslint/no-shadow": ["error"],
        "@typescript-eslint/consistent-type-definitions": ["error", "type"],
        "@typescript-eslint/no-explicit-any": 0,
        "@typescript-eslint/no-floating-promises": 0, // TODO aktivovat po oprave #66
        "@typescript-eslint/no-unsafe-assignment": 0,
        "@typescript-eslint/no-unsafe-call": 0,
        "@typescript-eslint/no-unsafe-member-access": 0,
        "@typescript-eslint/no-unsafe-return": 0,
        "@typescript-eslint/no-use-before-define": ["error", { functions: false }],
        "@typescript-eslint/restrict-template-expressions": 0,
        "@typescript-eslint/no-empty-object-type": "off",

        // vlastni pravidla camelCase,
        // https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/naming-convention.md
        camelcase: "off",
        "@typescript-eslint/naming-convention": [
            "error",
            {
                selector: "variableLike",
                format: ["camelCase", "PascalCase"], // PascalCase pro komponenty
                leadingUnderscore: "allow",
            },
            {
                selector: "variable",
                format: ["camelCase", "PascalCase", "UPPER_CASE"], // UPPER_CASE pro konstanty
            },

            {
                selector: "property",
                format: ["camelCase", "PascalCase", "snake_case", "UPPER_CASE"], // snake_case kvuli DRF API
                // ignoruj vlastnosti s pomlckami (CSS tridy v classNames objektech)
                filter: {
                    regex: "[- ]",
                    match: false,
                },
            },
        ],

        "import/namespace": [2, { allowComputed: true }],
        "import/order": [
            "error",
            {
                groups: ["builtin", "external", "parent", "sibling", "index"],
                "newlines-between": "always",
                alphabetize: {
                    order: "asc",
                    caseInsensitive: true,
                },
            },
        ],
    },
}
