  // eslint-disable-next-line no-undef
  module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    plugins: [
      '@typescript-eslint',
      'spellcheck'
    ],
    rules: {
      "spellcheck/spell-checker": [1,
        {
          "identifiers": false,
          "templates": false,
          "lang": "en_US",
          "skipWords": [
            "Href",
            "Dwolla",
            "chai",
            "Webhook",
            "Deployer",
            "Webhooks",
            "plaintext",
            "ascii",
            "bytecode",
            "erc20",
            "keccak256",
            "Idempotency",
            "Cognito",
            "sinon",
            "tokeeen",
            "unpause",
            "Hmac",
            "unix",
            "txHash",
            "dotenv",
            "Middlewares",
            "Blockchain",
            "Func",
            "repos",
            "gravatar",
            "gists",
            "Axios",
            "Perf",
            "BerkShares"
          ],
          "minLength" : 4
        }
      ]
   },
    extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended',
      'prettier'
    ]
  };