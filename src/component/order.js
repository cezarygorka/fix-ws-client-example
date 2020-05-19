import React, {useState, useEffect} from "react";
import {Button} from "shards-react";
import InputField from "./ui/input-field";
import SelectField from "./ui/select-field";
import DatePicker from "react-datepicker";
import { DATETIME_FORMAT } from "../services/websocket-connection";
import { format } from 'date-fns';
import "../styles/order.css";

const ORDER_TYPES = {
  MARKET: "Market",
  PREVIOUSLY_QUOTED: "PreviouslyQuoted",
  LIMIT: "Limit",
  STOP: "Stop",
};

const TIME_IN_FORCE = {
  FILL_OR_KILL: "FillOrKill",
  GOOD_TILL_CANCEL: "GoodTillCancel",
  GOOD_TILL_DATE: "GoodTillDate",
  IMMEDIATE_OR_CANCEL: "ImmediateOrCancel",
};

export default function Order({orderService, priceLevel, side, securityId, errorMessage, orderId, orderStatus, rejectReason, account, currency }) {
  const [price, setPrice] = useState("");
  const [orderQty, setOrderQty] = useState("1");
  const [orderType, setOrderType] = useState(ORDER_TYPES.MARKET);
  const [timeInForce, setTimeInForce] = useState(TIME_IN_FORCE.FILL_OR_KILL);
  const [displayDate, setDisplayDate] = useState(new Date());
  const [expiry, setExpiry] = useState(format(new Date(), DATETIME_FORMAT));

  const [lastOrderedId, setLastOrderedId] = useState();
  const [ currentOrderStatus, setCurrentOrderStatus ] = useState();
  const [ confirmTimer, setConfirmTimer ] = useState();

  const [allOrderTypes] = useState([
    {name: ORDER_TYPES.MARKET, value: ORDER_TYPES.MARKET},
    {name: "Previously Quoted", value: ORDER_TYPES.PREVIOUSLY_QUOTED},
    {name: ORDER_TYPES.LIMIT, value: ORDER_TYPES.LIMIT},
    {name: ORDER_TYPES.STOP, value: ORDER_TYPES.STOP}
  ]);

  const [orderTypes, setOrderTypes ] = useState(allOrderTypes);
  const [timeInForces] = useState([
    {name: "Fill or Kill", value: TIME_IN_FORCE.FILL_OR_KILL},
    {name: "Good Till Cancel", value:TIME_IN_FORCE.GOOD_TILL_CANCEL},
    {name: "Good Till Date", value: TIME_IN_FORCE.GOOD_TILL_DATE},
    {name: "Immediate or Cancel", value: TIME_IN_FORCE.IMMEDIATE_OR_CANCEL},
  ]);

  useEffect(() => {
    setPrice(priceLevel);
  }, [priceLevel]);

  useEffect(() => {
    if (lastOrderedId === orderId && !confirmTimer && (orderStatus === "New" || orderStatus === "Rejected")) {
      setCurrentOrderStatus(orderStatus);

      let timeout = setTimeout(() => {
        setCurrentOrderStatus(null);
        setLastOrderedId(null);
        setConfirmTimer(null);
      }, 4000);
      setConfirmTimer(timeout);
    }

    return () => {
      if (confirmTimer) {
        clearTimeout(confirmTimer);
        setConfirmTimer(null);
      }
    }
  }, [orderStatus, orderId, lastOrderedId, confirmTimer]);

  useEffect(() => {
    if (lastOrderedId === orderId && rejectReason && !confirmTimer) {
      setCurrentOrderStatus("Rejected");
      let timeout = setTimeout(() => {
        setCurrentOrderStatus(null);
        setLastOrderedId(null);
        setConfirmTimer(null);
        clearTimeout(timeout);
      }, 4000);
      setConfirmTimer(timeout);
    }

    return () => {
      if (confirmTimer) {
        clearTimeout(confirmTimer);
        setConfirmTimer(null);
      }
    }
  }, [rejectReason, lastOrderedId, orderId, confirmTimer]);

  useEffect(() => {
    if (timeInForce === TIME_IN_FORCE.FILL_OR_KILL) {
      setOrderTypes(allOrderTypes.filter(o => o.value !== ORDER_TYPES.STOP));
      setOrderType(ORDER_TYPES.MARKET);
    } else if (timeInForce === TIME_IN_FORCE.GOOD_TILL_DATE || timeInForce === TIME_IN_FORCE.GOOD_TILL_CANCEL ) {
      setOrderTypes(allOrderTypes.filter(o => o.value !== ORDER_TYPES.MARKET && o.value !==ORDER_TYPES.PREVIOUSLY_QUOTED));
      setOrderType(ORDER_TYPES.LIMIT);
    } else if (timeInForce === TIME_IN_FORCE.IMMEDIATE_OR_CANCEL) {
      setOrderTypes(allOrderTypes.filter(o => o.value !== ORDER_TYPES.STOP));
      setOrderType(ORDER_TYPES.MARKET);
    } else {
      setOrderTypes(allOrderTypes);
      setOrderType(ORDER_TYPES.MARKET);
    }
  }, [timeInForce, allOrderTypes]);

  function handleDateChange(date) {
    setDisplayDate(date);
    setExpiry(format(date, DATETIME_FORMAT));
  }

  function handleClick() {
    let newOrder = {
      price,
      orderQty,
      orderType,
      currency,
      timeInForce,
      side,
      securityId,
      account,
      ...{ expiry }
    };

    if (orderType === "Stop") {
        delete newOrder.price;
        newOrder =  { ...newOrder, stopPx: price };
    }

    setLastOrderedId(orderService.placeOrder(newOrder));
  }

  return (
    <div className="order">
      <div className="order-form">
        <InputField
          className="order-input-price-level"
          type="number"
          step={0.000001}
          value={price}
          onInput={(e) => setPrice(+e.target.value)}
          onChange={(e) => setPrice(+e.target.value)}
          labelName="Price Level"
        />
        <InputField
          className="order-input-quantity"
          type="number"
          step={1}
          value={orderQty}
          onInput={(e) => setOrderQty(+e.target.value)}
          onChange={(e) => setOrderQty(+e.target.value)}
          labelName="Quantity"
        />
        <SelectField
          options={orderTypes}
          labelName={"Type"}
          id={"order-types"}
          onSelectChanged={(e) => setOrderType(e)}
        />
        <SelectField
          options={timeInForces}
          labelName={"Good Till"}
          id={"time-in-force"}
          onSelectChanged={(e) => setTimeInForce(e)}
        />
        {timeInForce === "GoodTillDate" &&
          <div className="order-good-till-date">
            <label htmlFor="datepicker-good-till-date">
              Date/Time
            </label>
            <div className="order-datepicker-container">
              <DatePicker
                id="datepicker-good-till-date"
                selected={displayDate}
                className={"form-control"}
                onChange={handleDateChange}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                timeCaption="Time"
                dateFormat="MMMM d, yyyy h:mm aa"
              />
            </div>
          </div>
        }
        {currentOrderStatus === "New" && <div className="order-confirm">Placed Order!</div>}
        {currentOrderStatus === "Rejected" && errorMessage && <div className="order-error">{errorMessage}</div>}
        <Button className="order-button" onClick={handleClick}>Place Order</Button>
      </div>
    </div>
  )
}
