## Description

This is a library API build as a coding exercise for a job interview. It provides a simple functionality to checkout, return, create, and explore books in a virtual library.

## Tech Stack

This application is build using the following core technologies:

- [Nest](https://github.com/nestjs/nest)
- [MongoDB](https://www.mongodb.com/)
- [Mongoose](https://mongoosejs.com/)
- [Docker](https://www.docker.com/)
- [Swagger](https://swagger.io/)
- [Jest](https://jestjs.io/)
- [Typescript](https://www.typescriptlang.org/)
- [NPM](https://www.npmjs.com/)
  The main language of this repository is Typescript.

## Installation

Installation requires npm. This application was build and tested in nodejs v20.9.0.
If you are using nvm, an `.nvmrc` file is provided for convenience, though this notably does not work on windows.
If you are on windows, you can use the command `nvm use (cat .nvmrc)` to set the node version for nvm.

```bash
#(optional)
$ nvm use
$ npm install
```

This should install all dependencies. If for some reason you're having trouble with the nest cli, you can install it globally with `npm install -g @nestjs/cli`.

## Assumptions

- Books can only be checked out by one user at a time.
- We don't care if the user has the book checked out already, they can check out another copy of the same books.
- A max of N books can be checked out at a time. This is configurable in the `.env` file, with the `MAX_CHECKOUTS` variable. This defaults to 3.
- Books can be checked out for a max of N days. This is configurable in the `.env` file, with the `MAX_CHECKOUT_DAYS` variable. This defaults to 14.
- For Books, title, isnbn, and author are required fields. Optionally, publishDate and genre can be provided.
- For Users, integer ids are required. Hence the double id fields.
- For Users, firstName, lastName, and email are required fields.
- No APIs are available anonymously.

## Requirements

### MongoDB

This project is configured for MongoDB. For convenience, a setup script is provided in package.json to initilize a docker instance of mongo. If you'd prerfer to use a different instance, change the mongo connection string in `.env` to point to your instance.
Run mongo in docker (requires docker to be running):

```bash
$ npm run setup
```

### Seeding the database

For the sake of expediency, a seed script is provided in `seed-db.js`. The backing data can be found in `seed-data.json`. This script uses the mongo connection string from `.env`.
To run the script, use the command below:

```bash
$ npm run seeddb
```

Note: There is no input validation. If you insert invalid data into seed-data.json, the script will happily insert it into the database. This could cause some unforeseen issues.

This script will first delete the entire `library` database, including checkout records created while using the application. Then it will seed the database with 4 users; 1 librarian, and 3 customers. The librarian has custom user id 1, and the customers have ids 2-4. Note: a userId custom field will be used for this exercise, to be compliant with the requirements. In a real world scenario, we'd use the ObjectID provided by MongoDB, or a similarly configured UUID. Custom ids in this application are sequential, and unique.

Currently, the API to create new users is not implemented.

## Running the app

```bash
# (optional) start a mongo instance
$ npm run setup

# (optional) start a fresh database
$ npm run seeddb

# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Tearing down

For convenience, a teardown script has been added to stop the mongo docker instance, if it's being used. Run the following command to stop the mongo instance.

```bash
$ npm run teardown
```

## Test

Unit tests are provided for the vast majority of the codebase. Use the commands below to run the tests.

```bash
# unit tests
$ npm run test

# test coverage
$ npm run test:cov
```

## Documentation

This application provides generated swagger documentation, using [NestJS swagger](https://docs.nestjs.com/openapi/introduction). This will deploy when the application is started, and can be viewed on http://localhost:3000/api.
Note that the API documentation provided here is rudimentary in state, in the interest of time.

## Using the API

### Authorization

As per the assignment, no system of authentication will be in place. However, we will provided a simple RBAC system using [NestJS authorization module](https://docs.nestjs.com/security/authorization).
The roles claim will utilize an auth header, `x-custom-user-id`. This will be collated against a simple roles collection which will provide the authorization roleId for the user.
Roles at this time are hardcoded in the `role.enum.ts` file. In a real world scenario, these would be stored in a database, or other RBAC system.

Role is grepped from the request header by a middleware, in `set-user-role.middleware.ts`. This grabs the auth header, and sets it as a userId on the request object.
This is then passed to the HasRole guard `has-role.guard.ts`. This gets the required roles from the decorator `role.decorator.ts`, which is annotated on the method level in the controllers, as below:

```typescript
@Get()
@HasRole(Role.LIBRARIAN) // This supports mutiple roles in a comma-separated list, eg @HasRole(Role.LIBRARIAN, Role.USER)
async findAll(): Promise<Book[]> {
    return this.booksService.findAll();
}
```

If using the swagger documentation, the auth header can be set in the top right corner of the page. The header name is `x-custom-user-id`, and the value is the userId of the user you wish to authenticate as.
If using postman or curl, you can just set the header manually. The header value is `x-custom-user-id`, but can be configured in `app.constants.ts#APP_CONSTANTS.AUTH_HEADER`.

The roles collection be can seeded with the following roles:

```json
{
    "userId": 1,
    "role": "LIBRARIAN"
},
{
    "userId": 2,
    "role": "USER"
},
{
    "userId": 3,
    "role": "USER"
},
{
    "userId": 4,
    "role": "USER"
}
```

### APIs

Per the requirements, the following APIs are provided:
For Users:
`POST /books/checkout` - Checkout a book.
`DELETE /books/checkout` - Check in a book.
`GET /books/checkout/active` - Get all currently checked out books.

For Librarians:
`POST /books` - Add a new book to the library.
`DELETE /books/:id` - Delete a book from the library.
`GET /books/checkout/overdue` - Get all overdue books.

Additionally, a few simple helper APIs are provided. These work for users and librarians:
`GET /books` - Get all books in the library.
`GET /books/:id` - Get a specific book by id.
`GET /users/me` - Get the current user.

Note that user ids are almost never required attributes for the API, instead they are parsed from the id header. This provides some implicit access control e.g. I can't checkout a book for another user.

### Data Model

There are 4 basic data models in this application.

- User - the user
- Book - a book
- BookCheckout - a checkout record
- UserRole - the user Role for permissions

For convenience, books are referenced by bookcheckouts by the `book` field, which is a dbref. This can be populated by mongoose at query time. In the database, this will appear as a BSON id.
The ERD is provided in `entity-relationship-diagram.png`.

## License
No licenses, just library cards.