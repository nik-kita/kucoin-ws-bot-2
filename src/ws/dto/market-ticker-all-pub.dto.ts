/* eslint-disable max-classes-per-file */
export class MarketTickerAllPubDto {
    constructor(public id: string) {}

    type = 'subscribe' as const;

    topic = '/market/ticker:all' as const;

    response = true as const;
}

export class MarketTickerSomePubDto {
    constructor(
        public id: string,
        public coins: string[],
    ) {}

    type = 'subscribe' as const;

    topic = `/market/ticker:${this.coins.join(',')}`;

    response = true as const;
}
