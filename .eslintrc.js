module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: ["plugin:react/recommended", "airbnb", "prettier"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 12,
    sourceType: "module"
  },
  plugins: ["react", "@typescript-eslint", "prettier"],
  ignorePatterns: ["**/*.d.ts", "dist/*.js"],
  rules: {
    "prettier/prettier": "error",
    "react/jsx-filename-extension": [1, { extensions: [".tsx", ".ts"] }],
    "react/jsx-props-no-spreading": "off",
    "no-use-before-define": "off",
    "@typescript-eslint/no-use-before-define": ["error"],
    "no-unused-vars": "off",
    "no-underscore-dangle": "off",
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    "comma-dangle": ["error", "never"],
    "no-restricted-globals": [
      "error",
      {
        name: "window",
        message: "Use `browserWindow` from ~src/browserWindow instead."
      }
    ],
    "react/jsx-no-undef": "off",
    "no-undef": "off",
    "no-bitwise": "off",
    "no-param-reassign": ["error", { props: false }],
    "import/extensions": "off",
    "import/no-unresolved": "off",
    "import/prefer-default-export": "off",
    "import/no-extraneous-dependencies": [
      "error",
      { devDependencies: ["*.ts"] }
    ]
  },
  settings: {
    react: {
      version: "16.4.2"
    }
  }
};
