import {
  add_days,
  create_period_array,
  DateRange,
  Period,
  Periodicity,
} from "../dateutils";
import { ArrEventType } from "./arr_event";
import Contract from "./contract";
import CustomerMap from "./customer_map";

export default class ArrSnowball {
  private readonly customer_map: CustomerMap;
  readonly contract_date_range: DateRange;
  readonly periodicity: Periodicity;
  readonly snowball_periods: ReadonlyArray<SnowballPeriod>;

  constructor(
    customer_map: CustomerMap,
    periodicity: Periodicity = Periodicity.Quarterly
  ) {
    this.customer_map = customer_map;
    this.contract_date_range = calc_date_range(customer_map.contracts);
    this.periodicity = periodicity;
    this.snowball_periods = create_period_array(
      this.contract_date_range,
      periodicity
    ).map((p) => new SnowballPeriod(customer_map, p));
  }
}

class SnowballPeriod {
  private readonly period: Period;
  readonly starting_arr: number;
  readonly new: number;
  readonly expansion: number;
  readonly downsell: number;
  readonly churn: number;
  readonly ending_arr: number;

  constructor(customer_map: Readonly<CustomerMap>, period: Readonly<Period>) {
    this.period = period;
    this.starting_arr = get_arr_at_date(
      customer_map,
      add_days(period.start, -1)
    );
    this.ending_arr = get_arr_at_date(customer_map, period.end);
    this.new = sum_arr_events(customer_map, period, ArrEventType.New);
    this.expansion = sum_arr_events(
      customer_map,
      period,
      ArrEventType.Expansion
    );
    this.downsell = sum_arr_events(customer_map, period, ArrEventType.Downsell);
    this.churn = sum_arr_events(customer_map, period, ArrEventType.Churn);
  }
}

function calc_date_range(
  contracts: ReadonlyArray<Contract>
): Readonly<DateRange> {
  const range: DateRange = {
    min: contracts[0].start_date,
    max: contracts[0].end_date,
  };
  contracts.forEach((c) => {
    if (c.start_date < range.min) range.min = c.start_date;
    if (c.end_date > range.max) range.max = c.end_date;
  });

  return range;
}

function get_arr_at_date(customer_map: Readonly<CustomerMap>, d: Date): number {
  let arr = 0;
  for (let customer of customer_map.values()) {
    arr += customer.arr_timeline.get_arr_at_date(d);
  }
  return arr;
}

function sum_arr_events(
  customer_map: Readonly<CustomerMap>,
  period: Readonly<Period>,
  arr_event_type: ArrEventType
): number {
  let total_arr = 0;
  for (let customer of customer_map.values()) {
    for (let arr_event of customer.arr_events) {
      if (
        arr_event.event_type === arr_event_type &&
        arr_event.event_date >= period.start &&
        arr_event.event_date <= period.end
      ) {
        total_arr += arr_event.arr_change;
      }
    }
  }
  return total_arr;
}
