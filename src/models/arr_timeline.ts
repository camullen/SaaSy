import { add_days } from "../dateutils";
import { ArrEvent, ArrEventType } from "./arr_event";

export enum IntervalBound {
  Closed = "CLOSED",
  Open = "OPEN",
}

export const MIN_DATE = new Date(-8640000000000000);
export const MAX_DATE = new Date(8640000000000000);

interface ArrIntervalParams {
  readonly left: IntervalBound;
  readonly lower: Date;
  readonly right: IntervalBound;
  readonly upper: Date;
  readonly arr: number;
}

interface ArrIntervalParamsNoBounds {
  readonly lower: Date;
  readonly upper: Date;
  readonly arr: number;
}

export class ArrInterval {
  readonly left: IntervalBound;
  readonly lower: Date;
  readonly right: IntervalBound;
  readonly upper: Date;
  readonly arr: number;

  constructor({ left, lower, right, upper, arr }: ArrIntervalParams) {
    this.left = left;
    this.lower = lower;
    this.right = right;
    this.upper = upper;
    this.arr = arr;
  }

  static open(params: ArrIntervalParamsNoBounds): ArrInterval {
    return new ArrInterval({
      ...params,
      left: IntervalBound.Open,
      right: IntervalBound.Open,
    });
  }

  static closed(params: ArrIntervalParamsNoBounds): ArrInterval {
    return new ArrInterval({
      ...params,
      left: IntervalBound.Closed,
      right: IntervalBound.Closed,
    });
  }

  static closed_open(params: ArrIntervalParamsNoBounds): ArrInterval {
    return new ArrInterval({
      ...params,
      left: IntervalBound.Closed,
      right: IntervalBound.Open,
    });
  }

  replace(params: Partial<ArrIntervalParams>): ArrInterval {
    return new ArrInterval({ ...this, ...params });
  }

  containsDate(d: Date): boolean {
    if (d < this.lower || d > this.upper) return false;
    if (d > this.lower && d < this.upper) return true;
    if (d == this.lower && this.left === IntervalBound.Closed) return true;
    if (d == this.lower && this.left !== IntervalBound.Closed) return false;
    if (d == this.upper && this.right === IntervalBound.Closed) return true;
    if (d == this.upper && this.right !== IntervalBound.Closed) return false;
    throw new Error("Unreachable code");
  }
}

export default class ArrTimeline {
  private interval_array: ArrInterval[] = [];

  constructor(arr_events: ReadonlyArray<ArrEvent>) {
    let curr: ArrEvent | undefined;
    for (const next of arr_events) {
      this.add_arr_event_pair(curr, next);
      curr = next;
    }
    this.add_arr_event_pair(curr, undefined);
  }

  public get_arr_at_date(d: Date): number {
    for (let interval of this.interval_array) {
      if (interval.containsDate(d)) return interval.arr;
    }
    throw new Error("Discontinuous ARR timeline");
  }

  public get_array(): ReadonlyArray<ArrInterval> {
    return this.interval_array;
  }

  private add_arr_event_pair(curr?: ArrEvent, next?: ArrEvent) {
    if (!curr) {
      // First ARR event
      if (!next) throw Error("both curr and next cannot be undefined");
      this.interval_array.push(
        ArrInterval.open({ lower: MIN_DATE, upper: next.event_date, arr: 0 })
      );
    } else if (!next) {
      // Last ARR event
      if (!curr) throw Error("both curr and next cannot be undefined");
      // change last interval to be closed on the right
      const last_interval = this.interval_array.pop();

      this.interval_array.push(
        last_interval!.replace({ right: IntervalBound.Closed })
      );
      this.interval_array.push(
        ArrInterval.open({ lower: curr.event_date, upper: MAX_DATE, arr: 0 })
      );
    } else if (curr.event_type === ArrEventType.Renewal) {
      // If we get a renwal event without a following expansion or downsell we extend the existing interval
      if (
        next.event_type != ArrEventType.Expansion &&
        next.event_type != ArrEventType.Downsell
      ) {
        const last_interval = this.interval_array.pop();
        if (!last_interval)
          throw new Error(
            "Current interval should not be undefined with a 0 ARR change"
          );
        this.interval_array.push(
          last_interval.replace({ upper: next.event_date })
        );
      } else {
        // Do nothing for a renewal followed by an expansion or downsell
      }
    } else if (curr.event_type === ArrEventType.Churn) {
      // Fix previous interval to have upper bound be open but one day ahead
      const last_interval = this.interval_array.pop();
      this.interval_array.push(
        last_interval!.replace({
          upper: add_days(last_interval!.upper, 1),
        })
      );

      this.interval_array.push(
        ArrInterval.closed_open({
          lower: add_days(curr.event_date, 1),
          upper: next.event_date,
          arr: 0,
        })
      );
    } else {
      const last_interval = this.interval_array[this.interval_array.length - 1];
      const new_arr = last_interval.arr + curr.arr_change;

      // TODO: Fix
      this.interval_array.push(
        ArrInterval.closed_open({
          lower: curr.event_date,
          upper: next.event_date,
          arr: new_arr,
        })
      );
    }
  }
}
