import React, {useState, useEffect} from 'react';
import uuidv1 from 'uuid/v1';
import {Row, Col, FormGroup, Form, FormSelect, Button} from 'shards-react';
import {useHistory, useLocation} from 'react-router-dom';
import InputField from '../ui/input-field';
import '../../styles/login.css';
import {WEBSOCKET_SOURCE} from "../../services/websocket-connection";

const AUTH_TYPE = {
  OAUTH: 'oauth',
  CREDENTIALS: 'login'
};

const ENV = {
  DEMO: 'DEMO',
  PROD: 'PROD'
};

const AUTH_ERRORS = {
  "error.security.invalid-details": "Username or password is incorrect"
};

export default function Login({preTradeService, tradeService, authService, message, onLoginSuccessful, isLoginSuccessful, onWebsocketEnvChanged, isConnected}) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [authType, setAuthType] = useState(AUTH_TYPE.OAUTH);
  const [error, setError] = useState('');
  const history = useHistory();
  const location = useLocation();

  useEffect(() => {
    const {MessageType, Source} = message;
    if (preTradeService && tradeService && MessageType && Source) {
      let service;
      if (Source === WEBSOCKET_SOURCE.PRE_TRADE) {
        service = preTradeService;
      } else if (Source === WEBSOCKET_SOURCE.TRADE) {
        service = tradeService;
      }

      switch (MessageType) {
        case "NegotiationResponse":
          service.sendEstablish(message.SessionId, +process.env.REACT_APP_CLIENT_HEARTBEAT);
          break;
        case "EstablishmentAck":
          service.startHeartbeat();
          onLoginSuccessful(Source);
          break;
        case "NegotiationReject":
          setError("Username or password is incorrect");
          break;
        default:
      }
    } else if (!isConnected) {
      if (authService) {
        authService.stopTokenRefresh();
      }
    }
  }, [preTradeService, tradeService, authService, message, isConnected, onLoginSuccessful]);

  useEffect(() => {
    if (isLoginSuccessful) {
      const {from} = location.state || {from: {pathname: "/trade"}};
      history.replace(from);
    }
  }, [isLoginSuccessful, history, location]);

  async function handleNegotiate() {
    if (preTradeService) {
      try {
        setError('');
        let token = null;
        if (authType === AUTH_TYPE.CREDENTIALS) {
          token = `${identifier}:${password}`;
        } else {
          token = await authService.getOAuthToken(identifier, password);
        }
        preTradeService.sendNegotiate(uuidv1(), authType, token);
        tradeService.sendNegotiate(uuidv1(), authType, token);
      } catch ({response: {data: {errorCode}}}) {
        AUTH_ERRORS[errorCode] ? setError(AUTH_ERRORS[errorCode]) : setError(errorCode);
      }
    }
  }

  return (
    <div className="login-container">
      <Row>
        <Col></Col>
        <Col>
          <div>
            <h3>Login</h3>
            <Form>
              <FormGroup>
                <InputField autoComplete="on" value={identifier} labelName={"Username"} id="username" type="text"
                            onChange={(e) => setIdentifier(e.target.value)} onInput={(e) => setIdentifier(e.target.value)}/>
                <InputField autoComplete="on" value={password} labelName={"Password"} id="password" type="password"
                            onChange={(e) => setPassword(e.target.value)} onInput={(e) => setPassword(e.target.value)}/>

                <label htmlFor="auth-type">Auth Type: </label>
                <FormSelect id="auth-type" onChange={(e) => setAuthType(e.target.value)}>
                  <option value={AUTH_TYPE.OAUTH}>OAuth</option>
                  <option value={AUTH_TYPE.CREDENTIALS}>Credentials</option>
                </FormSelect>
                <label htmlFor="env-type">Environment: </label>
                {process.env.REACT_APP_PRE_TRADE_WEBSOCKET_URL && process.env.REACT_APP_TRADE_WEBSOCKET_URL ? <div>Custom</div> :
                  <FormSelect id="env-type" onChange={(e) => onWebsocketEnvChanged(e.target.value)}>
                    <option value={ENV.DEMO}>Demo</option>
                    <option value={ENV.PROD}>Production</option>
                  </FormSelect>
                }
                <Button className="login-button" theme="secondary" onClick={handleNegotiate}>Login</Button>
              </FormGroup>
            </Form>
          </div>
          {error && <div>{error}</div>}
        </Col>
        <Col></Col>
      </Row>
    </div>
  )
}
