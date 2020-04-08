import React, {useEffect, useState} from 'react';
import {Button, Col, Form, FormGroup, Row} from 'shards-react';
import Cookie from "js-cookie"
import axios from "axios";
import '../../styles/login.css';
import {useHistory, useLocation} from "react-router-dom";

const { REACT_APP_OPENAM_OAUTH_URL, REACT_APP_OPENAM_CLIENT_ID, REACT_APP_OPENAM_CLIENT_SECRET, REACT_APP_OPENAM_CLIENT_STATE } = process.env;

export default function OpenAM({setAccessToken = f => f, error, setError = f => f}) {
   const location = useLocation();
   const history = useHistory();
   const [isTokenLoaded, setTokenLoaded] = useState(false);

   async function getOAuthTokens(refreshToken) {
      const credentials  = REACT_APP_OPENAM_CLIENT_ID + ':' + REACT_APP_OPENAM_CLIENT_SECRET;
      const authorizationHeader = "Basic " + new Buffer(credentials).toString("base64");
      const client = axios.create({ headers: { "Authorization": authorizationHeader, "Content-Type": "application/x-www-form-urlencoded" } });

      const data = [
         `grant_type=refresh_token`,
         `refresh_token=${refreshToken}`,
         `realm=external`
      ].join("&");

      const response = await client.post(REACT_APP_OPENAM_OAUTH_URL + "/access_token", data);
      const { access_token, refresh_token } = response.data;

      Cookie.set("igOpenAMRefreshToken", refresh_token);
      return { access_token, refresh_token };
   }

   function redirectToOpenAM() {
      const state = REACT_APP_OPENAM_CLIENT_STATE || 'af0ifjsldkj';
      const qParams = [
         `response_type=code`,
         `client_id=${REACT_APP_OPENAM_CLIENT_ID}`,
         `redirect_uri=http://${window.location.hostname}:${window.location.port}/oauth`,
         `scope=full_readonly`,
         `realm=external`,
         `state=${state}`
      ].join("&");

      window.location.assign(`${REACT_APP_OPENAM_OAUTH_URL}/authorize?${qParams}`);
   }

   const handleIGLogin = () => {
      const token =  Cookie.get("igOpenAMRefreshToken") ? Cookie.get("igOpenAMRefreshToken") : null;

      if (token != null) {
        getOAuthTokens(token)
          .then(res => {
             let {access_token} = res;
             setAccessToken(access_token);
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
              <div>
                 <Form>
                    <FormGroup>
                       <Button className="login-button" variant="contained" color="primary" onClick={handleIGLogin}>Login with IG</Button>
                       <Button className="login-button" variant="contained" theme="secondary" style={{marginLeft: "5%" }} onClick={cleanCookie}>Clean IG session</Button>
                    </FormGroup>
                 </Form>
              </div>
              {error && <div>{error}</div>}
           </Col>
           <Col></Col>
        </Row>
     </div>

   );
}