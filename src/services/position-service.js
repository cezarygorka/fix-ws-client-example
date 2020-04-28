import RequestIDService from "./request-id-service";
import {buildMsgType, generateSendingTime} from "./utils";
import {SUBSCRIPTION_REQUEST_TYPE} from "./websocket-connection";
import { format } from "date-fns";

export default class PositionService {
    websocketService = null;
    positionIdService = new RequestIDService("position");

    constructor(tradeWebsocket) {
        this.websocketService = tradeWebsocket;
    }

    getPositions({ account }) {
        const PosReqID = this.positionIdService.generateRequestId();
        const request = {
            ...buildMsgType("RequestForPositions"),
            CstmApplVerID: "IGUS/Trade/V1",
            PosReqID,
            PosReqType: "Positions",
            Parties: [
                { PartyRole: "CustomerAccount" }
            ],
            SubscriptionRequestType: SUBSCRIPTION_REQUEST_TYPE.SUBSCRIBE,
            Account: account,
            TransactTime: generateSendingTime(),
            ClearingBusinessDate: format(new Date(), "yyyymmdd"),
        };

        this.websocketService.send(request);
    }
}

