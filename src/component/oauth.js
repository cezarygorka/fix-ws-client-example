import React, { useState, useEffect  } from 'react';
import {useHistory, useLocation} from 'react-router-dom';
import axios from 'axios'
import uuidv1 from "uuid/v1";
import {WEBSOCKET_SOURCE} from "../services/websocket-connection";
import Cookie from "js-cookie"

const AUTH_ERRORS = {
   "error.security.invalid-details": "Access token has expired or is incorrect"
};

const { REACT_APP_OAUTH_PROVIDER_URL, REACT_APP_CLIENT_ID, REACT_APP_CLIENT_SECRET, REACT_APP_CLIENT_HEARTBEAT, REACT_APP_CLIENT_STATE } = process.env;

export default function OAuth({ preTradeService, tradeService, message, onEstablishSuccessful, isLoginSuccessful, accessToken = null, setAccessToken = f => f, setClientId = f => f, setError = f => f }) {
   const location = useLocation();
   const history = useHistory();
   const [isLoading, setLoading] = useState(true);

   async function getOAuthTokens(code) {
      const credentials  = REACT_APP_CLIENT_ID + ':' + REACT_APP_CLIENT_SECRET;
      const authorizationHeader = "Basic " + new Buffer(credentials).toString("base64");
      const client = axios.create({ headers: { "Authorization": authorizationHeader, "Content-Type": "application/x-www-form-urlencoded" } });
      const redirectUri = `http://${window.location.hostname}:${window.location.port}/oauth`;

      const data = [
         `grant_type=authorization_code`,
         `code=${code}`,
         `realm=external`,
         `redirect_uri=${redirectUri}`
      ].join("&");

      const response = await client.post(REACT_APP_OAUTH_PROVIDER_URL + "/access_token", data);
      const { access_token, refresh_token } = response.data;

      Cookie.set("igOpenAMRefreshToken", refresh_token);
      return { access_token, refresh_token };
   }

   async function getUserInfo({ access_token, refresh_token }) {
      const authorizationHeader = "Basic " + access_token;
      const client = axios.create({ headers: { "Authorization":  authorizationHeader} });
      const response = await client.get(REACT_APP_OAUTH_PROVIDER_URL + "/userinfo");
      const { sub } = response.data;
      return { access_token, refresh_token, sub };
   }

   function handleNegotiate() {
      if (!isLoading) {
         try {
            setError('');
            let uuid = uuidv1();
            preTradeService.sendNegotiate(uuid, 'oauth', accessToken);
            tradeService.sendNegotiate(uuid, 'oauth', accessToken);
         } catch ({response: {data: {errorCode}}}) {
            AUTH_ERRORS[errorCode] ? setError(AUTH_ERRORS[errorCode]) : setError(errorCode);
            console.log("Error: " + errorCode);
         }
      }
   }

   useEffect (() => {
      let query = new URLSearchParams(location.search);
      let code = query.get("code");
      let state = query.get("state");
      if (code && !accessToken) {
         if (state && state != REACT_APP_CLIENT_STATE) {
            console.log(`Request parameter state=${state} does not match expected state`);
         }
         getOAuthTokens(code)
           .then(res => getUserInfo(res))
           .then(res => {
             const { access_token, sub } = res;
             setAccessToken(access_token);
             setClientId(sub);
             return res;
           })
           .catch(console.error);
      }
   }, []);

   useEffect(() => {
      if (accessToken && preTradeService && tradeService) {
         setLoading(false);
      }
   }, [preTradeService, tradeService, accessToken]);

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
               service.sendEstablish(message.SessionId, REACT_APP_CLIENT_HEARTBEAT);
               break;
            case "EstablishmentAck":
               service.startHeartbeat();
               onEstablishSuccessful(Source);
               break;
            case "NegotiationReject":
               setError("Token is invalid");
               break;
            default:
         }
      }
   }, [message]);

   useEffect(() => {
      if (!isLoading && !isLoginSuccessful) {
         handleNegotiate();
      }
   });

   useEffect(() => {
      if (isLoginSuccessful) {
         const {from} = location.state || {from: {pathname: "/trade"}};
         history.replace(from);
      }
   }, [isLoginSuccessful, history, location]);


   return (
     <div>
        {"Establishing WebSocket connection with IG..."}
     </div>
   );
}