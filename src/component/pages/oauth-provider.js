import React, {useEffect, useState} from 'react';
import {Button, Col, Form, FormGroup, Row} from 'shards-react';
import Cookie from "js-cookie"
import axios from "axios";
import '../../styles/login.css';
import {useHistory, useLocation} from "react-router-dom";

const { REACT_APP_OAUTH_PROVIDER_PROTOCOL, REACT_APP_OAUTH_PROVIDER_HOST, REACT_APP_OAUTH_PROVIDER_PORT, REACT_APP_OAUTH_PROVIDER_URL } = process.env;

export default function OAuthProvider({setAccessToken = f => f, error, setError = f => f}) {
   const location = useLocation();
   const history = useHistory();

   const protocol = REACT_APP_OAUTH_PROVIDER_PROTOCOL || "http";
   const host = REACT_APP_OAUTH_PROVIDER_HOST || window.location.hostname;
   const port = REACT_APP_OAUTH_PROVIDER_PORT || 8686;
   const url = REACT_APP_OAUTH_PROVIDER_URL || "/api-vendor-sample";

   const [isTokenLoaded, setTokenLoaded] = useState(false);

   async function getOAuthTokens(refreshToken) {
      const response = await axios.get(`${protocol}://${host}:${port}${url}/refresh-token?refresh_token=${refreshToken}`);
      return response.data;
   }

   function redirectToOpenAM() {
      window.location.assign(`${protocol}://${host}:${port}${url}/oauth-provider?redirect_uri=http://${window.location.hostname}:${window.location.port}/oauth`);
   }

   const handleIGLogin = () => {
      const token =  Cookie.get("igOpenAMRefreshToken") ? Cookie.get("igOpenAMRefreshToken") : null;

      if (token != null) {
         getOAuthTokens(token)
                 .then(res => {
                    let { access_token, refresh_token } = res;
                    setAccessToken(access_token);
                    Cookie.set("igOpenAMRefreshToken", refresh_token);
                    setTokenLoaded(true);
                 })
                 .catch(error => {
                    setError(error);
                    console.log(error);
                    redirectToOpenAM();
                 });
      } else {
         redirectToOpenAM();
      }
   };

   const cleanCookie = () => {
      Cookie.remove("igOpenAMRefreshToken");
   };

   useEffect(() => {
      if (isTokenLoaded) {
         history.push({
            pathname: '/oauth',
            state: { from: location }
         });
      }
   }, [isTokenLoaded]);

   return (
     <div className="login-container">
       <Row>
         <Col></Col>
         <Col>
           <Row>
             <Col>
               <Button className="login-button" variant="contained" color="primary" onClick={handleIGLogin}>Login with IG</Button>
             </Col>
             <Col>
               <Button className="login-button" variant="contained" theme="secondary" onClick={cleanCookie}>Clean IG session</Button>
             </Col>
           </Row>
           {error && <div>{error}</div>}
         </Col>
         <Col></Col>
       </Row>
     </div>
   );
}