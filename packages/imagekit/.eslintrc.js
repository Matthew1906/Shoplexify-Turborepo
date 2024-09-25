/** @type {import("eslint").Linter.Config} */
module.exports = {
    extends: ["@repo/eslint-config/library.js"],
    parser: "@typescript-eslint/parser",
    parserOptions: {
      project: true,
    },
    rules: {
      "turbo/no-undeclared-env-vars": [
        "error",
        {
          allowList: ["IMAGEKIT_PUBLICKEY", "IMAGEKIT_PRIVATEKEY", "IMAGEKIT_URL"],
        },
      ],
    },
  };
  