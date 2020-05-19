import React from 'react';
import { Col, Row, Container } from 'shards-react';
import Quote from './quote';
import Charts from './charts';
import Order from './order';
import { WorkingOrders } from './working-orders';
import Positions from './positions';
import PerformanceMetrics from '../performance-metrics';

export function Quotes({ quotes, securityId, selectedClass, onDirectionClick }) {
  return (
    <Row>
      <Container fluid={true}>
        <Row className={"quotes-container"}>
          {quotes && quotes.map(quote =>
          <Quote
            onDirectionClick={(d) => onDirectionClick(d)}
            className={(quote.securityId === securityId) ? selectedClass : ''}
            key={quote.securityId}
            symbol={quote.symbol}
            securityId={quote.securityId}
            buy={quote.BidPx}
            sell={quote.OfferPx}
          />
          )}
        </Row>
      </Container>
    </Row>
  )
}

export function ChartContainer({ service, symbol, securityId, direction, historicData, subscriptionData }) {
  return (
    <div className="chart-container">
      {symbol && securityId && direction &&
      <Row>
        <Col>
          <Charts
            service={service}
            symbol={symbol}
            securityId={securityId}
            direction={direction}
            candleData={historicData}
            candleSubscriptionData={subscriptionData.CandleData}
          />
        </Col>
      </Row>
      }
    </div>
  );
}

export function Orders({ service, account, currency, errorMessage, rejectReason, orderId, orderStatus, priceLevel, side, securityId, symbol, direction }) {
  return (
    <div className="order-container">
      {symbol && securityId && direction &&
      <Row>
        <Col>
          <Order
            orderService={service}
            account={account}
            currency={currency}
            errorMessage={errorMessage}
            rejectReason={rejectReason}
            orderId={orderId}
            orderStatus={orderStatus}
            priceLevel={priceLevel}
            side={side}
            securityId={securityId}
          />
        </Col>
      </Row>}
    </div>
  );
}

export function Reports({ workingOrders, positions, replacedOrder, onCancelOrder, onOrderCancelReplace }) {
  return (
    <div className="reports">
      <Row>
        <Col>
          <WorkingOrders
            orders={workingOrders}
            replacedOrder={replacedOrder}
            onCancelOrder={(o) => onCancelOrder(o)}
            onOrderCancelReplace={(o) => onOrderCancelReplace(o)}
          />
        </Col>
      </Row>
      <Row>
        <Col>
          <Positions positions={positions}/>
        </Col>
      </Row>
    </div>
  )
}

export function MessagePerformanceMetrics({ quoteMessage }) {
  return (
    <Row>
      <Col>
        <PerformanceMetrics quoteMessage={quoteMessage}/>
      </Col>
    </Row>
  )
}
