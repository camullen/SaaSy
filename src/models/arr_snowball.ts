import { DateRange, Periodicity } from "../dateutils";
import Contract from "./contract";
import CustomerMap from "./customer_map";

export default class ArrSnowball {
  private readonly customer_map: CustomerMap;
  readonly contract_date_range: DateRange;
  readonly periodicity: Periodicity;

  constructor(
    customer_map: CustomerMap,
    periodicity: Periodicity = Periodicity.Quarterly
  ) {
    this.customer_map = customer_map;
    this.contract_date_range = calc_date_range(customer_map.contracts);
    this.periodicity = periodicity;
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
