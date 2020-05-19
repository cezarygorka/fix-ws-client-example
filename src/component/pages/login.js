import React, {useState, useEffect} from 'react';
import uuidv1 from 'uuid/v1';
import {Row, Col, FormGroup, Form, Button} from 'shards-react';
import {useHistory, useLocation} from 'react-router-dom';
import '../../styles/login.css';
import {WEBSOCKET_SOURCE} from "../../services/websocket-connection";
import {UserForm, AuthTypeForm, EnvironmentForm} from '../login-form';

export const AUTH_TYPE = {
  OAUTH: 'oauth',
  CREDENTIALS: 'login'
};

const AUTH_ERRORS = {
  "error.security.invalid-details": "Username or password is incorrect"
};

export default function Login({preTradeService, tradeService, authService, message, onLoginSuccessful, isLoginSuccessful, onWebsocketEnvChanged, isConnected}) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [accountId, setAccountId] = useState('');
  const [authType, setAuthType] = useState(AUTH_TYPE.OAUTH);
  const [error, setError] = useState('');
  const history = useHistory();
  const location = useLocation();

  useEffect(() => {
    const {MessageType, Source} = message;
    if (preTradeService && tradeService && MessageType && Source && accountId) {
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
          onLoginSuccessful({ Source, accountId });
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
  }, [preTradeService, tradeService, authService, message, isConnected, accountId, onLoginSuccessful]);

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
        let token;
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
                <UserForm
                  identifier={identifier}
                  password={password}
                  accountId={accountId}
                  onIdentifierChanged={(id) => setIdentifier(id)}
                  onPasswordChanged={(pass) => setPassword(pass)}
                  onAccountIdChanged={(accountId) => setAccountId(accountId)}
                />
                <AuthTypeForm
                  onAuthTypeChanged={(t) => setAuthType(t)}
                />
                <EnvironmentForm
                  onEnvChange={(env) => onWebsocketEnvChanged(env)}
                />
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
