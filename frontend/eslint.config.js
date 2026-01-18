// eslint.config.js
const {defineConfig} = require("eslint/config");
const unusedImports = require("eslint-plugin-unused-imports")

module.exports = defineConfig([
    {
        plugins: {
            "unused-imports": unusedImports,
        },
        ignores: [
            "**/*.config.js",
            "!**/eslint.config.js",
            "public/**"
        ],
        rules: {
            "prefer-const": "error",
            "no-unused-vars": "off", // or "@typescript-eslint/no-unused-vars": "off",
            "unused-imports/no-unused-imports": "error",
            "unused-imports/no-unused-vars": [
                "warn",
                {
                    "vars": "all",
                    "varsIgnorePattern": "^_",
                    "args": "after-used",
                    "argsIgnorePattern": "^_",
                },
            ]
        }
    }
]);