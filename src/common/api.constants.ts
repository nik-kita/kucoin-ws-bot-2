export const HOST_URL = 'https://api.kucoin.com';
export const ENDPOINTS = {
    'POST /api/v1/bullet-private': {
        method: 'POST' as 'POST',
        endpoint: '/api/v1/bullet-private',
    },
    'POST /api/v1/orders': {
        method: 'POST' as 'POST',
        endpoint: '/api/v1/orders',
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
        method: 'POST' as 'POST',
        endpoint: '/api/v1/orders/multi',
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
