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

export enum Periodicity {
  Monthly,
  Quarterly,
  Yearly,
}

export type Period = {
  start: Date;
  end: Date;
  label: string;
  periodicity: Periodicity;
};

export type DateRange = {
  min: Date;
  max: Date;
};

export function create_period_array(
  range: DateRange,
  periodicity: Periodicity
): Period[] {
  switch (periodicity) {
    case Periodicity.Monthly:
      return create_monthly_periods(range);
    case Periodicity.Quarterly:
      return create_quarterly_periods(range);
    case Periodicity.Yearly:
      return create_yearly_periods(range);
  }
}

function create_monthly_periods(range: DateRange): Period[] {
  const min_month = new Date(range.min.valueOf());
  min_month.setUTCDate(1);
  const max_month = new Date(range.max.valueOf());
  max_month.setUTCDate(1);
  const periods: Period[] = [];
  for (
    let d = new Date(min_month.valueOf());
    d <= max_month;
    increment_month(d)
  ) {
    periods.push({
      start: new Date(d.valueOf()),
      end: end_of_month(d),
      label: d.toLocaleDateString("en-us", { year: "numeric", month: "short" }),
      periodicity: Periodicity.Monthly,
    });
  }
  return periods;
}

function increment_month(d: Date, by: number = 1) {
  d.setUTCMonth(d.getUTCMonth() + by);
}

function end_of_month(d: Date) {
  const eom = new Date(d.valueOf());
  increment_month(eom);
  eom.setUTCDate(0);
  return eom;
}

function end_of_quarter(d: Date) {
  const eom = new Date(d.valueOf());
  increment_month(eom, 3);
  eom.setUTCDate(0);
  return eom;
}

function create_quarterly_periods(range: DateRange): Period[] {
  const min_quarter = get_quarter_start(range.min);
  const max_quarter = get_quarter_start(range.max);
  const periods: Period[] = [];
  for (
    let d = new Date(min_quarter.valueOf());
    d <= max_quarter;
    increment_month(d, 3)
  ) {
    periods.push(
      start: new Date(d.valueOf()),
      end: 
    )
  }
}

function get_quarter_start(d: Date): Date {
  // 0 indexed quarter
  const quarter = Math.floor(d.getUTCMonth());
  const month = quarter * 3;
  return new Date(Date.UTC(d.getUTCFullYear(), month, 1));
}

function create_yearly_periods(range: DateRange): Period[] {
  const min_year = range.min.getUTCFullYear();
  const max_year = range.max.getUTCFullYear();
  const periods: Period[] = [];
  for (let year = min_year; year < max_year; year++) {
    periods.push({
      start: new Date(Date.UTC(year, 0, 1, 0, 0, 0)),
      end: new Date(Date.UTC(year + 1, 0, 0, 0, 0, 0)),
      label: year.toString(),
      periodicity: Periodicity.Yearly,
    });
  }
  return periods;
}
