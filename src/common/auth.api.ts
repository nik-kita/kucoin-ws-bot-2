import axios from 'axios';
import { SignGenerator } from './sign-generator';
import { ENDPOINTS, HOST_URL } from './api.constants';

export type BulletPrivateResType = {
    token: string,
    instanceServers: [
        {
            endpoint: string,
            encrypt: number,
            protocol: string,
            pingInterval: number,
            pingTimeout: number,
        }
    ]
};

class AuthApi {
    public static async bulletPrivateReq(): Promise<BulletPrivateResType> {
        const { endpoint, method } = ENDPOINTS['POST /api/v1/bullet-private'];
        const headers = SignGenerator
            .create()
            .generateHeaders(
                method,
                endpoint,
            );

        const { data: axiosData } = await axios({
            headers,
            method,
            url: HOST_URL + endpoint,
        });
        const { data } = axiosData;

        return {
            token: data.token,
            instanceServers: data.instanceServers,
        };
    }
}

export const {
    bulletPrivateReq,
} = AuthApi;
