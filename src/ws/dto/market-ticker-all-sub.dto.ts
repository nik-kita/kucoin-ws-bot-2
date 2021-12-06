import { WebSocket } from 'ws';

export type DataType = {
  bestAsk: string,
  bestAskSize: string,
  bestBid: string,
  betsBidSize: string,
  price: string,
  lastPrice: string,
  startPrice: string,
  sequence: string,
  size: string,
  time: number,
  lastTime: number,
  startTime: number,
  agio?: number,
}

export class MessageType {
    target!: WebSocket;

    type!: 'message';

    topic!: string;

    subject!: string;

    data!: DataType;
}
