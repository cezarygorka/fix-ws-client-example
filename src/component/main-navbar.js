import React from 'react';
import { Nav, Navbar, NavbarBrand, NavItem, NavLink } from 'shards-react';
import { Link } from 'react-router-dom';

export default function MainNav({ isLoginSuccessful, tradeAttempts, preTradeAttempts, isConnected }) {
  return (
    <Navbar type="dark" theme="danger" expand="md">
      <NavbarBrand href="#">Example Client</NavbarBrand>
      <Nav navbar>
        {isLoginSuccessful ? (
          <NavItem>
            <Link className="nav-link active" to="/login">Login</Link>
          </NavItem>) : (
            <div style={{'display': 'inherit'}}>
              <NavItem>
                <Link className="nav-link active" to="/trade">Trade</Link>
              </NavItem>
            </div>
          )}
      </Nav>
      <Nav navbar className="ml-auto">
        <NavItem>
          {tradeAttempts > 0 || preTradeAttempts > 0 ?
            <NavLink active>
              {tradeAttempts === 3 || preTradeAttempts === 3 ? "Please try again later." : "Failed to connect, retrying..."}
            </NavLink> :
              <NavLink active>
                Status: {isConnected ?  'Connected': 'Closed'}
              </NavLink>
          }
        </NavItem>
      </Nav>
    </Navbar>
  )
}
