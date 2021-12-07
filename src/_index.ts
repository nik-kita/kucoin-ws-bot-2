import { getAccountInfo } from './common/account.api';

(async () => {
    try {
        const res = await getAccountInfo({
            currency: 'USDT',
        });
        console.log(res);
    } catch (err) {
        console.error(err);
    }
})();
