import { describe, expect, test } from "@jest/globals";
import { create_arr_events } from "../../src/models/arr_event";
import ArrTimeline, {
  ArrInterval,
  MAX_DATE,
  MIN_DATE,
} from "../../src/models/arr_timeline";
import ContractTestCases from "./contract_test_cases";

describe("ArrTimeline creation", () => {
  test("single contract", () => {
    const contracts = ContractTestCases.single_contract;

    const expected = [
      ArrInterval.open({
        lower: MIN_DATE,
        upper: new Date("2020-01-01"),
        arr: 0,
      }),
      ArrInterval.closed({
        lower: new Date("2020-01-01"),
        upper: new Date("2020-12-31"),
        arr: 100,
      }),
      ArrInterval.open({
        lower: new Date("2020-12-31"),
        upper: MAX_DATE,
        arr: 0,
      }),
    ];

    const actual = new ArrTimeline(create_arr_events(contracts)).get_array();

    expect(actual).toEqual(expected);
  });

  test("single renewal", () => {
    const contracts = ContractTestCases.single_renewal;

    const expected = [
      ArrInterval.open({
        lower: MIN_DATE,
        upper: new Date("2020-01-01"),
        arr: 0,
      }),
      ArrInterval.closed({
        lower: new Date("2020-01-01"),
        upper: new Date("2021-12-31"),
        arr: 100,
      }),
      ArrInterval.open({
        lower: new Date("2021-12-31"),
        upper: MAX_DATE,
        arr: 0,
      }),
    ];

    const actual = new ArrTimeline(create_arr_events(contracts)).get_array();

    expect(actual).toEqual(expected);
  });

  test("single expansion", () => {
    const contracts = ContractTestCases.single_expansion;

    const expected = [
      ArrInterval.open({
        lower: MIN_DATE,
        upper: new Date("2020-01-01"),
        arr: 0,
      }),
      ArrInterval.closed_open({
        lower: new Date("2020-01-01"),
        upper: new Date("2021-01-01"),
        arr: 100,
      }),
      ArrInterval.closed({
        lower: new Date("2021-01-01"),
        upper: new Date("2021-12-31"),
        arr: 150,
      }),
      ArrInterval.open({
        lower: new Date("2021-12-31"),
        upper: MAX_DATE,
        arr: 0,
      }),
    ];

    const actual = new ArrTimeline(create_arr_events(contracts)).get_array();

    expect(actual).toEqual(expected);
  });

  test("single downsell", () => {
    const contracts = ContractTestCases.single_downsell;

    const expected = [
      ArrInterval.open({
        lower: MIN_DATE,
        upper: new Date("2020-01-01"),
        arr: 0,
      }),
      ArrInterval.closed_open({
        lower: new Date("2020-01-01"),
        upper: new Date("2021-01-01"),
        arr: 100,
      }),
      ArrInterval.closed({
        lower: new Date("2021-01-01"),
        upper: new Date("2021-12-31"),
        arr: 75,
      }),
      ArrInterval.open({
        lower: new Date("2021-12-31"),
        upper: MAX_DATE,
        arr: 0,
      }),
    ];

    const actual = new ArrTimeline(create_arr_events(contracts)).get_array();

    expect(actual).toEqual(expected);
  });

  test("new churn new", () => {
    const contracts = ContractTestCases.new_churn_new;

    const expected = [
      ArrInterval.open({
        lower: MIN_DATE,
        upper: new Date("2020-01-01"),
        arr: 0,
      }),
      ArrInterval.closed_open({
        lower: new Date("2020-01-01"),
        upper: new Date("2021-01-01"),
        arr: 100,
      }),
      ArrInterval.closed_open({
        lower: new Date("2021-01-01"),
        upper: new Date("2021-06-01"),
        arr: 0,
      }),
      ArrInterval.closed({
        lower: new Date("2021-06-01"),
        upper: new Date("2022-05-31"),
        arr: 200,
      }),
      ArrInterval.open({
        lower: new Date("2022-05-31"),
        upper: MAX_DATE,
        arr: 0,
      }),
    ];

    const actual = new ArrTimeline(create_arr_events(contracts)).get_array();

    expect(actual).toEqual(expected);
  });

  test("delayed renewal", () => {
    const contracts = ContractTestCases.delayed_renewal;

    const expected = [
      ArrInterval.open({
        lower: MIN_DATE,
        upper: new Date("2020-01-01"),
        arr: 0,
      }),
      ArrInterval.closed({
        lower: new Date("2020-01-01"),
        upper: new Date("2021-12-31"),
        arr: 100,
      }),
      ArrInterval.open({
        lower: new Date("2021-12-31"),
        upper: MAX_DATE,
        arr: 0,
      }),
    ];

    const actual = new ArrTimeline(create_arr_events(contracts)).get_array();

    expect(actual).toEqual(expected);
  });

  test("delayed expansion", () => {
    const contracts = ContractTestCases.delayed_expansion;

    const expected = [
      ArrInterval.open({
        lower: MIN_DATE,
        upper: new Date("2020-01-01"),
        arr: 0,
      }),
      ArrInterval.closed_open({
        lower: new Date("2020-01-01"),
        upper: new Date("2021-01-05"),
        arr: 100,
      }),
      ArrInterval.closed({
        lower: new Date("2021-01-05"),
        upper: new Date("2021-12-31"),
        arr: 150,
      }),
      ArrInterval.open({
        lower: new Date("2021-12-31"),
        upper: MAX_DATE,
        arr: 0,
      }),
    ];

    const actual = new ArrTimeline(create_arr_events(contracts)).get_array();

    expect(actual).toEqual(expected);
  });

  test("delayed downsell", () => {
    const contracts = ContractTestCases.delayed_downsell;

    // TODO: reconsider if this is what we want to get back
    const expected = [
      ArrInterval.open({
        lower: MIN_DATE,
        upper: new Date("2020-01-01"),
        arr: 0,
      }),
      ArrInterval.closed_open({
        lower: new Date("2020-01-01"),
        upper: new Date("2021-01-05"),
        arr: 100,
      }),
      ArrInterval.closed({
        lower: new Date("2021-01-05"),
        upper: new Date("2021-12-31"),
        arr: 75,
      }),
      ArrInterval.open({
        lower: new Date("2021-12-31"),
        upper: MAX_DATE,
        arr: 0,
      }),
    ];

    const actual = new ArrTimeline(create_arr_events(contracts)).get_array();

    expect(actual).toEqual(expected);
  });

  test("early renewal", () => {
    const contracts = ContractTestCases.early_renewal;

    const expected = [
      ArrInterval.open({
        lower: MIN_DATE,
        upper: new Date("2020-01-01"),
        arr: 0,
      }),
      ArrInterval.closed({
        lower: new Date("2020-01-01"),
        upper: new Date("2021-12-31"),
        arr: 100,
      }),
      ArrInterval.open({
        lower: new Date("2021-12-31"),
        upper: MAX_DATE,
        arr: 0,
      }),
    ];

    const actual = new ArrTimeline(create_arr_events(contracts)).get_array();

    expect(actual).toEqual(expected);
  });
});

test("early expansion", () => {
  const contracts = ContractTestCases.early_expansion;

  const expected = [
    ArrInterval.open({
      lower: MIN_DATE,
      upper: new Date("2020-01-01"),
      arr: 0,
    }),
    ArrInterval.closed_open({
      lower: new Date("2020-01-01"),
      upper: new Date("2020-12-30"),
      arr: 100,
    }),
    ArrInterval.closed({
      lower: new Date("2020-12-30"),
      upper: new Date("2021-12-31"),
      arr: 150,
    }),
    ArrInterval.open({
      lower: new Date("2021-12-31"),
      upper: MAX_DATE,
      arr: 0,
    }),
  ];

  const actual = new ArrTimeline(create_arr_events(contracts)).get_array();

  expect(actual).toEqual(expected);
});

test("early downsell", () => {
  const contracts = ContractTestCases.early_downsell;

  const expected = [
    ArrInterval.open({
      lower: MIN_DATE,
      upper: new Date("2020-01-01"),
      arr: 0,
    }),
    ArrInterval.closed_open({
      lower: new Date("2020-01-01"),
      upper: new Date("2020-12-30"),
      arr: 100,
    }),
    ArrInterval.closed({
      lower: new Date("2020-12-30"),
      upper: new Date("2021-12-31"),
      arr: 75,
    }),
    ArrInterval.open({
      lower: new Date("2021-12-31"),
      upper: MAX_DATE,
      arr: 0,
    }),
  ];

  const actual = new ArrTimeline(create_arr_events(contracts)).get_array();

  expect(actual).toEqual(expected);
});
