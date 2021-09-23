![workflow status](https://github.com/humanity-cash/local-currency-core/workflows/Build/badge.svg)
# local-currency-core/api

Web services to support on-chain interaction with Humanity Cash local-currency contracts

## Install
```
nvm use 12
yarn --ignore-engines
```
## Testing
### Dependencies
* A `dotenv` file for test called `.env.test` (supplied) 
* Install `ganache-cli` instance:
```
npm install -g ganache-cli
```
### Test execution
* First, in a separate terminal run `ganache-cli` with the mnemonic matched in the `.env.test` file:
```
npx ganache-cli -m "recall exit lawsuit early about crack empower execute outdoor artefact harbor cover"
```
* Then run the yarn task for the suite you want to test. Coverage task is available with the same options.

| Area                     | Command               |
| -------------            | --------------------- |
| Smart contracts only     | `yarn test:contracts` |
| Full server endpoints    | `yarn test:server`    |
| Database                 | `yarn test:db`        |

## Styling
```
yarn prettier
```
## Automation
* `../.github/workflows/build-api.yml` script will build and deploy to a local ganache instance in the GitHub runner to perform unit tests.

## API
### Swagger detailed definition
* https://app.swaggerhub.com/apis/Humanity.Cash/local-currency/1.0.1
* Additionally exported and available in the `/docs/` folder

### Summary

| HTTP | Path                  | Usage                                          | Authorization |
| -----| --------              | ---------------------                          | ------------- |
| GET  | /health               | API health information                         | None          |
| GET  | /stats/deposit        | Get all deposits                               | None          |
| GET  | /stats/withdrawal     | Get all withdrawals                            | None          |
| GET  | /stats/transfer       | Get all transfers                              | None          |
| GET  | /stats/operator       | Get aggregated operator statistics             | None          |
| GET  | /users                | Get all users                                  | None          |
| GET  | /users/:id            | Get single user                                | None          |
| GET  | /users/:id/deposit    | Get deposits for a single user                 | None          |
| GET  | /users/:id/withdrawal | Get withdrawals for a single user              | None          |
| GET  | /users/:id/transfer   | Get transfers for a single user                | None          |
| POST  | /users/               | Create a new wallet/user                      | Token / AWS Cognito  |
| POST  | /users/:id/deposit    | Create a deposit for a wallet                 | Token / AWS Cognito  |
| POST  | /users/:id/withdrawal | Create a withdrawal for a wallet              | Token / AWS Cognito  |
| POST  | /users/:id/transfer   | Create a transfer between two wallets         | Token / AWS Cognito  |
| POST  | /admin/pause          | Pause the contract suite                      | Token / AWS Cognito  |
| POST  | /admin/unpause        | Unpause the contract suite                    | Token / AWS Cognito  |
| POST  | /transfer/controller  | Transfer ownership of the controller contract | Token / AWS Cognito  |
| POST  | /transfer/user        | Transfer ownership of a user/wallet           | Token / AWS Cognito  |
| POST  | /webhook/             | Hosted endpoint for Dwolla to post to         | Authenticated header |