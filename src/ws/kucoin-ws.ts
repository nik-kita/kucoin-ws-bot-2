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
        private onMessage: (data: any) => void,
    ) { }

    public get originalWs() {
        return this.ws;
    }

    public get id() {
        return this.connectId;
    }

    public static async subscribeSomeTickers(coins: string[], onMessage: (data: any) => void) {
        return KucoinWs.connect(
            new MarketTickerSomePubDto(v4(), coins),
            onMessage,
            10000,
            30000,
        );
    }

    public static async subscribeAllTickers(onMessage: (data: any) => void) {
        return KucoinWs.connect(
            new MarketTickerAllPubDto(v4()),
            onMessage,
            10000,
            30000,
        );
    }

    private static async connect(
        sendData: IGeneralSubscribe,
        onMessage: (data: any) => void,
        waitForConnect: number,
        pingPongInterval: number,
    ) {
        const { id: connectId } = sendData;
        const { token, instanceServers } = await bulletPrivateReq();
        const [server] = instanceServers;
        const ws = new Ws(KucoinWs.generateConnectedUrl(server.endpoint, token, connectId));
        const client = new KucoinWs(
            ws,
            connectId,
            pingPongInterval,
            sendData,
            onMessage,
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

                    ws.on('message', client.onMessage);

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
