
module.exports = {
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "prettier"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
    "plugin:import/recommended",
    "plugin:import/warnings",
    "plugin:import/typescript"
  ],
  rules: {
    "import/no-default-export": "error",
    "import/default": "off",
    "import/named": "off",
    "@typescript-eslint/no-explicit-any": 0
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: "module"
  },
  env: {
    node: true,
    es6: true,
    jest: true
  },
};