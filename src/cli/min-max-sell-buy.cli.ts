/* eslint-disable no-console */
// @ts-ignore
import { input } from 'console-input';

function checkFloat(number: string) {
    if (Number.isNaN(parseFloat(number))) {
        console.log(`"${number}" is incorrect value. Valid float number expected.`);
        process.exit(0);
    }
}

export function cliSymbol(customMessage?: string) {
    const symbol = input(customMessage ?? 'symbol: ') as string;
    const _symbol = symbol.includes('-')
        ? symbol.toUpperCase()
        : `${symbol}-usdt`.toUpperCase();

    if (!/[A-Z]+[A-Z\d]*-[A-Z]+[A-Z\d]*/.test(_symbol)) {
        console.log(`"${_symbol}"" is incorrect value for symbol.`);
        process.exit(0);
    }

    console.log(_symbol);

    return _symbol;
}

export function cliSize(customMessage?: string) {
    const size = input(customMessage ?? 'size: ') as string;

    checkFloat(size);

    console.log(size);

    return size;
}
