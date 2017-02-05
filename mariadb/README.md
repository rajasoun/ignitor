
# MariaDB

MariaDB running inside Docker container using Alpine Linux with S6 Overlay init system.


## Environment variables
| Variable | Optional      | Example Value | Purpose
|----------|---------------|---------------|---------------|
| GUUID | yes | ksdf09832klsdfkjsdlk | UUID used in Daspanel system to identify a unique instance of data. If you don't provide one Daspanel generate it using [Getuuid API](https://9jzojg54n7.execute-api.us-east-1.amazonaws.com/v1/uuid)|
| MASTER_PASSWORD | yes | SomeGood#%@Passwd123 | Password to be used in the various Daspanel services. Automatically generated if you do not provide one.


## How to use
Get
```shell
make
```

Run
```shell
make run
```

## Features

* Latest Alpine Linux with S6 overlay
* MariaDB server and client

## Additional docs and credits

