
## Run Locally

Clone the project

```bash
  git clone git@github.com:kafir-coder/bulir-challenge.git
```

Go to the project directory

```bash
  cd bulir-challenge
```

```zsh
  docker compose up -d// will start a server in port 8080
```

## Usage

Import the ``bulir-postman.json`` into json


# API Endpoints

## Users

- **POST** `/users`
  - Create a new user.

- **GET** `/users/{id}`
  - Retrieve a user by ID.

- **GET** `/users/{id}/balance`
  - Retrieve the balance of a user.

## Service Managment

- **POST** `/services`
  - Create a new service.
  - 
- **GET** `/services/{id}`
  - gets a service.

- **POST** `/services/{id}/bookings`
  - books a service.

- **DELETE** `/services/{id}/bookings/{bid}`
  - Cancels a booking.

- **GET** `/services/bookings-history`
  - gets a paginated list history of bookings.
