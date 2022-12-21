import { describe, expect, test } from "@jest/globals";
import {
  ArrEvent,
  ArrEventType,
  create_arr_events,
} from "../../src/models/arr_event";
import Contract from "../../src/models/contract";
import {
  ContractEvent,
  ContractEventType,
} from "../../src/models/contract_event";

describe("create_arr_events", () => {
  test("single contract", () => {
    const contracts = [
      new Contract({
        customer_id: "a",
        start_date: new Date("2020-01-01"),
        end_date: new Date("2020-12-31"),
        tcv: 100,
      }),
    ];

    const expected = [
      new ArrEvent({
        contract_event: new ContractEvent({
          contract: contracts[0],
          event_type: ContractEventType.Start,
        }),
        event_type: ArrEventType.New,
        arr_change: 100,
      }),
      new ArrEvent({
        contract_event: new ContractEvent({
          contract: contracts[0],
          event_type: ContractEventType.End,
        }),
        event_type: ArrEventType.Churn,
        arr_change: -100,
      }),
    ];

    expect(create_arr_events(contracts)).toEqual(expected);
  });

  test("single renewal", () => {
    const contracts = [
      new Contract({
        customer_id: "a",
        start_date: new Date("2020-01-01"),
        end_date: new Date("2020-12-31"),
        tcv: 100,
      }),
      new Contract({
        customer_id: "a",
        start_date: new Date("2021-01-01"),
        end_date: new Date("2021-12-31"),
        tcv: 100,
      }),
    ];

    const expected = [
      new ArrEvent({
        contract_event: new ContractEvent({
          contract: contracts[0],
          event_type: ContractEventType.Start,
        }),
        event_type: ArrEventType.New,
        arr_change: 100,
      }),
      new ArrEvent({
        contract_event: new ContractEvent({
          contract: contracts[1],
          event_type: ContractEventType.Start,
        }),
        event_type: ArrEventType.Renewal,
        arr_change: 0,
      }),
      new ArrEvent({
        contract_event: new ContractEvent({
          contract: contracts[1],
          event_type: ContractEventType.End,
        }),
        event_type: ArrEventType.Churn,
        arr_change: -100,
      }),
    ];

    const actual = create_arr_events(contracts);
    // console.log("Actual: ", actual);

    expect(actual).toEqual(expected);
  });

  test("single expansion", () => {
    const contracts = [
      new Contract({
        customer_id: "a",
        start_date: new Date("2020-01-01"),
        end_date: new Date("2020-12-31"),
        tcv: 100,
      }),
      new Contract({
        customer_id: "a",
        start_date: new Date("2021-01-01"),
        end_date: new Date("2021-12-31"),
        tcv: 150,
      }),
    ];

    const expected = [
      new ArrEvent({
        contract_event: new ContractEvent({
          contract: contracts[0],
          event_type: ContractEventType.Start,
        }),
        event_type: ArrEventType.New,
        arr_change: 100,
      }),
      new ArrEvent({
        contract_event: new ContractEvent({
          contract: contracts[1],
          event_type: ContractEventType.Start,
        }),
        event_type: ArrEventType.Renewal,
        arr_change: 0,
      }),
      new ArrEvent({
        contract_event: new ContractEvent({
          contract: contracts[1],
          event_type: ContractEventType.Start,
        }),
        event_type: ArrEventType.Expansion,
        arr_change: 50,
      }),
      new ArrEvent({
        contract_event: new ContractEvent({
          contract: contracts[1],
          event_type: ContractEventType.End,
        }),
        event_type: ArrEventType.Churn,
        arr_change: -150,
      }),
    ];

    const actual = create_arr_events(contracts);

    expect(actual).toEqual(expected);
  });

  test("single downsell", () => {
    const contracts = [
      new Contract({
        customer_id: "a",
        start_date: new Date("2020-01-01"),
        end_date: new Date("2020-12-31"),
        tcv: 100,
      }),
      new Contract({
        customer_id: "a",
        start_date: new Date("2021-01-01"),
        end_date: new Date("2021-12-31"),
        tcv: 75,
      }),
    ];

    const expected = [
      new ArrEvent({
        contract_event: new ContractEvent({
          contract: contracts[0],
          event_type: ContractEventType.Start,
        }),
        event_type: ArrEventType.New,
        arr_change: 100,
      }),
      new ArrEvent({
        contract_event: new ContractEvent({
          contract: contracts[1],
          event_type: ContractEventType.Start,
        }),
        event_type: ArrEventType.Renewal,
        arr_change: 0,
      }),
      new ArrEvent({
        contract_event: new ContractEvent({
          contract: contracts[1],
          event_type: ContractEventType.Start,
        }),
        event_type: ArrEventType.Downsell,
        arr_change: -25,
      }),
      new ArrEvent({
        contract_event: new ContractEvent({
          contract: contracts[1],
          event_type: ContractEventType.End,
        }),
        event_type: ArrEventType.Churn,
        arr_change: -75,
      }),
    ];

    const actual = create_arr_events(contracts);

    expect(actual).toEqual(expected);
  });

  test("single new -> churn -> new", () => {
    const contracts = [
      new Contract({
        customer_id: "a",
        start_date: new Date("2020-01-01"),
        end_date: new Date("2020-12-31"),
        tcv: 100,
      }),
      new Contract({
        customer_id: "a",
        start_date: new Date("2021-06-01"),
        end_date: new Date("2022-05-31"),
        tcv: 200,
      }),
    ];

    const expected = [
      new ArrEvent({
        contract_event: new ContractEvent({
          contract: contracts[0],
          event_type: ContractEventType.Start,
        }),
        event_type: ArrEventType.New,
        arr_change: 100,
      }),
      new ArrEvent({
        contract_event: new ContractEvent({
          contract: contracts[0],
          event_type: ContractEventType.End,
        }),
        event_type: ArrEventType.Churn,
        arr_change: -100,
      }),
      new ArrEvent({
        contract_event: new ContractEvent({
          contract: contracts[1],
          event_type: ContractEventType.Start,
        }),
        event_type: ArrEventType.New,
        arr_change: 200,
      }),
      new ArrEvent({
        contract_event: new ContractEvent({
          contract: contracts[1],
          event_type: ContractEventType.End,
        }),
        event_type: ArrEventType.Churn,
        arr_change: -200,
      }),
    ];

    const actual = create_arr_events(contracts);

    expect(actual).toEqual(expected);
  });

  test("delayed renewal", () => {
    const contracts = [
      new Contract({
        customer_id: "a",
        start_date: new Date("2020-01-01"),
        end_date: new Date("2020-12-31"),
        tcv: 100,
      }),
      new Contract({
        customer_id: "a",
        start_date: new Date("2021-01-05"),
        end_date: new Date("2021-12-31"),
        tcv: 100,
      }),
    ];

    const expected = [
      new ArrEvent({
        contract_event: new ContractEvent({
          contract: contracts[0],
          event_type: ContractEventType.Start,
        }),
        event_type: ArrEventType.New,
        arr_change: 100,
      }),
      new ArrEvent({
        contract_event: new ContractEvent({
          contract: contracts[1],
          event_type: ContractEventType.Start,
        }),
        event_type: ArrEventType.Renewal,
        arr_change: 0,
      }),
      new ArrEvent({
        contract_event: new ContractEvent({
          contract: contracts[1],
          event_type: ContractEventType.End,
        }),
        event_type: ArrEventType.Churn,
        arr_change: -100,
      }),
    ];

    const actual = create_arr_events(contracts);
    // console.log("Actual: ", actual);

    expect(actual).toEqual(expected);
  });

  test("delayed expansion", () => {
    const contracts = [
      new Contract({
        customer_id: "a",
        start_date: new Date("2020-01-01"),
        end_date: new Date("2020-12-31"),
        tcv: 100,
      }),
      new Contract({
        customer_id: "a",
        start_date: new Date("2021-01-05"),
        end_date: new Date("2021-12-31"),
        tcv: 150,
      }),
    ];

    const expected = [
      new ArrEvent({
        contract_event: new ContractEvent({
          contract: contracts[0],
          event_type: ContractEventType.Start,
        }),
        event_type: ArrEventType.New,
        arr_change: 100,
      }),
      new ArrEvent({
        contract_event: new ContractEvent({
          contract: contracts[1],
          event_type: ContractEventType.Start,
        }),
        event_type: ArrEventType.Renewal,
        arr_change: 0,
      }),
      new ArrEvent({
        contract_event: new ContractEvent({
          contract: contracts[1],
          event_type: ContractEventType.Start,
        }),
        event_type: ArrEventType.Expansion,
        arr_change: 50,
      }),
      new ArrEvent({
        contract_event: new ContractEvent({
          contract: contracts[1],
          event_type: ContractEventType.End,
        }),
        event_type: ArrEventType.Churn,
        arr_change: -150,
      }),
    ];

    const actual = create_arr_events(contracts);

    expect(actual).toEqual(expected);
  });

  test("delayed downsell", () => {
    const contracts = [
      new Contract({
        customer_id: "a",
        start_date: new Date("2020-01-01"),
        end_date: new Date("2020-12-31"),
        tcv: 100,
      }),
      new Contract({
        customer_id: "a",
        start_date: new Date("2021-01-05"),
        end_date: new Date("2021-12-31"),
        tcv: 75,
      }),
    ];

    const expected = [
      new ArrEvent({
        contract_event: new ContractEvent({
          contract: contracts[0],
          event_type: ContractEventType.Start,
        }),
        event_type: ArrEventType.New,
        arr_change: 100,
      }),
      new ArrEvent({
        contract_event: new ContractEvent({
          contract: contracts[1],
          event_type: ContractEventType.Start,
        }),
        event_type: ArrEventType.Renewal,
        arr_change: 0,
      }),
      new ArrEvent({
        contract_event: new ContractEvent({
          contract: contracts[1],
          event_type: ContractEventType.Start,
        }),
        event_type: ArrEventType.Downsell,
        arr_change: -25,
      }),
      new ArrEvent({
        contract_event: new ContractEvent({
          contract: contracts[1],
          event_type: ContractEventType.End,
        }),
        event_type: ArrEventType.Churn,
        arr_change: -75,
      }),
    ];

    const actual = create_arr_events(contracts);

    expect(actual).toEqual(expected);
  });

  test("early renewal", () => {
    const contracts = [
      new Contract({
        customer_id: "a",
        start_date: new Date("2020-01-01"),
        end_date: new Date("2020-12-31"),
        tcv: 100,
      }),
      new Contract({
        customer_id: "a",
        start_date: new Date("2020-12-30"),
        end_date: new Date("2021-12-31"),
        tcv: 100,
      }),
    ];

    const expected = [
      new ArrEvent({
        contract_event: new ContractEvent({
          contract: contracts[0],
          event_type: ContractEventType.Start,
        }),
        event_type: ArrEventType.New,
        arr_change: 100,
      }),
      new ArrEvent({
        contract_event: new ContractEvent({
          contract: contracts[1],
          event_type: ContractEventType.Start,
        }),
        event_type: ArrEventType.Renewal,
        arr_change: 0,
      }),
      new ArrEvent({
        contract_event: new ContractEvent({
          contract: contracts[1],
          event_type: ContractEventType.End,
        }),
        event_type: ArrEventType.Churn,
        arr_change: -100,
      }),
    ];

    const actual = create_arr_events(contracts);
    // console.log("Actual: ", actual);

    expect(actual).toEqual(expected);
  });

  test("early expansion", () => {
    const contracts = [
      new Contract({
        customer_id: "a",
        start_date: new Date("2020-01-01"),
        end_date: new Date("2020-12-31"),
        tcv: 100,
      }),
      new Contract({
        customer_id: "a",
        start_date: new Date("2020-12-30"),
        end_date: new Date("2021-12-31"),
        tcv: 150,
      }),
    ];

    const expected = [
      new ArrEvent({
        contract_event: new ContractEvent({
          contract: contracts[0],
          event_type: ContractEventType.Start,
        }),
        event_type: ArrEventType.New,
        arr_change: 100,
      }),
      new ArrEvent({
        contract_event: new ContractEvent({
          contract: contracts[1],
          event_type: ContractEventType.Start,
        }),
        event_type: ArrEventType.Renewal,
        arr_change: 0,
      }),
      new ArrEvent({
        contract_event: new ContractEvent({
          contract: contracts[1],
          event_type: ContractEventType.Start,
        }),
        event_type: ArrEventType.Expansion,
        arr_change: 50,
      }),
      new ArrEvent({
        contract_event: new ContractEvent({
          contract: contracts[1],
          event_type: ContractEventType.End,
        }),
        event_type: ArrEventType.Churn,
        arr_change: -150,
      }),
    ];

    const actual = create_arr_events(contracts);

    expect(actual).toEqual(expected);
  });

  test("early downsell", () => {
    const contracts = [
      new Contract({
        customer_id: "a",
        start_date: new Date("2020-01-01"),
        end_date: new Date("2020-12-31"),
        tcv: 100,
      }),
      new Contract({
        customer_id: "a",
        start_date: new Date("2020-12-30"),
        end_date: new Date("2021-12-31"),
        tcv: 75,
      }),
    ];

    const expected = [
      new ArrEvent({
        contract_event: new ContractEvent({
          contract: contracts[0],
          event_type: ContractEventType.Start,
        }),
        event_type: ArrEventType.New,
        arr_change: 100,
      }),
      new ArrEvent({
        contract_event: new ContractEvent({
          contract: contracts[1],
          event_type: ContractEventType.Start,
        }),
        event_type: ArrEventType.Renewal,
        arr_change: 0,
      }),
      new ArrEvent({
        contract_event: new ContractEvent({
          contract: contracts[1],
          event_type: ContractEventType.Start,
        }),
        event_type: ArrEventType.Downsell,
        arr_change: -25,
      }),
      new ArrEvent({
        contract_event: new ContractEvent({
          contract: contracts[1],
          event_type: ContractEventType.End,
        }),
        event_type: ArrEventType.Churn,
        arr_change: -75,
      }),
    ];

    const actual = create_arr_events(contracts);

    expect(actual).toEqual(expected);
  });
});
