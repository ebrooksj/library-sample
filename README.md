## Description

This sample API application is build on NestJS, a NodeJS framework, with Typescript. NestJS provides an MVC approach to javascript/typescript backends.
[Nest](https://github.com/nestjs/nest)

## Installation

```bash
$ npm install
```

## Requirements

### MongoDB

This project is configured for MongoDB. For conveniece, a setup script is provided in package.json to initilize a docker instance of mongo. If you'd prerfer to use a different instance, change the mongo connection string in `.env` to point to your instance.

### Seeding the database

For the sake of expediency, a seed script is provided TODO: add seed script.
This will seed the database with 4 users; 1 librarian, and 3 customers. The librarian has custom user id 1, and the customers have ids 2-4. Note: custom_id field will be used for this exercise. In a real world scenario, we'd use the ObjectID provided by MongoDB, a similarly configured UUID. Custom ids in this application are sequential, and unique.

## Running the app

```bash
# (optional) start a mongo instance
$ npm run setup

# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Documentation

This application provides generated swagger documentation, using [NestJS swagger](https://docs.nestjs.com/openapi/introduction). This will deploy when the application is started, and can be viewed on http://localhost:3000/api.

## Authorization

As per the assignment, no system of authentication will be in place. However, we will provided a simple RBAC system using [NestJS authorization module](https://docs.nestjs.com/security/authorization).
The roles claim will utilize an auth header, `x-custom-user-id`. This will be collated against a simple roles collection which will provide the authorization roleid for the user.
The roles collection will be seeded with the following roles:

```json
{
    "id": 1,
    "name": "librarian"
},
{
    "id": 2,
    "name": "customer"
}
[...]
```

