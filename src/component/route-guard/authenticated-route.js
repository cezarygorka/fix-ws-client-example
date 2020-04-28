import React from 'react';
import { Route, Redirect } from 'react-router-dom';

export default function AuthenticatedRoute({ children, condition, ...rest }) {
  return (
    <Route
      {...rest}
      render={({ location }) =>
        condition ? (
          children
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
