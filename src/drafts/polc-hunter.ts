import { placeMarketOrder } from '../common/trade.api';
import { MessageType } from '../ws/dto/market-ticker-all-sub.dto';
import { KucoinWs } from '../ws/kucoin-ws';

let isFinish = false;

(async () => {
    const onMessage = (data: any) => {
        const message = JSON.parse(data) as MessageType;
        if (!message.data || !message.data.price) return;
        const { price } = message.data;
        console.log(price);

        if (parseFloat(price) >= 65) {
            if (isFinish) return;
            isFinish = true;
            placeMarketOrder({
                side: 'sell',
                symbol: 'LUNA-USDT',
                funds: '0.6367',
            }).then((value) => {
                console.log(value);
                console.log('FINISH');
                process.exit(0);
            });
        }
        console.log(price);
        if (parseFloat(price) <= 60) {
            if (isFinish) return;
            isFinish = true;
            console.log('in if block');
            placeMarketOrder({
                side: 'sell',
                symbol: 'LUNA-USDT',
                funds: '0.6367',
            }).then((value) => {
                console.log(value);
                console.log('FINISH');
                process.exit(0);
            });
        }
    };
    await KucoinWs.subscribeSomeTickers(['LUNA-USDT'], onMessage);

    await new Promise<void>((resolve) => {
        setTimeout(() => {
            resolve();
        }, 600000000);
    });
})();
