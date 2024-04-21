## AuthController

This controller provides endpoints for user authentication and authorization.

### POST /auth/register

Register a new user.

#### Request Body

```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

#### Response

```json
{
  "statusCode": 201,
  "data": {
    "id": 1,
    "email": "test@example.com"
  }
}
```

### POST /auth/login

Login a user.

#### Request Body

```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

#### Response

```json
{
  "statusCode": 200,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjM0NTY3ODkwIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
  }
}
```

### GET /auth/me

Get the current user.

### Response

```json
{
  "statusCode": 200,
  "data": {
    "id": 1,
    "email": "test@example.com"
  }
}
```

## CatsController

### POST /cats

Create a new cat.

#### Request Body

```json
{
  "name": "Whiskers",
  "age": 5,
  "breed": "Siamese"
}
```

#### Response

```json
{
  "statusCode": 201,
  "data": {
    "id": 1,
    "name": "Whiskers",
    "age": 5,
    "breed": "Siamese"
  }
}
```

### PUT /cats/:id

Update an existing cat.

#### Request Body

```json
{
  "name": "Fluffy",
  "age": 10,
  "breed": "Maine Coon"
}
```

#### Response

```json
{
  "statusCode": 200,
  "data": {
    "id": 1,
    "name": "Fluffy",
    "age": 10,
    "breed": "Maine Coon"
  }
}
```

### DELETE /cats/:id

Delete a cat.

#### Response

```json
{
  "statusCode": 200
}
```

### GET /cats

Get all cats.

### Query Parameters

- `cursor`: The cursor to start the pagination from. Default is 0.
- `limit`: The number of cats to return per page. Default is 16.

#### Response

```json
{
  "statusCode": 200,
  "data": {
    "items": [
      {
        "id": 1,
        "name": "Whiskers",
        "age": 5,
        "breed": "Siamese"
      },
      {
        "id": 2,
        "name": "Fluffy",
        "age": 10,
        "breed": "Maine Coon"
      }
    ],
    "nextCursor": 17,
    "hasNext": true,
    "total": 33
  }
}
```

### GET /cats/:id

Get a specific cat.

#### Response

```json
{
  "statusCode": 200,
  "data": {
    "id": 1,
    "name": "Whiskers",
    "age": 5,
    "breed": "Siamese"
  }
}
```

### POST /cats/:id/favorite

Mark a cat as a favorite.

#### Response

```json
{
  "statusCode": 201
}
```

### POST /cats/:id/unfavorite

Remove cat from favorites.

#### Response

```json
{
  "statusCode": 201
}
```
