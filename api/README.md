# local-currency-core/api

Web services to support on-chain interaction with Humanity Cash local-currency contracts
## Install
```
nvm use 12
yarn --ignore-engines
```
## Test
### Dependencies
* A `dotenv` file for test called `.env.test` (supplied) 
* Install `ganache-cli` instance:
```
npm install -g ganache-cli
```
* Run `ganache-cli` with the mnemonic matched in the `.env.test` file:
```
    npx ganache-cli -m "recall exit lawsuit early about crack empower execute outdoor artefact harbor cover"
```
### Execute tests
* Smart contract tests
```
yarn test:contracts
```
* Database tests
```
yarn test:db
```
* Coverage
```
yarn coverage
```
## Styling
```
yarn prettier
```
## Automation
* `../.github/workflows/build-api.yml` script will build and deploy to a local ganache instance in the GitHub runner to perform unit tests.
