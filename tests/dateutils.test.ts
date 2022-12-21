import { describe, expect, test } from "@jest/globals";
import { yearfrac, mround, within_days } from "../src/dateutils";

describe("yearfrac function", () => {
  test("calculates 1.5 from 2020-01-01 to 2021-06-15", () => {
    expect(yearfrac(new Date("2020-01-01"), new Date("2021-06-15"))).toEqual(
      1.5
    );
  });
});

describe("mround function", () => {
  test("rounds a number to 1 decimal place", () => {
    expect(mround(1.56, 1)).toEqual(1.6);
  });
});

describe("within_days function", () => {
  test("calculates that 2020-01-01 is within 10 days from 2020-01-11", () => {
    expect(
      within_days(new Date("2020-01-01"), new Date("2020-01-11"), 10)
    ).toBe(true);
  });

  test("#reversed calculates that 2020-01-01 is within 10 days from 2020-01-11", () => {
    expect(
      within_days(new Date("2020-01-11"), new Date("2020-01-01"), 10)
    ).toBe(true);
  });

  test("calculates that 2020-01-01 is NOT within 10 days from 2020-01-12", () => {
    expect(
      within_days(new Date("2020-01-01"), new Date("2020-01-12"), 10)
    ).toBe(false);
  });

  test("#reversed calculates that 2020-01-01 is NOT within 10 days from 2020-01-12", () => {
    expect(
      within_days(new Date("2020-01-12"), new Date("2020-01-01"), 10)
    ).toBe(false);
  });
});
