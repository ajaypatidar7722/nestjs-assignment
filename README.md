# NestJS Cats API with JWT Authentication

This repository is a test task that builds upon the [NestJS starter repository](https://github.com/Tundrax-Dex/nestjs-assignment). It includes an implementation of a Cats API and JWT authentication using Passport.

## Features

- JWT authentication for secure API access.
- API for CRUD operations on cat data.
- API to mark cat favorite and unfavorite.
- Docker setup for easy application startup
- [API](./API.md) Documentation

## Prerequisites

Before starting the application, ensure you have the following installed:

- Node.js
- npm
- Docker & docker-compose (optional but recommended for a quick smooth start)

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
docker-compose up -d db
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

## Additional tasks covered apart from the coding challenge requirements

- [x] Attach Exception and Timeout interceptors in CoreModule.
- [x] API to unfavorite a cat.
- [x] Setup [ErrorsInterceptor](./src/common/interceptors/exception.interceptor.ts) to segregate typeorm errors and respond with correct status code.
- [x] Consistent logs using LoggerModule every where.

## Things to improve but not part of this submission

Due to shortage of time this submission does not include the followings:

- **id -> uuid:** Serial ID for records are easily predictable and should be replaced by uuid.
- **No migrations:** Database is initialized using init scripts supported by docker. There is not a solution to handle upcoming migration
- **Favorite cats in repsopnse to GET /cats API:** It makes a lot of sense to add a key `favorite` with each cat in the list. Most morden designs have a ❤️ icon with each item that can be added to favorite.
- **Folder structure:** There are many improvements that can be done, but, specially the part with `/src/core` and `/src/common` are pretty close to confusing. There are various ways to solve it
  - Put all the modules in `/src/modules` directly to keep the content of `/src` clean. `/src` will grow into a big fat folder as there will be a log modules for a production application
  - We can make multiple [nestjs libraries](https://docs.nestjs.com/cli/libraries) to keep configuration and utils into reasonably separate from each other.
- **Full E2E:** E2E coverage cats and auth controller
  - Cats controller is partially covered in e2e.
  - Auth controller is not covered in e2e.
- **Compose setup:** Whole app could be configured to started using `docker compose up`.
