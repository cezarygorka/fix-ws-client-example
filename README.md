## FIX API over Websocket Example Frontend Client 

### Setting Environment

Define these variables in an `.env` file
```
# IG OAUTH 
REACT_APP_OAUTH_PROVIDER_URL=[OPENAM URL] see table below for environment URLS
REACT_APP_CLIENT_ID=[CLIENT ID] client configured in OpenAM
REACT_APP_CLIENT_SECRET=[CLIENT SECRET] secret configured for OpenAM client
REACT_APP_CLIENT_STATE=[STATE] optional string

# IG FIX WEBSOCKET
REACT_APP_PRE_TRADE_WEBSOCKET_URL=[IG WEBSOCKET URL]  see table below for environment URLS
REACT_APP_TRADE_WEBSOCKET_URL=[IG WEBSOCKET URL]  see table below for environment URLS
REACT_APP_CLIENT_HEARTBEAT=30000

# If you correctly set up OpenAM connection below configuration is not needed
# Remove "demo-" for prod authentication
# In order to use OAuth, you will need an application key from [IG Labs](https://labs.ig.com/gettingstarted)
REACT_APP_OAUTH_URL=https://demo-api.ig.com/gateway/deal/session
REACT_APP_OAUTH_REFRESH_URL=https://demo-api.ig.com/gateway/deal/session/refresh-token
REACT_APP_OAUTH_APP_KEY=[IG API KEY]
```

##### Websocket URLs

| ENV | Application | URL  |
| ----|:----:| ---:|
| TEST | Pretrade | wss://net-otapr.ig.com/pretrade |
| TEST | Trade | wss://net-otapr.ig.com/trade |
| UAT | OpenAM | https://oam.uat.iggroup.local/openam/oauth2 |
| UAT | Pretrade | wss://router-ext-core.uat.iggroup.local/igus-ws-pre-trade/pretrade |
| UAT | Trade | wss://router-ext-core.uat.iggroup.local/igus-ws-trade/trade |

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