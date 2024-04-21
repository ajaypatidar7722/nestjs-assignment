## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Prerequisites / Dependencies

You must have following on your system before you can start application

- Node.js
- npm
- **[Optional]** docker & docker-compose

## Installation

```bash
$ npm install
```

## Setting up the database

### Using docker

```bash
# cd in to the root directory of the repository
cd nestjs-assignment

# run the compose file
docker-compose up -d
```

The compose file starts a PG server and make it accessible on `localhost:5432`.

Additionally, initializes scripts in dir `docker/postgres-init-scripts/docker-entrypoint-initdb.d` to

- Create tables `Cats`, `Users` and `Favorites`
- Seed some cats into the database

> These scripts will only execute when the postgres-data volume is empty

### Using without docker

To setup the database without docker you need to run the following commands

```bash
# cd in to the directory with the scripts
cd ./nestjs-assignment/docker/postgres-init-scripts/docker-entrypoint-initdb.d

# Prepare schema
psql -U your_username -d your_database_name -f ./01_schema.sql

# Seed cats
psql -U your_username -d your_database_name -f ./01_seed.sql
```

Note: **01_schema.sql** is idempotant but **02_seed.sql** is not and running seed twice will throw duplicate primary key error.

> Make sure the postgres database service is running before running above commands.

## Setting up env variables

Create `.env` in the root of the project and copy content of `.env.example` into it.

## Running the app

```bash
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

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Changes to existing project setup

- [x] Attach Exception and Timeout interceptors in CoreModule

## Things not part of this submission

- **id -> uuid:** Serial ID for records are easily predictable and should be replaced by uuid.
- **No migrations:** Database is initialized using init scripts supported by docker. There is not a solution to handle upcoming migration
- **Favorite cats in repsopnse to GET /cats API:** It makes a lot of sense to add a key `favorite` with each cat in the list. Most morden designs have a ❤️ icon with each item that can be added to favorite.

# APIs

All APIs are document in [API](./API.md) file.
