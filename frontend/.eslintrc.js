const restrictedGlobals = require("confusing-browser-globals")

// vychazi z https://github.com/typescript-eslint/typescript-eslint/blob/v3.4.0/packages/eslint-plugin/docs/rules/ban-types.md
// odstranuje kontrolu {} (kvuli prazdnym props v React komponentach)
const defaultTypes = {
    String: {
        message: "Use string instead",
        fixWith: "string",
    },
    Boolean: {
        message: "Use boolean instead",
        fixWith: "boolean",
    },
    Number: {
        message: "Use number instead",
        fixWith: "number",
    },
    Symbol: {
        message: "Use symbol instead",
        fixWith: "symbol",
    },

    Function: {
        message: [
            "The `Function` type accepts any function-like value.",
            "It provides no type safety when calling the function, which can be a common source of bugs.",
            "It also accepts things like class declarations, which will throw at runtime as they will not be called with `new`.",
            "If you are expecting the function to accept certain arguments, you should explicitly define the function shape.",
        ].join("\n"),
    },
    Object: {
        message: [
            'The `Object` type actually means "any non-nullish value", so it is marginally better than `unknown`.',
            '- If you want a type meaning "any object", you probably want `Record<string, unknown>` instead.',
            '- If you want a type meaning "any value", you probably want `unknown` instead.',
        ].join("\n"),
    },
    object: {
        message: [
            "The `object` type is currently hard to use ([see this issue](https://github.com/microsoft/TypeScript/issues/21732)).",
            "Consider using `Record<string, unknown>` instead, as it allows you to more easily inspect and use the keys.",
        ].join("\n"),
    },
}

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
    ignorePatterns: ["webpack.config.js", ".eslintrc.js", "jest.config.js"],
    parserOptions: {
        ecmaFeatures: {
            jsx: true,
        },
        ecmaVersion: 2018,
        sourceType: "module",

        // nastaveni potrebna pro type-aware typescript-eslint
        // https://github.com/typescript-eslint/typescript-eslint/blob/master/docs/getting-started/linting/TYPED_LINTING.md
        tsconfigRootDir: __dirname,
        project: "./tsconfig.json",
    },
    plugins: ["import", "jsx-a11y", "react", "react-hooks", "prettier", "@typescript-eslint"],
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

        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking", // pravidla zahrnujici typy

        "plugin:react/recommended",

        "plugin:import/errors",
        "plugin:import/warnings",
        "plugin:import/typescript",

        "plugin:jsx-a11y/recommended",

        "plugin:prettier/recommended",
        "prettier/@typescript-eslint",
        "prettier/babel",
        "prettier/react",
    ],
    rules: {
        "react/prop-types": 0,

        curly: "error",
        "no-console": ["error", { allow: ["warn", "debug", "error", "info"] }], // zakaz console.log
        "no-restricted-globals": ["error"].concat(restrictedGlobals),
        "no-shadow": "error",
        "no-template-curly-in-string": "error",
        "no-throw-literal": "error",
        "no-useless-concat": "error",
        "prefer-template": "error",

        "jsx-a11y/no-autofocus": 0,

        "react-hooks/exhaustive-deps": "warn",
        "react-hooks/rules-of-hooks": "error",

        "@typescript-eslint/ban-types": ["error", { types: defaultTypes, extendDefaults: false }],
        "@typescript-eslint/consistent-type-definitions": ["error", "type"],
        "@typescript-eslint/no-explicit-any": 0,
        "@typescript-eslint/no-floating-promises": 0, // TODO aktivovat po oprave #66
        "@typescript-eslint/no-unsafe-assignment": 0,
        "@typescript-eslint/no-unsafe-call": 0,
        "@typescript-eslint/no-unsafe-member-access": 0,
        "@typescript-eslint/no-unsafe-return": 0,
        "@typescript-eslint/no-use-before-define": ["error", { functions: false }],
        "@typescript-eslint/restrict-template-expressions": 0,

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
            },
        ],

        "import/namespace": [2, { allowComputed: true }],
    },
}
