# knoxite-gui-client

Some tryouts with wails to create a knoxite gui client.

## Quick Setup Guide

### Prerequisites

- nodejs v18.15.0 / npm v9.5.0
- go 1.18

### Setup

1. Install npm globally, or use nvm (Node Version Manager) to install the specified version. (here shown, how installation works using nvm)


```
cd frontend
nvm install $(cat .nvmrc)
nvm use $(cat .nvmrc)
cd ..
```

2. Back in the Project root, execute the following:

```
go install github.com/wailsapp/wails/v2/cmd/wails@latest // insalling wails cli
wails dev // starting the application (will execute go mod tidy and npm install)
```

## Screens

![already configured](./docs/already_configures_repos.png)

![volumes](./docs/volumes.png)

![snapshots](./docs/snapshots.png)

![files](./docs/files.png)
