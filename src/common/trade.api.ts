/* eslint-disable no-param-reassign */
import axios from 'axios';
import { v4 } from 'uuid';
import { ENDPOINTS, HOST_URL } from './api.constants';
import { SignGenerator } from './sign-generator';

type LimitOrderDto = {
    side: 'buy' | 'sell',
    symbol: string,
    price: string,
    size: string,
    type: 'limit',
};

type MarketOrderDto = {
    side: 'buy' | 'sell',
    symbol: string,
    type: 'market',
    funds: string,
}

class TradeApi {
    public static async placeMarketOrder(
        details: Pick<MarketOrderDto, 'side' | 'symbol' | 'funds'>,
    ) {
        return TradeApi.placeNewSingleOrder({ ...details, type: 'market' });
    }

    private static async placeNewSingleOrder(details: LimitOrderDto | MarketOrderDto) {
        const { endpoint, method } = ENDPOINTS['POST /api/v1/orders'];
        (details as LimitOrderDto & { clientOid: string }).clientOid = v4();
        const headers = SignGenerator
            .create()
            .generateHeaders(method, endpoint, details);
        const { data: axiosData } = await axios({
            headers,
            method,
            url: HOST_URL + endpoint,
            data: details,
        });
        const { data } = axiosData;

        return data;
    }
}

export const { placeMarketOrder } = TradeApi;
