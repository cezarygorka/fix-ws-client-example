import React from 'react';
import { Route, Redirect } from 'react-router-dom';

export default function RedirectRoute({ children, condition, ...rest }) {
  return (
    <Route
      {...rest}
      render={({ location }) =>
        condition ? (
          <Redirect
            to={{
              pathname: "/trade",
              state: { from: location }
            }}
          />
        ) : (
          <Redirect
            to={{
              pathname: "/login",
              state: { from: location }
            }}
          />
        )
      }
    />
  );
}
