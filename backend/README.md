# Signet Pro Doctor Manager Api

## Environment variable

| Environment                        | Default                                                        | Separator |
|------------------------------------|----------------------------------------------------------------|-----------|
| TOKEN_PUBLIC_KEY_PATH              | certs/public.pem                                               |           |
| TOKEN_PRIVATE_KEY_PATH             | certs/private.pem                                              |           |
| PORT                               | 8223                                                           |           |
| HOST                               | 0.0.0.0                                                        |           |
| TOKEN_TYPE                         | Bearer                                                         |           |
| MONGODB_MINI_APP_URI               | mongodb://localhost:27017                                      |           |
| MONGODB_MINI_APP_NAME              | db_mapp                                                        |           |
| S3_ENDPOINT                        | 127.0.0.1:9000                                                 |           |
| S3_BUCKET                          | root                                                           |           |
| S3_MINI_APP_RESOURCE_PATH          | /mini-app                                                      |           |
| S3_ACCESS_KEY_ID                   | !change_me!                                                    |           |
| S3_SECRET_ACCESS_KEY               | !change_me!                                                    |           |
| PAGINATION_MAX_ITEM                | 50                                                             |           |
| MAX_PART_SIZE_UPLOAD               | 10485760                                                       |           |
| MAX_BODY_SIZE                      | 104857600                                                      |           |
| MAX_VERSION_RESOURCE_SIZE          | 26214400                                                       |           |
| S3_MAX_UPLOAD_RETRIES              | 3                                                              |           |
| MONGODB_REQUEST_TIMEOUT            | 3m                                                             |           |
| MONGODB_BULK_WRITE_REQUEST_TIMEOUT | 10m                                                            |           |
| S3_REQUEST_TIMEOUT                 | 3m                                                             |           |
| TOKEN_LIMIT_TIME_EXPIRE            | 10m                                                            |           |
| TOKEN_ISSUE_AT_ALLOW_DIFF_DURATION | 5m                                                             |           |
| S3_ENABLE_TLS                      | false                                                          |           |
| DEBUG                              | false                                                          |           |
| ELASTIC_APM_ENABLE                 | false                                                          |           |
| MONGO_AUTO_INDEXING                | false                                                          |           |
| ACCESS_TOKEN_TIMEOUT               | 10m                                                            |           |
| REFRESH_TOKEN_TIMEOUT              | 24h                                                            |           |
| S3_MAX_UPLOAD_SIZE                 | 4194304                                                        |           |
| MINI_APP_IMAGE_TYPE_UPLOAD_ALLOW   | image/heic,image/png,image/jpeg,image/webp,image/bmp,image/gif | ,         |
| MINI_APP_RESOURCE_PREFIX           | http://127.0.0.1:9000/resources                                |           |
| UPLOAD_TRANSACTION_TIMEOUT         | 10m                                                            |           |
| STG_MINI_APP_LIMIT                 | 10                                                             |           |
| MONGODB_API_URI                    | mongodb://localhost:27017                                      |           |
| MONGODB_API_NAME                   | db_api                                                         |           |
| WEBAUTHN_RP_DISPLAY_NAME           | Miniapp                                                        |           |
| WEBAUTHN_RP_ID                     | localhost                                                      |           |
| WEBAUTHN_RP_ORIGINS                | http://localhost:8082                                          | ,         |
| LOGIN_MFA_TRANSACTION_TIMEOUT      | 10m                                                            |           |

### Elastic APM

| Environment                 | Example                 |
|-----------------------------|-------------------------|
| ELASTIC_APM_CAPTURE_BODY    | all                     |
| ELASTIC_APM_ENVIRONMENT     | development             |
| ELASTIC_APM_SERVICE_VERSION | 1.0.0                   |
| ELASTIC_APM_SERVICE_NAME    | sigpro-web-api-dev-mapp |
| ELASTIC_APM_SECRET_TOKEN    | xxxxxx                  |
| ELASTIC_APM_SERVER_URL      | http://localhost:8200   |

---

## Develop

### Option 1: AIR

#### Install AIR to hot-reload

```shell
curl -sSfL https://raw.githubusercontent.com/cosmtrek/air/master/install.sh | sh -s
```

file config air: `.air.toml`

#### Add environment variable

update field full_bin in config

```
full_bin = "<envirnoment-variable> sh -c ./tmp/main"
```

example:

```
full_bin = "DEBUG=true sh -c ./tmp/main"
```

#### Run

```shell
air
```

### Option 2: Golang Run

```shell
go run main
```
