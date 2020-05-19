import React, {useEffect, useState} from 'react';
import { format } from 'date-fns';
import { ListGroup, ListGroupItem, Button, ListGroupItemHeading } from "shards-react";
import '../styles/working-orders.css';

const EDIT_STATE = { EDITED: "Edited", EDIT: "Edit" };

export function WorkingOrders({ orders = [], replacedOrder, onCancelOrder, onOrderCancelReplace }) {
  const [ displayOrders, setDisplayOrders ] = useState([]);
  const [ editedOrderIndex, setEditedOrderIndex ] = useState(-1);

  useEffect(() => {
    setDisplayOrders(orders.map(o => {
      o.editState = EDIT_STATE.EDIT;
      o.disabled = false;
      return o;
    }));
  }, [orders]);

  useEffect(() => {
    setEditedOrderIndex(displayOrders.findIndex(o => o.editState === EDIT_STATE.EDITED));
  }, [displayOrders]);

  useEffect(() => {
    if (editedOrderIndex > -1) {
      let timeout = setTimeout(() => {
        setDisplayOrders(o => {
          o[editedOrderIndex].editState = EDIT_STATE.EDIT;
          o[editedOrderIndex].disabled = false;
          return [ ...o ];
        });
        clearTimeout(timeout);
      }, 3000);
    }
  }, [editedOrderIndex]);

  useEffect(() => {
    if (replacedOrder) {
      setDisplayOrders(d => {
        const foundOrderIndex = d.findIndex(o => o.OrderID === replacedOrder.OrderID);
        if (foundOrderIndex > -1) {
          const order = d[foundOrderIndex];
          console.log('order at ', foundOrderIndex, 'which is ', order);
          order.editState = EDIT_STATE.EDITED;
          order.disabled = true;
          return [ ...d ];
        }
      });
    }
  }, [replacedOrder]);

  const editOrderLevel = (orderIndex, newLevel) => {
    const order = displayOrders[orderIndex];
    if (order.StopPx) {
      order.StopPx = newLevel;
    } else {
      order.Price =  newLevel;
    }
    setDisplayOrders([ ...displayOrders ]);
  };

  return (
    <div className="working-orders">
      <ListGroup>
        <ListGroupItemHeading>
          Working Orders
        </ListGroupItemHeading>
        {displayOrders.length === 0 ? 
          "No orders placed."
          : <OrderList displayOrders={displayOrders}
            onOrderCancelReplace={(o) => onOrderCancelReplace(o)}
            onCancelOrder={(o) => onCancelOrder(o)}
            onEditOrderLevel={(o) => editOrderLevel(o.index, o.level)}
          />
        }
      </ListGroup>
    </div>
  );
}

export function OrderList({ displayOrders = [], onOrderCancelReplace, onCancelOrder, onEditOrderLevel }) {
  return (
    displayOrders.map((o, index) =>
          <ListGroupItem key={o.OrderID}>
            <span>{o.SecurityIdSymbol}</span>
            <span>
              {o.OrderQty}
            </span>
            <span>
              {o.Side}
            </span>
            <span>{o.OrdType} at</span>
            <span>
              <input value={o.Price || o.StopPx}
                onChange={(e) => onEditOrderLevel({index, level: e.target.value})}
                onInput={(e) => onEditOrderLevel({index, level: e.target.value})}/>
            </span>
            <span>
              <Button outline size="sm" theme="secondary"
                disabled={o.disabled}
                onClick={() => onOrderCancelReplace(o)}>{o.editState}</Button>
            </span>
            {o.ExpireTime && <span>{format(new Date(o.ExpireTime), "yyyy-MM-dd HH:mm")}</span>}
            <span><Button outline size="sm" theme="secondary" onClick={() => onCancelOrder(o)}>Cancel</Button></span>
          </ListGroupItem>
    )
  );
}
