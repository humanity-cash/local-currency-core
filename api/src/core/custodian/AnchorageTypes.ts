export interface quoteRequest {
  tradingPair: string;
  side: "BUY" | "SELL";
  quantity: number;
  currency: string;
}

export interface quoteResponse {
  data: {
    offerAmount: {
      assetType: string;
      quantity: number;
    };
    quoteID: string;
    quoteRequest: quoteRequest;
    quoteStatus: string;
    timestamp: string;
    validUntilTime: string;
  };
}

export interface acceptQuote {
  quoteID: string;
  side: "BUY" | "SELL";
}

export interface quoteAccepted {
  data: {
    quoteID: string;
    side: "BUY" | "SELL";
    tradeID: string;
    tradeStatus: string;
  };
}
