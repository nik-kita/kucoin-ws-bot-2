/* eslint-disable no-multi-assign */
/* eslint-disable no-param-reassign */
import { WebSocket } from 'ws';
import { cliSize } from '../cli/min-max-sell-buy.cli';
import { getAccountInfo } from '../common/account.api';
import { placeMarketOrder } from '../common/trade.api';
import { sellOnFirstPriceGoDown } from '../drafts/in-code-sell-on-first-price-down-bot.draft';
import { MessageType } from '../ws/dto/market-ticker-all-sub.dto';
import { KucoinWs } from '../ws/kucoin-ws';

const map = new Map<string, MessageType>();

const funds = cliSize('funds: ');

(async () => {
    const onMessage = (_message: MessageType) => {
        const message = JSON.parse(_message as unknown as string) as MessageType;
        const { subject, data } = message;

        if (!data.price) return;

        const { price, time } = data;
        const oldCoin = map.get(subject);

        if (oldCoin) {
            const agio = parseFloat(price) - parseFloat(oldCoin.data.startPrice);
            oldCoin.data.lastPrice = price;
            oldCoin.data.lastTime = time;
            oldCoin.data.agio = agio;
            map.set(subject, oldCoin);
        } else {
            message.data.startTime = time;
            message.data.lastTime = time;
            message.data.startPrice = price;
            message.data.lastPrice = price;
            map.set(subject, message);
        }
    };

    const afterConnect = (ws1: WebSocket) => {
        ws1.on('message', onMessage);
    };

    await KucoinWs.subscribeAllTickers(afterConnect);

    await new Promise<void>((resolve) => {
        setTimeout(() => {
            resolve();
        }, 20000);
    });

    const sorted = Array.from(map.values()).filter((a) => /\w+-USDT/.test(a.subject)).sort((a, b) => {
        const aAgio = a.data.agio ?? -100;
        const bAgio = b.data.agio ?? -100;

        return aAgio - bAgio;
    });

    const best = sorted.at(-1);
    const best2 = sorted.at(-2);
    const bad = sorted[0];
    const bad2 = sorted[1];

    console.log('best: ', best!.subject, best2!.subject);
    console.log('bad: ', bad!.subject, bad2!.subject);

    const { subject } = best!;
    const payload = {
        symbol: subject,
        side: 'buy' as const,
        funds,
        type: 'market' as const,
    };
    try {
        const req = placeMarketOrder(payload);
        const res = await req;
        const [currency] = subject.split('-');
        const [accInfoRes] = await getAccountInfo({
            type: 'trade',
            currency,
        });
        const { available } = accInfoRes;
        console.log('res', res);

        console.log('READY FOR SELL');

        await sellOnFirstPriceGoDown(currency, available);
    } catch (error: any) {
        console.error('error', error);
        throw error;
    }
})();
