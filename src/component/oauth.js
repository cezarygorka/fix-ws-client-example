import React, { useState, useEffect  } from 'react';
import {useHistory, useLocation} from 'react-router-dom';
import uuidv1 from "uuid/v1";
import {WEBSOCKET_SOURCE} from "../services/websocket-connection";
import Cookie from "js-cookie"

const AUTH_ERRORS = {
   "error.security.invalid-details": "Access token has expired or is incorrect"
};

export default function OAuth({ preTradeService, tradeService, message, onEstablishSuccessful, isLoginSuccessful, accessToken = null, setAccessToken = f => f, setClientId = f => f, setError = f => f }) {
   const location = useLocation();
   const history = useHistory();
   const [accountId, setAccountId] = useState('');
   const [isLoading, setLoading] = useState(true);

   function handleNegotiate() {
      if (!isLoading) {
         try {
            setError('');
            preTradeService.sendNegotiate(uuidv1(), 'oauth', accessToken);
            tradeService.sendNegotiate(uuidv1(), 'oauth', accessToken);
         } catch ({response: {data: {errorCode}}}) {
            AUTH_ERRORS[errorCode] ? setError(AUTH_ERRORS[errorCode]) : setError(errorCode);
            console.log("Error: " + errorCode);
         }
      }
   }

   useEffect (() => {
      let query = new URLSearchParams(location.search);
      let token = query.get("access_token");
      let refreshToken = query.get("refresh_token");
      let clientId = query.get("client_id");
      Cookie.set("igOpenAMRefreshToken", refreshToken);
      setAccessToken(token);
      setClientId(clientId)
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
               service.sendEstablish(message.SessionId, +process.env.REACT_APP_CLIENT_HEARTBEAT);
               break;
            case "EstablishmentAck":
               service.startHeartbeat();
               onEstablishSuccessful({Source, accountId});
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