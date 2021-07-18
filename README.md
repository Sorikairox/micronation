

## Required tools

To run micronation, you will need :

- [NodeJS](https://nodejs.org/en/) >= 14.17.3
- [Yarn](https://classic.yarnpkg.com/lang/en/) 1.21 as your package manager
- A [MongoDB](https://www.mongodb.com/) database for data storage running on port 27018 for test and 27017 for usual app run (this will be in a .env file soon)

## Installation

First, clone the repository with : 

`git clone https://github.com/Sorikairox/micronation`


Install all dependencies by using `yarn install` in `back` and `front` folders.

Copy `.env.example` content to a `.env` and `.env.e2e` file with your own configuration for normal and e2e-test runs.

## Running the apps

### Back
Microservices are built with NestJS framework and use their scripts.

Before running, `library` must be built **at least once** with `tsc --build library/tsconfig.json` (or `cd library && yarn tsc`).

- `yarn start:dev` to run and watch for changes
- `yarn start` to run the app 
- `yarn test` to run base tests
- `yarn test:integration` to run integration tests
- `yarn test:e2e` to run end-to-end tests

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

### Naming conventions

We use [DDD (Domain Driven Design)](https://en.wikipedia.org/wiki/Domain-driven_design) principles.

Most classes should be defined in their own single class file, while in certain cases it is relevant to have many definitions in a single file (for example error classes).

Files are sorted in folders that make a domain structure. Example: `flag/pixel/Pixel.ts` is located in the domain `pixel` which is a subdomain of the domain `flag`.
Test files are located in a `spec` folder inside the domain folder they relate to. Example: all tests of stuff in the domain `flag` are located in `flag/spec/`.

- Files defining a single class are named after the class (PascalCase). Example: `FlagRepository.ts` is expected to contain the definition of the `FlagRepository` class.
- Other files are named after their content relative to their domain. Example: `flag-errors.ts` is expected to contain many error classes that are used in the `flag` domain.
- The entrypoint is named `main.ts`.
- Test files are named after the class (PascalCase) or domain (kebab-case) they test and end with `.spec.ts`. Example: `FlagController.spec.ts` is expected to contain all tests of the `FlagController` class.

## License
[unlicense](https://choosealicense.com/licenses/unlicense/)
