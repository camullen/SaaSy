import Contract from "./contract";

export enum ContractEventType {
  Start = "START",
  End = "END",
}

interface ContractEventParams {
  readonly contract: Contract;
  readonly event_type: ContractEventType;
}

export class ContractEvent {
  readonly contract: Contract;
  readonly event_type: ContractEventType;

  constructor({ contract, event_type }: ContractEventParams) {
    this.contract = contract;
    this.event_type = event_type;
  }

  get event_date(): Date {
    if (this.event_type === ContractEventType.Start) {
      return this.contract.start_date;
    }
    return this.contract.end_date;
  }

  get acv(): number {
    return this.contract.acv;
  }

  get arr_change(): number {
    if (this.event_type === ContractEventType.Start) {
      return this.acv;
    }
    return -this.acv;
  }

  public static cmp(a: ContractEvent, b: ContractEvent): number {
    if (a.event_date < b.event_date) return -1;
    if (a.event_date > b.event_date) return 1;

    // Event dates are equal, so look at types
    // We want contract end events to be emitted before start events
    if (a.event_type === b.event_type) return 0;
    if (a.event_type === ContractEventType.End) return -1;
    return 1;
  }
}

export function create_contract_events(
  contracts: Iterable<Contract>
): ReadonlyArray<ContractEvent> {
  const event_array = [];
  for (const contract of contracts) {
    event_array.push(
      new ContractEvent({ contract, event_type: ContractEventType.Start })
    );
    event_array.push(
      new ContractEvent({ contract, event_type: ContractEventType.End })
    );
  }
  return event_array;
}

// export class ContractEventStream {
//   private readonly contract_events: ContractEvent[]

//   constructor(contracts: Iterable<Contract>) {
//     this.contract_events = [];
//     for(const contract of contracts) {
//       this.contract_events.push(new ContractEvent(contract, ContractEventType.Start))
//       this.contract_events.push(new ContractEvent(contract, ContractEventType.End))
//     }
//   }

// }
