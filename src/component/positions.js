import React from 'react';
import { ListGroup, ListGroupItem, ListGroupItemHeading } from "shards-react";
import "../styles/positions.css";

export default function Positions({ positions = [] }) {
  const getQty = (p) => p.PositionQty.find(p => p.PosType === "TotalTransactionQty");

  return (<div className="positions">
      <ListGroup>
        <ListGroupItemHeading>
          Positions
        </ListGroupItemHeading>
        {positions.length === 0 ? 
          "No open positions"
        : positions.map(p =>
          <ListGroupItem key={p.PosMaintRptID}>
            <span>{p.SecurityIdSymbol}</span>
            <span>{getQty(p).LongQty || getQty(p).ShortQty}</span>
            <span>{getQty(p).LongQty ? "Buy" : "Sell"}</span>
            <span>{p.OpenPrice}</span>
          </ListGroupItem>
        )}
      </ListGroup>
    </div>);
}
