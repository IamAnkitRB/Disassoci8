export default {
    "env": {
      "node": true,
      "es2021": true
    },
    "extends": [
      "eslint:recommended",
      "plugin:@typescript-eslint/recommended",
      "plugin:prettier/recommended"
    ],
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
      "ecmaVersion": "latest",
      "sourceType": "module"
    },
    "plugins": [
      "@typescript-eslint",
      "prettier"
    ],
    "rules": {
      "prettier/prettier": "error",
      "no-console": "warn",
      "no-unused-vars": "warn",
      "consistent-return": "off",
      "@typescript-eslint/no-explicit-any": "off"
    }
  }
  