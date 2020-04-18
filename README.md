## FIX API over Websocket Example Frontend Client 

### Setting Environment

In order to use OAuth, you will need an application key from [IG Labs](https://labs.ig.com/gettingstarted)

Define these variables in an `.env` file
```
# IG OAUTH 
# Remove "demo-" for prod authentication
REACT_APP_OAUTH_URL=https://demo-api.ig.com/gateway/deal/session
REACT_APP_OAUTH_REFRESH_URL=https://demo-api.ig.com/gateway/deal/session/refresh-token
REACT_APP_OAUTH_APP_KEY=[IG API KEY]

REACT_APP_OAUTH_PROVIDER_PROTOCOL=http
REACT_APP_OAUTH_PROVIDER_HOST=localhost
REACT_APP_OAUTH_PROVIDER_PORT=8686
REACT_APP_OAUTH_PROVIDER_URL=/api-vendor-sample

# IG FIX WEBSOCKET
REACT_APP_PRE_TRADE_WEBSOCKET_URL=[IG WEBSOCKET URL]  see table below for environment URLS
REACT_APP_TRADE_WEBSOCKET_URL=[IG WEBSOCKET URL]  see table below for environment URLS
REACT_APP_CLIENT_HEARTBEAT=30000

```

### Running Application
Install [NPM (Node Package Manager)](https://nodejs.org/en/)

Make sure its installed successfully:

```
npm --version
node --version
```

Install dependencies and start the app

```
npm install
npm start
```

The app should open in the browser at:

```
http://localhost:3000
```
