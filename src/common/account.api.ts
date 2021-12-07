import axios from 'axios';
import { ENDPOINTS, HOST_URL } from './api.constants';
import { SignGenerator } from './sign-generator';

export type AccountInfoResDto = {
    id: string,
    currency: string,
    type: 'main' | 'trade' | 'margin' | 'pool',
    balance: string,
    available: string,
    holds: string,
}

class AccountApi {
    public static async getAccountInfo(params?: {
        type?: 'main' | 'trade' | 'margin',
        currency?: string
    }):
  Promise<AccountInfoResDto[]> {
        const { endpoint, method } = ENDPOINTS['GET /api/v1/accounts'];
        const headers = SignGenerator
            .create()
            .generateHeaders(
                method,
                endpoint,
                {
                    params,
                },
            );

        const { data: axiosData } = await axios({
            params,
            headers,
            method,
            url: HOST_URL + endpoint,
        });
        const { data } = axiosData;

        return data;
    }
}

export const {
    getAccountInfo,
} = AccountApi;
