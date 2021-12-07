import { WebSocket } from 'ws';
import { cliSize, cliSymbol } from '../cli/min-max-sell-buy.cli';
import { placeMarketOrder } from '../common/trade.api';
import { MessageType } from '../ws/dto/market-ticker-all-sub.dto';
import { KucoinWs } from '../ws/kucoin-ws';

console.log('YOU WILL SELL {size} OF {coin pair} IF ITS PRICE GO DOWN ("market" TYPE)');

const symbol = cliSymbol();
const size = cliSize();

const afterConnect = (ws: WebSocket) => {
    ws.once('message', (firstMessage: any) => {
        const { data: firstData } = JSON.parse(firstMessage) as MessageType;

        if (!firstData || !firstData.price) {
            console.log('First message didnt have any price info... please try again');
            process.exit(0);
        }
        const { price: firstPrice } = firstData;
        let lastPrice = firstPrice;
        let processing = false;

        ws.on('message', (message: any) => {
            if (processing) return;

            const { data } = JSON.parse(message) as MessageType;

            if (!data || !data.price) return;

            const { price } = data;

            if (price > firstPrice && price < lastPrice) {
                processing = true;

                placeMarketOrder({
                    symbol,
                    type: 'market',
                    side: 'sell',
                    size,
                }).then((res) => {
                    console.log('FINISH');
                    console.log(res);
                    process.exit(0);
                });
            } else {
                lastPrice = price;
            }
        });
    });
};

(async () => {
    KucoinWs.subscribeSomeTickers([symbol!], afterConnect);
})();
