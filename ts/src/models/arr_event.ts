import { within_days } from "../dateutils";
import Contract from "./contract";
import {
  ContractEvent,
  ContractEventType,
  create_contract_events,
} from "./contract_event";

const MAX_RENEWAL_GAP_DAYS = 10;

export enum ArrEventType {
  New = "NEW",
  Expansion = "EXPANSION",
  Downsell = "DOWNSELL",
  Churn = "CHURN",
  Renewal = "RENEWAL",
}

interface ArrEventParams {
  contract_event: ContractEvent;
  event_type: ArrEventType;
  arr_change: number;
}

export class ArrEvent {
  readonly contract_event: ContractEvent;
  readonly event_type: ArrEventType;
  readonly arr_change: number;

  constructor({ contract_event, event_type, arr_change }: ArrEventParams) {
    this.contract_event = contract_event;
    this.event_type = event_type;
    this.arr_change = arr_change;
  }

  get event_date(): Date {
    return this.contract_event.event_date;
  }
}

export function create_arr_events(
  contracts: Contract[]
): ReadonlyArray<ArrEvent> {
  const contract_events = create_contract_events(contracts);
  return new ArrEventArrayBuilder().build_array(contract_events);
}

class ArrEventArrayBuilder {
  private arr_events: ArrEvent[] = [];
  private curr_arr: number = 0;

  build_array(
    contract_events: ReadonlyArray<ContractEvent>
  ): ReadonlyArray<ArrEvent> {
    for (const ce of contract_events) {
      this.handle_contract_event(ce);
    }
    return this.arr_events;
  }

  private handle_contract_event(ce: ContractEvent): void {
    if (this.curr_arr < 0) {
      throw new Error("Current arr creating ArrEventStream goes negative");
    }
    switch (ce.event_type) {
      case ContractEventType.Start:
        this.handle_start_contract(ce);
        break;
      case ContractEventType.End:
        this.handle_end_contract(ce);
        break;
      default:
        throw new Error(`Invalid contract event type: ${ce.event_type}`);
    }
  }

  private handle_start_contract(ce: ContractEvent): void {
    // Handle first contract
    if (this.is_first_contract()) {
      this.handle_new_arr(ce);
      return;
    }

    if (this.is_prev_event_churn()) {
      this.handle_prev_churn(ce);
      return;
    }

    if (this.curr_arr <= 0) {
      throw new Error(
        "Current ARR is 0 or less without preceeding churn event"
      );
    }

    this.handle_expansion(ce);
  }

  private handle_end_contract(ce: ContractEvent): void {
    if (!this.get_prev_arr_event())
      throw new Error(
        "Received contract end event and previous ARR event is None"
      );

    if (this.curr_arr == 0)
      throw new Error(
        `Recieved contract end event when current ARR is 0: ${ce}`
      );

    if (this.is_prev_early_renewal(ce)) {
      this.handle_early_renewal(ce);
      return;
    }

    if (this.is_churn(ce)) {
      this.handle_churn(ce);
      return;
    }

    if (this.is_downsell(ce)) {
      this.handle_downsell(ce);
      return;
    }

    throw new Error(
      "Unexpected state - neither churn, early renewal or downsell on ending contract"
    );
  }

  private is_prev_early_renewal(ce: ContractEvent): boolean {
    return this.is_contract_continuous(ce);
  }

  private handle_early_renewal(ce: ContractEvent): void {
    const prev_arr_event = this.get_prev_arr_event();
    if (!prev_arr_event)
      throw new Error(
        "Previous ARR event was null when handling early renewal"
      );
    this.handle_renewal(prev_arr_event.contract_event);
  }

  private is_churn(ce: ContractEvent): boolean {
    return this.curr_arr + ce.arr_change == 0;
  }

  private handle_churn(ce: ContractEvent): void {
    this.arr_events.push(
      new ArrEvent({
        contract_event: ce,
        event_type: ArrEventType.Churn,
        arr_change: -this.curr_arr,
      })
    );
    this.curr_arr = 0;
  }

  private is_downsell(ce: ContractEvent): boolean {
    return ce.arr_change < 0 && this.curr_arr + ce.arr_change > 0;
  }

  private handle_downsell(ce: ContractEvent): void {
    this.arr_events.push(
      new ArrEvent({
        contract_event: ce,
        event_type: ArrEventType.Downsell,
        arr_change: ce.arr_change,
      })
    );
    this.curr_arr += ce.arr_change;
  }

  private is_first_contract(): boolean {
    return this.get_prev_arr_event() === null;
  }

  private get_prev_arr_event(): ArrEvent | null {
    const len = this.arr_events.length;
    if (len === 0) return null;
    return this.arr_events[len - 1];
  }

  private handle_new_arr(ce: ContractEvent) {
    this.arr_events.push(
      new ArrEvent({
        contract_event: ce,
        arr_change: ce.arr_change,
        event_type: ArrEventType.New,
      })
    );
    this.curr_arr += ce.arr_change;
  }

  private is_prev_event_churn(): boolean {
    const prev_event = this.get_prev_arr_event();
    const result = !!prev_event && prev_event.event_type === ArrEventType.Churn;
    if (result && this.curr_arr != 0) {
      throw new Error("Previous event was churn but curr_arr is not 0");
    }
    return result;
  }

  private handle_prev_churn(ce: ContractEvent) {
    if (this.is_contract_continuous(ce)) {
      this.handle_renewal(ce);
      return;
    }
    this.handle_new_arr(ce);
  }

  private is_contract_continuous(ce: ContractEvent): boolean {
    const prev_arr = this.get_prev_arr_event();

    return (
      !!prev_arr &&
      within_days(prev_arr.event_date, ce.event_date, MAX_RENEWAL_GAP_DAYS)
    );
  }

  private handle_renewal(ce: ContractEvent) {
    // Remove the previous churn event
    const prev_arr = this.arr_events.pop();
    if (!prev_arr) throw new Error("Previous ARR is undefined");
    this.curr_arr -= prev_arr.arr_change;
    const next_arr_change = ce.arr_change - this.curr_arr;

    // Append the renewal
    this.arr_events.push(
      new ArrEvent({
        contract_event: ce,
        event_type: ArrEventType.Renewal,
        arr_change: 0,
      })
    );

    // Renewal only
    if (next_arr_change == 0) return;

    // Handle expansion or downsell
    const event_type =
      next_arr_change < 0 ? ArrEventType.Downsell : ArrEventType.Expansion;
    this.arr_events.push(
      new ArrEvent({
        contract_event: ce,
        event_type,
        arr_change: next_arr_change,
      })
    );
    this.curr_arr += next_arr_change;
  }

  private handle_expansion(ce: ContractEvent) {
    this.arr_events.push(
      new ArrEvent({
        contract_event: ce,
        event_type: ArrEventType.Expansion,
        arr_change: ce.arr_change,
      })
    );
    this.curr_arr += ce.arr_change;
  }
}
