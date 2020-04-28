import React from 'react';
import { format } from 'date-fns';
import { ListGroup, ListGroupItem, Button, ListGroupItemHeading } from "shards-react";
import '../styles/working-orders.css';

export default function WorkingOrders({ orders = [], onCancelOrder }) {

  return (
    <div className="working-orders">
      <ListGroup>
        <ListGroupItemHeading>
          Working Orders
        </ListGroupItemHeading>
        {orders.length === 0 ? 
          "No orders placed."
        : orders.map(o =>
          <ListGroupItem key={o.OrderID}>
            <span>{o.SecurityIdSymbol}</span>
            <span>{o.OrderQty}</span>
            <span>{o.OrdType} at {o.Price}</span>
            <span>{format(new Date(o.ExpireTime), "yyyy-MM-dd HH:mm")}</span>
            <span><Button outline size="sm" theme="secondary" onClick={() => onCancelOrder(o)}>Cancel</Button></span>
          </ListGroupItem>
        )}
      </ListGroup>
    </div>
  );
}
