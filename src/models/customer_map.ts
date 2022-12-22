import groupBy from "lodash.groupby";
import Contract from "./contract";
import Customer from "./customer";

export default class CustomerMap implements ReadonlyMap<string, Customer> {
  private internal_map: Map<string, Customer> = new Map();
  readonly contracts: ReadonlyArray<Contract>;

  constructor(contracts: ReadonlyArray<Contract>) {
    this.contracts = contracts;
    const tempMap = groupBy(contracts, "customer_id");
    for (const customer_id in tempMap) {
      this.internal_map.set(
        customer_id,
        new Customer(customer_id, tempMap[customer_id])
      );
    }
  }

  get size(): number {
    return this.internal_map.size;
  }

  forEach(
    callbackfn: (
      value: Customer,
      key: string,
      map: ReadonlyMap<string, Customer>
    ) => void,
    thisArg?: any
  ): void {
    this.internal_map.forEach(callbackfn, thisArg);
  }

  get(key: string): Customer | undefined {
    return this.internal_map.get(key);
  }
  has(key: string): boolean {
    return this.internal_map.has(key);
  }

  entries(): IterableIterator<[string, Customer]> {
    return this.internal_map.entries();
  }
  keys(): IterableIterator<string> {
    return this.internal_map.keys();
  }
  values(): IterableIterator<Customer> {
    return this.internal_map.values();
  }
  [Symbol.iterator](): IterableIterator<[string, Customer]> {
    return this.internal_map[Symbol.iterator]();
  }
}
