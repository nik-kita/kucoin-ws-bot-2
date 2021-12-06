import crypto from 'crypto';
import moment from 'moment';
import dotenv from 'dotenv';

dotenv.config();

export class SignGenerator {
    // eslint-disable-next-line no-use-before-define
    private static signGeneratorSingleton: SignGenerator;

    public static create() {
        const { PASSPHRASE, API_KEY, API_SECRET } = process.env;

        if (!PASSPHRASE || !API_KEY || !API_SECRET) {
            throw new Error('No credentials in .env file');
        }

        return SignGenerator.signGeneratorSingleton
            ? SignGenerator.signGeneratorSingleton
            : new SignGenerator(
                API_KEY,
                API_SECRET,
                PASSPHRASE,
            );
    }

    public generateHeaders(
        method: 'GET' | 'POST',
        endpoint: string,
        body: object | '',
    ) {
        const timestamp = moment().format('x');
        const stringToSign = this.stringToSign(endpoint, timestamp, method, body);
        const signature = this.signature(stringToSign);
        const signedPassphrase = this.signature(this.passphrase);

        return {
            'KC-API-SIGN': signature,
            'KC-API-TIMESTAMP': timestamp.toString(),
            'KC-API-KEY': this.apiKey,
            'KC-API-PASSPHRASE': signedPassphrase,
            'KC-API-KEY-VERSION': '2',
            'Content-Type': 'application/json',
        };
    }

    private constructor(
        private apiKey: string,
        private apiSecret: string,
        private passphrase: string,
    ) { }

    private signature(payload: string) {
        return crypto
            .createHmac('sha256', this.apiSecret)
            .update(payload)
            .digest('base64');
    }

    private stringToSign(
        endpoint: string,
        timestamp: string,
        method: 'GET' | 'POST',
        body: object | '' = '',
    ) {
        const result = timestamp + method + endpoint + (typeof body === 'string' ? body : JSON.stringify(body));

        return result;
    }
}
