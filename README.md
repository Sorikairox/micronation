

## Required tools

To run micronation, you will need :

- [NodeJS](https://nodejs.org/en/) >= 14.17.3
- [Yarn](https://classic.yarnpkg.com/lang/en/) 1.21 as your package manager
- A [MongoDB](https://www.mongodb.com/) database for data storage

## Installation

First, clone the repository with :

`git clone https://github.com/Sorikairox/micronation`


Install all dependencies by using `yarn install` in `back` and `front` folders.

Copy `.env.example` content to a `.env`, `.env.test.integration` and `.env.test.e2e` file with your own configuration for each case.

## Running the apps

The entire project is meant to be considered as an **experiment**, thus is made to be visited from the **Fouloscopie** plateform.
As a result, expose the **front** server on port `3500` and the back one on port `3000` and then visit https://preprod.fouloscopie.com/experiment/1

### Back
Microservices are built with NestJS framework and use their scripts.

Before running, `library` must be built **at least once** with `tsc --build library/tsconfig.json` (or `cd library && yarn tsc`).

- `yarn start:dev` to run and watch for changes
- `yarn start` to run the app
- `yarn test` to run base tests
- `yarn test:integration` to run integration tests
- `yarn test:e2e` to run end-to-end tests

### Front

The Nuxt environnement is being used for the front integration, in addition with `yarn` scripts.

Go to the `front` folder and enter `yarn` to install all the dependencies.
Then, start the dev mode with `yarn dev` or build the entire project with `yarn build`.

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

### Naming conventions

We use [DDD (Domain Driven Design)](https://en.wikipedia.org/wiki/Domain-driven_design) principles.

#### Ground rules

- The entrypoint is named `main.ts`.
- Every class must be defined in its own file.
- Files are named after the class they define (PascalCase). Example: `FlagRepository.ts` is expected to contain the definition of the `FlagRepository` class.
- Files are sorted in folders that make a domain structure. Example: `flag/pixel/Pixel.ts` is located in the domain `pixel` which is a subdomain of the domain `flag`.
  
#### Tests

- Test files are named after the class (PascalCase) or domain (kebab-case) they test and end with `.spec.ts`, `.spec-integration.ts` or `.spec-e2e.ts`. Example: `FlagService.spec-integration.ts` is expected to contain all integration tests of the `FlagService` class.
- Test files are located in a `spec` folder inside the domain folder they relate to. Example: all tests of stuff in the domain `flag` are located in `flag/spec/`. 
- End to end tests are located in the `test` folder at the root of the module.

## License
[unlicense](https://choosealicense.com/licenses/unlicense/)
