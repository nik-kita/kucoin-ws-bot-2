export const HOST_URL = 'https://api.kucoin.com';
export const ENDPOINTS = {
    'POST /api/v1/bullet-private': {
        method: 'POST' as const,
        endpoint: '/api/v1/bullet-private' as const,
        parameters: {
            type: 'trade' as 'trade' | 'margin' | 'main',
            currency: '',
        },
    },
    'GET /api/v1/accounts': {
        method: 'GET' as const,
        endpoint: '/api/v1/accounts',
    },
    'POST /api/v1/orders': {
        method: 'POST' as const,
        endpoint: '/api/v1/orders' as const,
        body: {
            clientOid: '',
            side: 'buy' as 'buy' | 'sell',
            symbol: '',
            type: 'limit' as 'limit' | 'market' | undefined,
            tradeType: 'TRADE' as 'TRADE' | undefined,
            price: '',
            size: '',
        },
    },
    'POST /api/v1/orders/multi': {
        method: 'POST' as const,
        endpoint: '/api/v1/orders/multi' as const,
        body: {
            symbol: '',
            orderList: [
                {
                    clientOid: '',
                    side: 'buy' as 'buy' | 'sell',
                    price: '',
                    size: '',
                },
            ],
        },
    },
};
