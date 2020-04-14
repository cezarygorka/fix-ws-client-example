import * as Timestamp from 'timestamp-nano';
import {generateSendingTime} from "./utils";

export const DATETIME_FORMAT = "yyyy-MM-dd'T'HH:mm:ss.SSS";

export const SUBSCRIPTION_REQUEST_TYPE = {
  SUBSCRIBE: "SnapshotAndUpdates",
  UNSUBSCRIBE: "DisablePreviousSnapshot"
};
export const WEBSOCKET_SOURCE = {
  PRE_TRADE: "PreTrade",
  TRADE: "Trade",
};

export default class WebsocketConnection {
  fixpWebsocket = null;
  sessionId = "";
  credentials = "";
  credentialsType = "";
  heartbeatInterval = null;
  heartbeatIntervalAmount = 30000;

  constructor(url) {
    this.fixpWebsocket = new WebSocket(url);
  }

  close(code) {
    this.fixpWebsocket.close(code);
  }

  send(data) {
    if (this.fixpWebsocket.readyState === this.fixpWebsocket.OPEN) {
      this.fixpWebsocket.send(JSON.stringify(data));
    }
  }

  sendNegotiate(sessionId, credentialsType, credentials) {
    this.sessionId = sessionId;
    this.credentials = credentials;
    this.credentialsType = credentialsType;

    const timestamp = this._generateTimestamp();

    const negotiate = {
      MessageType:"Negotiate",
      ApplVerID: "FIX50SP2",
      SendingTime: generateSendingTime(),
      Timestamp:timestamp,
      SessionId: sessionId,
      ClientFlow:"Unsequenced",
      Credentials: {
        CredentialsType: credentialsType,
        Token: credentials
      }
    };
    this.send(negotiate);
  }

  sendEstablish(sessionId, heartbeat) {
    const timestamp = this._generateTimestamp();
    this.heartbeatIntervalAmount = heartbeat || 30000;
    const establish = {
      MessageType:"Establish",
      Timestamp: timestamp,
      SessionId: sessionId,
      KeepaliveInterval: this.heartbeatIntervalAmount
    };
    this.send(establish);
  }

  startHeartbeat() {
    const heartbeat = {
      MessageType: "UnsequencedHeartbeat"
    };

    const heartbeatTime = Math.max(parseInt(this.heartbeatIntervalAmount), 2000) - 1000;
    this.heartbeatInterval = setInterval(() => this.send(heartbeat), heartbeatTime);
  }

  stopHeartbeat() {
    clearInterval(this.heartbeatInterval);
    this.heartbeatInterval = null;
  }

  _generateTimestamp() {
    const date = Timestamp.fromDate(new Date());
    return parseInt(String(date.getTimeT()) + String(date.getNano()));
  }
}
