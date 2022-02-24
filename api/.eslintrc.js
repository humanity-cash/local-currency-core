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
          "templates": true,
          "lang": "en_US",
          "skipWords": [
            "microdeposits",
            "maxattempts",
            "Href",
            "checksum",
            "cancelled",
            "versa",
            "mongodb",
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
            "tokeeeen",
            "unpause",
            "Hmac",
            "unix",
            "txHash",
            "dotenv",
            "Middlewares",
            "Blockchain",
            "Func",
            "uint256",
            "Ownable",
            "Unpaused",
            "unprocessable"
          ],
          "minLength" : 4
        }
      ]
   },
    extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended',
      'prettier',
      'prettier/@typescript-eslint'
    ]
  };