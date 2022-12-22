import { ArrEvent, create_arr_events } from "./arr_event";
import ArrTimeline from "./arr_timeline";
import Contract from "./contract";
import groupBy from "lodash.groupby";

export default class Customer {
  readonly customer_id: string;
  readonly contracts: ReadonlyArray<Contract>;
  readonly arr_events: ReadonlyArray<ArrEvent>;
  readonly arr_timeline: ArrTimeline;

  constructor(customer_id: string, contracts: ReadonlyArray<Contract>) {
    this.customer_id = customer_id;
    this.contracts = contracts;
    this.arr_events = create_arr_events(contracts);
    this.arr_timeline = new ArrTimeline(this.arr_events);
  }

  static createCustomerMap(
    contracts: ReadonlyArray<Contract>
  ): ReadonlyMap<string, Customer> {
    const tempMap = groupBy(contracts, "customer_id");
    const outMap = new Map();
    for (const customer_id in tempMap) {
      outMap.set(customer_id, new Customer(customer_id, tempMap[customer_id]));
    }
    return outMap;
  }
}
