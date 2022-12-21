const ONE_YEAR = 365 * 24 * 60 * 60 * 1000;

export function yearfrac(a: Date, b: Date, decimals: number = 1, absolute: boolean = true): number {
    const raw_frac = (b.valueOf() - a.valueOf()) / ONE_YEAR;
    const frac = mround(raw_frac, decimals);
    if (absolute) {
        return Math.abs(frac);
    } else {
        return frac;
    }
}

export function mround(a: number, decimals: number): number {
    const factor = 10 ^ Math.trunc(decimals);
    return Math.round(a * factor) / factor;
}