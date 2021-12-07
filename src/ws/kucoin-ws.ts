import { v4 } from 'uuid';
import Ws, { WebSocket } from 'ws';
import { bulletPrivateReq } from '../common/auth.api';
import { MarketTickerAllPubDto, MarketTickerSomePubDto } from './dto/market-ticker-all-pub.dto';
import {
    AckMessageDto, isAckMessageDto, isWelcomeMessageDto, WelcomeMessageDto,
} from './utility-messages.dto';

export interface IGeneralSubscribe {
    id: string;

    type: 'subscribe' | 'unsubscribe';

    topic: string;

    response: boolean;
}

export class KucoinWs {
    private waitForConnection!: Promise<void>;

    private stopPingPong!: ReturnType<typeof setTimeout>;

    private constructor(
        private ws: WebSocket,
        private connectId: string,
        private pingTimeout: number,
        private sendData: IGeneralSubscribe,
        private afterConnect: (_ws: WebSocket) => void,
    ) {

    }

    public get originalWs() {
        return this.ws;
    }

    public get id() {
        return this.connectId;
    }

    public static async subscribeSomeTickers(
        coins: string[],
        afterConnect: (ws: WebSocket) => void,
    ) {
        return KucoinWs.connect(
            new MarketTickerSomePubDto(v4(), coins),
            afterConnect,
        );
    }

    public static async subscribeAllTickers(
        afterConnect: (ws: WebSocket) => void,
    ) {
        return KucoinWs.connect(
            new MarketTickerAllPubDto(v4()),
            afterConnect,
        );
    }

    public finish() {
        this.ws.close();
    }

    private static async connect(
        sendData: IGeneralSubscribe,
        afterConnect: (ws: WebSocket) => void,
    ) {
        const waitForConnect = 10000;
        const pingPongInterval = 30000;
        const { id: connectId } = sendData;
        const { token, instanceServers } = await bulletPrivateReq();
        const [server] = instanceServers;
        const ws = new Ws(KucoinWs.generateConnectedUrl(server.endpoint, token, connectId));
        const client = new KucoinWs(
            ws,
            connectId,
            pingPongInterval,
            sendData,
            afterConnect,
        );

        client.waitForConnection = new Promise<void>((resolve, reject) => {
            const offTimer = setTimeout(
                () => reject(new Error(`Socket didn't connect until expected ${waitForConnect} mms`)),
                waitForConnect,
            );

            ws.once('message', (welcomeMessage: WelcomeMessageDto) => {
                if (!isWelcomeMessageDto(welcomeMessage)) {
                    reject(new Error(`${welcomeMessage} is not of type ${WelcomeMessageDto.name}`));
                }

                ws.once('message', (ackMessage: AckMessageDto) => {
                    if (!isAckMessageDto(ackMessage, connectId)) {
                        reject(new Error(`${ackMessage} is not of type ${AckMessageDto.name}`));
                    }

                    clearTimeout(offTimer);

                    client.stopPingPong = setInterval(
                        () => ws.send(KucoinWs.generatePingPayload(ackMessage.id)),
                        pingPongInterval,
                    );

                    client.afterConnect.call(this, ws);

                    resolve();
                });
            }).on('open', () => {
                ws.send(JSON.stringify(client.sendData));
            });
        });

        return client;
    }

    private static generateConnectedUrl(endpoint: string, token: string, connectId: string) {
        return `${endpoint}?token=${token}&[connectId=${connectId}]`;
    }

    private static generatePingPayload(connectId: string) {
        return `{ "id": "${connectId}", "type": "ping" }`;
    }
}
