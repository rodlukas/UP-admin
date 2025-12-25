import { createRequire } from "module"
const require = createRequire(import.meta.url)

const restrictedGlobals = require("confusing-browser-globals")
const typescriptEslint = require("@typescript-eslint/eslint-plugin")
const typescriptParser = require("@typescript-eslint/parser")
const react = require("eslint-plugin-react")
const reactHooks = require("eslint-plugin-react-hooks")
const importPlugin = require("eslint-plugin-import")
const jsxA11y = require("eslint-plugin-jsx-a11y")
const prettier = require("eslint-plugin-prettier")
const tanstackQuery = require("@tanstack/eslint-plugin-query")
const jestDom = require("eslint-plugin-jest-dom")
const testingLibrary = require("eslint-plugin-testing-library")
const vanillaExtractModule = await import("@antebudimir/eslint-plugin-vanilla-extract")
const vanillaExtract = vanillaExtractModule.default
const globals = require("globals")
const prettierConfig = require("eslint-config-prettier")

export default [
    {
        ignores: [
            "build/**",
            "node_modules/**",
            "__mocks__/**",
            "babel.config.js",
            "eslint.config.mjs",
            "jest.config.js",
            "jest.setup.ts",
            "webpack.config.js",
        ],
    },
    {
        files: ["**/*.css.ts"],
        plugins: {
            "vanilla-extract": vanillaExtract,
        },
        rules: {
            ...(vanillaExtract.configs?.recommended?.rules || {}),
            "vanilla-extract/no-empty-style-blocks": "off",
        },
    },
    {
        files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
        languageOptions: {
            parser: typescriptParser,
            parserOptions: {
                ecmaVersion: "latest",
                sourceType: "module",
                ecmaFeatures: {
                    jsx: true,
                },
                projectService: {
                    allowDefaultProject: ["*.config.js", "*.config.ts", "jest.setup.ts"],
                },
                tsconfigRootDir: import.meta.dirname,
            },
            globals: {
                ...globals.browser,
                ...globals.node,
                ...globals.es2021,
                ...globals.jest,
                Atomics: "readonly",
                SharedArrayBuffer: "readonly",
            },
        },
        plugins: {
            "@typescript-eslint": typescriptEslint,
            react: react,
            "react-hooks": reactHooks,
            import: importPlugin,
            "jsx-a11y": jsxA11y,
            prettier: prettier,
            "@tanstack/query": tanstackQuery,
            "jest-dom": jestDom,
            "testing-library": testingLibrary,
        },
        settings: {
            react: {
                version: "detect",
            },
            "import/resolver": {
                typescript: { alwaysTryTypes: true },
            },
            "import/ignore": ["chroma"],
        },
        rules: {
            ...typescriptEslint.configs["recommended-type-checked"].rules,
            ...typescriptEslint.configs["stylistic-type-checked"].rules,
            ...react.configs.recommended.rules,
            ...importPlugin.configs.errors.rules,
            ...importPlugin.configs.warnings.rules,
            ...importPlugin.configs.typescript.rules,
            ...jsxA11y.configs.recommended.rules,
            ...prettierConfig.rules,
            ...tanstackQuery.configs.recommended.rules,
            ...jestDom.configs.recommended.rules,
            ...testingLibrary.configs.react.rules,

            "react/prop-types": 0,

            curly: "error",
            "no-console": ["error", { allow: ["warn", "error"] }],
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
            "@typescript-eslint/no-floating-promises": ["error", { ignoreVoid: true }],
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
                    // a CSS selektory v vanilla-extract (zacina s & nebo obsahuje : nebo @)
                    filter: {
                        regex: "[- ]|^&|:|^@",
                        match: false,
                    },
                },
            ],

            "import/namespace": [2, { allowComputed: true }],
            "import/order": [
                "error",
                {
                    groups: ["builtin", "external", "internal", "parent", "sibling", "index"],
                    "newlines-between": "always",
                    alphabetize: {
                        order: "asc",
                        caseInsensitive: true,
                    },
                },
            ],
        },
    },
]
