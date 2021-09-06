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

### API

