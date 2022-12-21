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

// @ts-ignore
import ContractTestCases from "./contract_test_cases";

describe("create_arr_events", () => {
  test("single contract", () => {
    const contracts = ContractTestCases.single_contract;

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
    const contracts = ContractTestCases.single_renewal;

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
    const contracts = ContractTestCases.single_expansion;

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
    const contracts = ContractTestCases.single_downsell;

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

  test("new -> churn -> new", () => {
    const contracts = ContractTestCases.new_churn_new;

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
    const contracts = ContractTestCases.delayed_renewal;

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
    const contracts = ContractTestCases.delayed_expansion;

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
    const contracts = ContractTestCases.delayed_downsell;

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
    const contracts = ContractTestCases.early_renewal;

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
    const contracts = ContractTestCases.early_expansion;

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
    const contracts = ContractTestCases.early_downsell;

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
