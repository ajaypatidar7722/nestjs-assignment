DO $$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM pg_type WHERE typname = 'userrole') THEN
        CREATE TYPE UserRole AS ENUM ('admin', 'user');
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role UserRole NOT NULL DEFAULT 'user'::UserRole
);

CREATE TABLE IF NOT EXISTS cats (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    breed VARCHAR(255) NOT NULL,
    age INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS users_favorites_cats (
    "usersId" INTEGER REFERENCES users(id),
    "catsId" INTEGER REFERENCES cats(id),
    PRIMARY KEY ("usersId", "catsId")
);
