const DAY = 24 * 60 * 60 * 1000;
const YEAR = 365 * DAY;

export function yearfrac(
  a: Date,
  b: Date,
  decimals: number = 1,
  absolute: boolean = true
): number {
  const raw_frac = (b.valueOf() - a.valueOf()) / YEAR;
  const frac = mround(raw_frac, decimals);
  if (absolute) {
    return Math.abs(frac);
  } else {
    return frac;
  }
}

export function mround(a: number, decimals: number): number {
  const factor = Math.pow(10, Math.trunc(decimals));
  return Math.round(a * factor) / factor;
}

export function within_days(a: Date, b: Date, days: number): boolean {
  const milli_diff = Math.abs(b.valueOf() - a.valueOf());
  const max_diff = Math.round(days) * DAY;
  return milli_diff <= max_diff;
}

export function add_days(d: Date, days: number): Date {
  return new Date(d.valueOf() + days * DAY);
}
