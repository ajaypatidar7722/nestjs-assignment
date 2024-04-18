DO $$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM pg_type WHERE typname = 'userrole') THEN
        CREATE TYPE UserRole AS ENUM ('admin', 'user');
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS Users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role UserRole NOT NULL
);

CREATE TABLE IF NOT EXISTS Cats (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    breed VARCHAR(255) NOT NULL,
    age INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS Favorites (
    user_id INTEGER REFERENCES Users(id),
    cat_id INTEGER REFERENCES Cats(id),
    PRIMARY KEY (user_id, cat_id)
);
