# Doctor Manager API Reference

## Introduction

Welcome to the Doctor Manager API. This is a RESTful API for managing databases, collections, and indexes, designed for data comparison and synchronization. The API also provides endpoints for user management, including registration, authentication, and profile updates.

**Technology Stack:** Go (Fiber), MongoDB

**Target Audience:** Internal engineering teams and external third-party developers.

## Authentication

The Doctor Manager API uses JWT Bearer Tokens to authenticate requests. You must include an `Authorization` header in your requests to protected endpoints.

**Scheme:** `Bearer`
**Header:** `Authorization: Bearer <YOUR_ACCESS_TOKEN>`

To obtain an access token, you must call the `POST /auth/login` endpoint with your credentials. This will return both an `access_token` and a `refresh_token`. The `access_token` has a short lifespan and is used for API requests. The `refresh_token` has a longer lifespan and can be used to get a new pair of tokens via the `POST /auth/refresh-token` endpoint.

---

## Endpoints

Endpoints are grouped by resource type.

### Auth

Endpoints for user authentication, including registration, login, and token management.

#### **`POST /auth/register`**

Creates a new user account.

**Request Body**

| Field      | Type   | Description                               | Required |
| :--------- | :----- | :---------------------------------------- | :------- |
| `username` | string | Unique username for the account.          | Yes      |
| `email`    | string | Unique email address for the account.     | Yes      |
| `password` | string | Password for the account (min 8 chars).   | Yes      |

*Example Request Body*

```json
{
  "username": "johndoe",
  "email": "john.doe@example.com",
  "password": "strong-password-123"
}
```

**Responses**

*   `201 Created`: User registered successfully.
*   `400 Bad Request`: Invalid input data.
*   `409 Conflict`: Username or email already exists.

**Code Examples**

<details>
<summary>cURL</summary>

```bash
curl -X POST http://localhost:8080/api/v1/auth/register \
-H "Content-Type: application/json" \
-d '{
  "username": "johndoe",
  "email": "john.doe@example.com",
  "password": "strong-password-123"
}'
```

</details>

<details>
<summary>Python (requests)</summary>

```python
import requests
import json

url = "http://localhost:8080/api/v1/auth/register"
payload = {
    "username": "johndoe",
    "email": "john.doe@example.com",
    "password": "strong-password-123"
}
headers = {
    "Content-Type": "application/json"
}

response = requests.post(url, data=json.dumps(payload), headers=headers)
print(response.json())
```

</details>

<details>
<summary>JavaScript (fetch)</summary>

```javascript
const url = 'http://localhost:8080/api/v1/auth/register';
const data = {
    username: 'johndoe',
    email: 'john.doe@example.com',
    password: 'strong-password-123'
};

fetch(url, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));
```

</details>

---

#### **`POST /auth/login`**

Authenticates a user and returns JWT tokens.

**Request Body**

| Field      | Type   | Description                         | Required |
| :--------- | :----- | :---------------------------------- | :------- |
| `identity` | string | The user's username or email.       | Yes      |
| `password` | string | The user's password.                | Yes      |

*Example Request Body*

```json
{
  "identity": "john.doe@example.com",
  "password": "strong-password-123"
}
```

**Responses**

*   `200 OK`: Returns `access_token` and `refresh_token`.
*   `400 Bad Request`: Invalid input data.
*   `401 Unauthorized`: Invalid credentials.

*Example 200 OK Response*

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Code Examples**

<details>
<summary>cURL</summary>

```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
-H "Content-Type: application/json" \
-d '{
  "identity": "john.doe@example.com",
  "password": "strong-password-123"
}'
```

</details>

<details>
<summary>Python (requests)</summary>

```python
import requests
import json

url = "http://localhost:8080/api/v1/auth/login"
payload = {
    "identity": "john.doe@example.com",
    "password": "strong-password-123"
}
headers = {
    "Content-Type": "application/json"
}

response = requests.post(url, data=json.dumps(payload), headers=headers)
print(response.json())
```

</details>

<details>
<summary>JavaScript (fetch)</summary>

```javascript
const url = 'http://localhost:8080/api/v1/auth/login';
const data = {
    identity: 'john.doe@example.com',
    password: 'strong-password-123'
};

fetch(url, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
})
.then(response => response.json())
.then(data => {
    console.log(data);
    // Store tokens for later use
    // localStorage.setItem('accessToken', data.access_token);
    // localStorage.setItem('refreshToken', data.refresh_token);
})
.catch(error => console.error('Error:', error));
```

</details>

---

### Account

Endpoints for managing user profiles.

#### **`GET /auth/profile`**

Retrieves the profile for the authenticated user.

**Responses**

*   `200 OK`: Returns user profile information.
*   `401 Unauthorized`: Invalid or missing token.

*Example 200 OK Response*

```json
{
  "username": "johndoe",
  "email": "john.doe@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "avatar": "https://example.com/avatars/johndoe.png"
}
```

**Code Examples**

<details>
<summary>cURL</summary>

```bash
curl -X GET http://localhost:8080/api/v1/auth/profile \
-H "Authorization: Bearer <YOUR_ACCESS_TOKEN>"
```

</details>

<details>
<summary>Python (requests)</summary>

```python
import requests

url = "http://localhost:8080/api/v1/auth/profile"
headers = {
    "Authorization": "Bearer <YOUR_ACCESS_TOKEN>"
}

response = requests.get(url, headers=headers)
print(response.json())
```

</details>

<details>
<summary>JavaScript (fetch)</summary>

```javascript
const url = 'http://localhost:8080/api/v1/auth/profile';
const token = '<YOUR_ACCESS_TOKEN>'; // Or retrieve from storage

fetch(url, {
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${token}`
    }
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));
```

</details>

---

#### **`PUT /auth/profile`**

Updates the profile for the authenticated user.

**Request Body**

| Field        | Type   | Description                         | Required |
| :----------- | :----- | :---------------------------------- | :------- |
| `first_name` | string | The user's first name.              | No       |
| `last_name`  | string | The user's last name.               | No       |
| `avatar`     | string | URL to the user's avatar image.     | No       |

*Example Request Body*

```json
{
  "first_name": "Jonathan",
  "avatar": "https://example.com/avatars/johndoe_new.png"
}
```

**Responses**

*   `200 OK`: Returns the updated user profile.
*   `400 Bad Request`: Invalid input data.
*   `401 Unauthorized`: Invalid or missing token.

**Code Examples**

<details>
<summary>cURL</summary>

```bash
curl -X PUT http://localhost:8080/api/v1/auth/profile \
-H "Authorization: Bearer <YOUR_ACCESS_TOKEN>" \
-H "Content-Type: application/json" \
-d '{
  "first_name": "Jonathan"
}'
```

</details>

<details>
<summary>Python (requests)</summary>

```python
import requests
import json

url = "http://localhost:8080/api/v1/auth/profile"
payload = {
    "first_name": "Jonathan"
}
headers = {
    "Authorization": "Bearer <YOUR_ACCESS_TOKEN>",
    "Content-Type": "application/json"
}

response = requests.put(url, data=json.dumps(payload), headers=headers)
print(response.json())
```

</details>

<details>
<summary>JavaScript (fetch)</summary>

```javascript
const url = 'http://localhost:8080/api/v1/auth/profile';
const token = '<YOUR_ACCESS_TOKEN>';
const data = {
    first_name: 'Jonathan'
};

fetch(url, {
    method: 'PUT',
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));
```

</details>

---

*NOTE: The documentation for `Databases` and `Indexes` endpoints would follow the same detailed structure, including descriptions, request/response schemas, and multi-language code examples. Due to length constraints, they are omitted here but are fully defined in the `openapi.yaml` file.*
