import React, { useState, useEffect } from 'react';
import { Row, Col, Container } from 'shards-react';

import Quote from '../quote';
import Charts from '../charts';
import QuoteService from '../../services/quote-service';
import { SUBSCRIPTION_REQUEST_TYPE } from '../../services/websocket-connection';
import SymbolList from '../symbol-list';
import PerformanceMetrics from "../../performance-metrics";
import '../../styles/pre-trade.css';
import Order from "../order";

const DEFAULT_SYMBOL_SUBSCRIPTIONS = [
  'GBP/USD',
];

const SIDE = {
  BID: "Buy",
  ASK: "Sell"
};

export default function Trade({ quoteMessage, tradeMessage, preTradeService, tradeService, isEstablish, candleData, candleSubscriptionData, securityList }) {
  const [ securityId, setSecurityId ] = useState(null);
  const [ direction, setDirection ] = useState(null);
  const [ selectedClass, setSelectedClass ] = useState(null);
  const [ quoteService, setQuoteService ] = useState(null);
  const [ subscribedQuotes, setSubscribedQuotes ] = useState(null);
  const [ symbol, setSymbol ] = useState(null);
  const [ quotesArr, setQuotesArr ] = useState([]);
  const [ selectedMarket, setSelectedMarket ] = useState({ priceLevel: "", side: "", securityId: "" });

  const serviceQuoteLength = quoteService ? quoteService.getSubscribedQuotes().length : 0;

  useEffect(() => {
    if (!quoteService) {
      setQuoteService(new QuoteService(preTradeService));
    }

    return () => {
      if (quoteService) {
        quoteService.unsubscribeAll();
      }
    }
  }, [quoteService, preTradeService]);

  useEffect(() => {
    if (!quotesArr) {
      setQuotesArr([]);
    }
  }, [quotesArr]);

  useEffect(() => {
    if (quoteService && serviceQuoteLength) {
      setSubscribedQuotes(quoteService.getSubscribedQuotes().map(quoteRequest => quoteRequest.securityId));
    }
  }, [quoteService, serviceQuoteLength]);

  useEffect(() => {
    if (isEstablish && securityList && quoteService) {
      DEFAULT_SYMBOL_SUBSCRIPTIONS.forEach((symbol) => {
        const epicId = securityList.filter(securitySymbol => securitySymbol.Symbol === symbol)[0];
        const hasSubscribed = quoteService.getSubscribedQuotes().filter(securitySymbol => securitySymbol.symbol === symbol)[0];
        if (epicId && !hasSubscribed) {
          quoteService.getQuoteSubscription(epicId.Symbol, epicId.SecurityID, SUBSCRIPTION_REQUEST_TYPE.SUBSCRIBE);
        }
      });
    }
  }, [isEstablish, securityList, quoteService]);

  useEffect(() => {
    function hasArrPriceTicked(direction) {
      const foundIndex = quotesArr && quotesArr.findIndex(quote => quote.QuoteReqID === quoteMessage.QuoteReqID);
      if (foundIndex > -1) {
        return quotesArr[foundIndex][direction] !== quoteMessage[direction];
      }
      return false;
    }

    const isStreamingQuote = quoteMessage && quoteMessage.BidID && quoteMessage.OfferID;
    const foundIndex = quotesArr && quotesArr.findIndex(quote => quote.QuoteReqID === quoteMessage.QuoteReqID);

    if (isStreamingQuote && quotesArr) {

      const foundQuote = quoteService && quoteService.getSubscribedQuotes().filter(requests => requests.quoteId === quoteMessage.QuoteReqID)[0];
      if (foundQuote) {
        quoteMessage.symbol = foundQuote.symbol;
        quoteMessage.securityId = foundQuote.securityId;
      }

      if (hasArrPriceTicked("BidID") || hasArrPriceTicked("OfferID")) {
        quotesArr[foundIndex] = quoteMessage;
        setQuotesArr([ ...quotesArr ]);
      } else {
        if (foundIndex === -1) {
            if (quoteService && serviceQuoteLength !== 0) {
              quotesArr.push(quoteMessage);
              setQuotesArr([ ...quotesArr ]);
            }
        }
      }
    }
  }, [quotesArr, quoteService, quoteMessage, serviceQuoteLength]);

  useEffect(() => {
    if (quotesArr && subscribedQuotes) {
      if (quotesArr.length > subscribedQuotes.length && subscribedQuotes.length !== 0) {
        const index = quotesArr.findIndex(quote => subscribedQuotes.filter(securityId => quote.securityId !== securityId).length > 0);
        quotesArr.splice(index, 1);
        setQuotesArr([ ...quotesArr ]);
      }
    }
  }, [quotesArr, subscribedQuotes]);

  function selectChart({ direction: quoteDirection, securityId: quoteSecurityId, symbol: quoteSymbol, value }) {
    setSelectedMarket({ side: SIDE[quoteDirection], priceLevel: value, securityId: quoteSecurityId });
    if (direction && securityId && (direction === quoteDirection) && (securityId === quoteSecurityId)) {
      setDirection(null);
      setSecurityId(null);
      setSymbol(null);
    } else {
      setDirection(quoteDirection);
      setSecurityId(quoteSecurityId);
      setSymbol(quoteSymbol);
      if (quoteDirection === "BID") {
        setSelectedClass("buy-button--selected");
      } else if (quoteDirection === "ASK") {
        setSelectedClass("sell-button--selected");
      }
    }
  }

  function handleQuoteSelection({ SecurityID, Symbol }) {
    let subscriptionType = SUBSCRIPTION_REQUEST_TYPE.SUBSCRIBE;
    if (subscribedQuotes.includes(SecurityID)) {
      subscriptionType = SUBSCRIPTION_REQUEST_TYPE.UNSUBSCRIBE;
    }
    quoteService.getQuoteSubscription(Symbol, SecurityID, subscriptionType);
    if (quotesArr && quotesArr.length === 1 && subscriptionType === SUBSCRIPTION_REQUEST_TYPE.UNSUBSCRIBE) {
      setQuotesArr(null);
      setSubscribedQuotes([]);
    }
  }

  return (
      <div className="pre-trade-container">
        <Row>
          <Col md="3" lg="3">
            <SymbolList service={preTradeService} selectedSymbols={subscribedQuotes} securityList={securityList} onSecurityItemSelected={handleQuoteSelection}/>
          </Col>
          <Col md="9" lg="9">
            <Row>
              <Col>
                <PerformanceMetrics quoteMessage={quoteMessage}/>
              </Col>
            </Row>
            <Row>
              <Container fluid={true}>
                  <Row className={"quotes-container"}>
                    {quotesArr && quotesArr.map(quote =>
                        <Quote
                            onDirectionClick={selectChart}
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
            {symbol && securityId && direction &&
            <Row>
              <Col>
                <Charts
                    service={preTradeService}
                    isLoginSuccessful={isEstablish}
                    symbol={symbol}
                    securityId={securityId}
                    direction={direction}
                    candleData={candleData}
                    candleSubscriptionData={candleSubscriptionData.CandleData}
                />
              </Col>
            </Row>}
            {symbol && securityId && direction &&
            <Row>
              <Order
                  service={tradeService}
                  errorMessage={tradeMessage.Text}
                  rejectReason={tradeMessage.OrdRejReason}
                  orderId={tradeMessage.ClOrdID}
                  orderStatus={tradeMessage.OrdStatus}
                  priceLevel={selectedMarket.priceLevel}
                  side={selectedMarket.side}
                  securityId={selectedMarket.securityId}
              />
            </Row>}
          </Col>
        </Row>

      </div>
  );
}