# Signet Pro Doctor Manager Api

## Environment variable

| Environment                 | Default                   | Separator |
|-----------------------------|---------------------------|-----------|
| TOKEN_PUBLIC_KEY_PATH       | certs/public.pem          |           |
| TOKEN_PRIVATE_KEY_PATH      | certs/private.pem         |           |
| PORT                        | 8216                      |           |
| HOST                        | 0.0.0.0                   |           |
| TOKEN_TYPE                  | Bearer                    |           |
| MONGODB_DOCTOR_MANAGER_URI  | mongodb://localhost:27017 |           |
| MONGODB_DOCTOR_MANAGER_NAME | db_doctor_manager         |           |
| PAGINATION_MAX_ITEM         | 50                        |           |
| MONGODB_REQUEST_TIMEOUT     | 3m                        |           |
| ACCESS_TOKEN_TIMEOUT        | 10m                       |           |
| REFRESH_TOKEN_TIMEOUT       | 24h                       |           |
| DEBUG                       | false                     |           |
| ELASTIC_APM_ENABLE          | false                     |           |
| MONGO_AUTO_INDEXING         | false                     |           |
| JOB_CONCURRENCY             | 10                        |           |

### Elastic APM

| Environment                 | Example                   |
|-----------------------------|---------------------------|
| ELASTIC_APM_CAPTURE_BODY    | all                       |
| ELASTIC_APM_ENVIRONMENT     | development               |
| ELASTIC_APM_SERVICE_VERSION | 1.0.0                     |
| ELASTIC_APM_SERVICE_NAME    | sigpro-doctor-manager-api |
| ELASTIC_APM_SECRET_TOKEN    | xxxxxx                    |
| ELASTIC_APM_SERVER_URL      | http://localhost:8200     |

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
