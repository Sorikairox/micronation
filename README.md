

## Required tools

To run micronation, you will need :

- [NodeJS](https://nodejs.org/en/) >= 14.17.3
- [Yarn](https://classic.yarnpkg.com/lang/en/) 1.21 as your package manager
- A [MongoDB](https://www.mongodb.com/) database for data storage running on port 27018 for test and 27017 for usual app run (this will be in a .env file soon)

## Installation

First, clone the repository with : 

`git clone https://github.com/Sorikairox/micronation`


Install all dependencies by using `yarn install` in `back` and `front` folders.

Copy `.env.example` content to a `.env` file with your own configuration

## Running the apps

### Back
Microservices are built with NestJS framework and use their scripts.

`yarn start:dev` to run and watch for changes

`yarn start` to run the app 

`yarn test` to run integration tests

`yarn test:e2e` to run end-to-end tests

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[unlicense](https://choosealicense.com/licenses/unlicense/)
