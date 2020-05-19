import React, { useState, useEffect } from 'react';
import { Container } from 'shards-react';
import { BrowserRouter as Router, Switch, Route} from 'react-router-dom';
import WebsocketConnection, {WEBSOCKET_SOURCE} from './services/websocket-connection';
import OAuthService from './services/auth-service';
import Login from './component/pages/login';
import Trade from './component/pages/trade';
import OAuthProvider from './component/pages/oauth-provider';
import OAuth from './component/oauth';
import Websocket from './services/websocket';
import AuthenticatedRoute from './component/route-guard/authenticated-route';
import RedirectRoute from './component/route-guard/redirect-route';
import PositionService from './services/position-service';
import MainNav from './component/main-navbar';

import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'shards-ui/dist/css/shards.min.css';

const { REACT_APP_TRADE_WEBSOCKET_URL, REACT_APP_PRE_TRADE_WEBSOCKET_URL  } = process.env;

const ENV_URL = {
  DEMO: {
    PRE_TRADE: 'wss://demo-iguspretrade.ig.com/pretrade',
    TRADE: 'wss://demo-igustrade.ig.com/trade'
  },
  PROD: {
    PRE_TRADE: 'wss://iguspretrade.ig.com/pretrade',
    TRADE: 'wss://igustrade.ig.com/trade'
  }
};

export default function App() {
  const [ isPreTradeConnected, setIsPreTradeConnected ] = useState(false);
  const [ isTradeConnected, setIsTradeConnected ] = useState(false);

  const [ preTradeAttempts, setPreTradeAttempts ] = useState(0);
  const [ tradeAttempts, setTradeAttempts ] = useState(0);

  const [ authState, setAuthState ] = useState({
    preTrade: { isEstablish: false, isLoginSuccessful: false },
    trade: { isEstablish: false, isLoginSuccessful: false }
  });
  const isEstablish = authState.preTrade.isEstablish && authState.trade.isEstablish;
  const isLoginSuccessful = authState.preTrade.isLoginSuccessful && authState.trade.isLoginSuccessful;

  const [ authService, setAuthService ] = useState(null);
  const [ preTradeService, setPreTradeService ] = useState(null);
  const [ positionService, setPositionService ] = useState();
  const [ tradeService, setTradeService ] = useState(null);

  const [ loginMessage, setLoginMessage ] = useState({});
  const [ tradeMessage, setTradeMessage ] = useState({});
  const [ preTradeMessages, setPreTradeMessage ] = useState({
    Quote: null,
    HistoricCandleResponse: { CandleData: [] },
    ChartDataSubscriptionResponse: {},
    SecurityList: { SecListGrp: [] }
  });
  const [ accessToken, setAccessToken ] = useState('');
  const [ clientId, setClientId ] = useState(0);
  const [ error, setError ] = useState('');

  const [ preTradeUrl, setPreTradeUrl ] = useState(REACT_APP_PRE_TRADE_WEBSOCKET_URL || ENV_URL.DEMO.PRE_TRADE);
  const [ tradeUrl, setTradeUrl ] = useState(REACT_APP_TRADE_WEBSOCKET_URL || ENV_URL.DEMO.TRADE);
  const [ account, setAccount ] = useState("");
  const websocketNormalClose = 1000;

  useEffect(() => {
    setAuthService(new OAuthService());
    setPreTradeService(new WebsocketConnection(REACT_APP_PRE_TRADE_WEBSOCKET_URL || ENV_URL.DEMO.PRE_TRADE));
    setTradeService(new WebsocketConnection(REACT_APP_TRADE_WEBSOCKET_URL || ENV_URL.DEMO.TRADE));
  }, []);

  useEffect(() => {
    !positionService && tradeService && setPositionService(new PositionService(tradeService));
  }, [positionService, tradeService]);

  useEffect(() => {
    if (positionService && isLoginSuccessful) {
      // TODO: Fix getting accountId
      // const account = "";
      // setAccount(account);
      account && positionService.getPositions({ account });
    }
  }, [isLoginSuccessful, positionService, account]);

  function resetPreTradeState(e) {
    if (e !== websocketNormalClose) {
      setPreTradeAttempts(preTradeAttempts + 1);
  
      if (preTradeAttempts + 1 !== 3) {
        resetState(preTradeService, setPreTradeService, preTradeUrl);
        setAuthState({ ...authState, preTrade: { isLoginSuccessful: false, isEstablish: false } });
        resetMessages();
      }
    }
  }

  function resetTradeState(e) {
    if (e !== websocketNormalClose) {
      setTradeAttempts(tradeAttempts + 1);

      if (tradeAttempts + 1 !== 3) {
        resetState(tradeService, setTradeService, tradeUrl);
        setAuthState({ ...authState, trade: { isLoginSuccessful: false, isEstablish: false } });
        setTradeMessage({});
      }
    }
  }

  function resetState(service, serviceSetter, websocketUrl) {
    if (service) {
      service.stopHeartbeat();
    }
    const timer = setTimeout(() => {
      serviceSetter(new WebsocketConnection(websocketUrl));
      clearTimeout(timer);
    }, 5000);
  }

  function resetMessages() {
    setPreTradeMessage({
      Quote: null,
      HistoricCandleResponse: { CandleData: [] },
      ChartDataSubscriptionResponse: {},
      SecurityList: { SecListGrp: [] }
    });
  }

  function handleLoginSuccessful(serviceType) {
    setLoginMessage({});
    if (serviceType.Source === WEBSOCKET_SOURCE.PRE_TRADE) {
      setAuthState({ ...authState, preTrade: { isEstablish: true, isLoginSuccessful: true } });
    } else if (serviceType.Source === WEBSOCKET_SOURCE.TRADE) {
      setAuthState({ ...authState, trade: { isEstablish: true, isLoginSuccessful: true } });
    }

    if (!account) {
      setAccount(serviceType.accountId);
    }
  }

  function setMessageSource(message, source) {
    message.Source = source;
  }

  function setWebsocketUrl(env) {
    setPreTradeUrl(ENV_URL[env].PRE_TRADE);
    setTradeUrl(ENV_URL[env].TRADE);
    preTradeService.stopHeartbeat();
    tradeService.stopHeartbeat();
    preTradeService.close(websocketNormalClose);
    tradeService.close(websocketNormalClose);
    setPreTradeService(new WebsocketConnection(ENV_URL[env].PRE_TRADE));
    setTradeService(new WebsocketConnection(ENV_URL[env].TRADE));
  }

  function handlePreTradeMessages(message) {
    const { MessageType, MsgType } = message;
    if (MessageType) {
      if (MessageType === "NegotiationResponse" || MessageType === "EstablishmentAck" || MessageType === "NegotiationReject") {
        setMessageSource(message, WEBSOCKET_SOURCE.PRE_TRADE);
        setLoginMessage(message);
      }
    } else if (MsgType) {
      const newTradeMessages = {};
      newTradeMessages[MsgType] = message;
      setPreTradeMessage({ ...preTradeMessages, ...newTradeMessages });
    }
  }

  function handleTradeMessages(message) {
    const { MessageType, MsgType } = message;
    if (MessageType) {
      if (MessageType === "NegotiationResponse" || MessageType === "EstablishmentAck") {
        setMessageSource(message, WEBSOCKET_SOURCE.TRADE);
        setLoginMessage(message);
      }
    } else if (MsgType) {
      setTradeMessage(message);
    }
  }

  return (
    <div className="App">
      <Websocket
        onMessage={handlePreTradeMessages}
        onOpen={() => {setPreTradeAttempts(0); setIsPreTradeConnected(true)}}
        onError={() => resetMessages()}
        onClose={(e) => resetPreTradeState(e)}
        service={preTradeService}
      />
      <Websocket
          onMessage={handleTradeMessages}
          onOpen={() => {setTradeAttempts(0); setIsTradeConnected(true)}}
          onError={() => setTradeMessage({})}
          onClose={(e) => resetTradeState(e)}
          service={tradeService}
      />
      <Router>
        <div className="App">
          <MainNav
            isLoginSuccessful={isLoginSuccessful}
            isConnected={isPreTradeConnected && isTradeConnected}
            tradeAttempts={tradeAttempts}
            preTradeAttempts={preTradeAttempts}
          />
        </div>
        <Container>
          <div className="router-view">
            <Switch>
              <RedirectRoute condition={isEstablish} path="/" exact />
              <Route path={"/oauth"}>
                <OAuth
                  preTradeService={preTradeService}
                  tradeService={tradeService}
                  message={loginMessage}
                  isLoginSuccessful={isLoginSuccessful}
                  onEstablishSuccessful={handleLoginSuccessful}
                  accessToken={accessToken}
                  setAccessToken={setAccessToken}
                  setClientId={setClientId}
                  setError={setError}
                />
              </Route>
              <Route path="/login">
                <Login
                  preTradeService={preTradeService}
                  tradeService={tradeService}
                  authService={authService}
                  message={loginMessage}
                  isConnected={isPreTradeConnected && isTradeConnected}
                  onWebsocketEnvChanged={(env) => setWebsocketUrl(env)}
                  isLoginSuccessful={isLoginSuccessful}
                  onLoginSuccessful={handleLoginSuccessful}
                />
                <OAuthProvider
                  setAccessToken={setAccessToken}
                  error={error}
                  setError={setError}
                />
              </Route>
              <AuthenticatedRoute condition={isEstablish} path="/trade">
                <Trade
                  isEstablish={isEstablish}
                  quoteMessage={preTradeMessages.Quote}
                  tradeMessage={tradeMessage}
                  preTradeService={preTradeService}
                  tradeService={tradeService}
                  candleData={preTradeMessages.HistoricCandleResponse.CandleData}
                  candleSubscriptionData={preTradeMessages.ChartDataSubscriptionResponse}
                  securityList={preTradeMessages.SecurityList.SecListGrp}
                  account={account}
                />
              </AuthenticatedRoute>
            </Switch>
          </div>
        </Container>
      </Router>
    </div>
  );
}

