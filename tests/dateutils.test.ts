import { describe, expect, test } from "@jest/globals";
import {
  yearfrac,
  mround,
  within_days,
  DateRange,
  Period,
  Periodicity,
  create_period_array,
} from "../src/dateutils";

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

describe("create_period_array function", () => {
  describe("yearly", () => {
    test("generates an array of the proper years", () => {
      const date_range: DateRange = {
        min: new Date("2019-06-15"),
        max: new Date("2023-02-14"),
      };

      const expected: Period[] = [
        {
          start: new Date("2019-01-01"),
          end: new Date("2019-12-31"),
          periodicity: Periodicity.Yearly,
          label: "2019",
        },
        {
          start: new Date("2020-01-01"),
          end: new Date("2020-12-31"),
          periodicity: Periodicity.Yearly,
          label: "2020",
        },
        {
          start: new Date("2021-01-01"),
          end: new Date("2021-12-31"),
          periodicity: Periodicity.Yearly,
          label: "2021",
        },
        {
          start: new Date("2022-01-01"),
          end: new Date("2022-12-31"),
          periodicity: Periodicity.Yearly,
          label: "2022",
        },
        {
          start: new Date("2023-01-01"),
          end: new Date("2023-12-31"),
          periodicity: Periodicity.Yearly,
          label: "2023",
        },
      ];

      const actual = create_period_array(date_range, Periodicity.Yearly);
      expect(actual).toEqual(expected);
    });
  });

  describe("quarterly", () => {
    test("generates an array of the proper years", () => {
      const date_range: DateRange = {
        min: new Date("2021-06-15"),
        max: new Date("2023-02-14"),
      };

      const expected: Period[] = [
        {
          start: new Date("2021-04-01"),
          end: new Date("2021-06-30"),
          periodicity: Periodicity.Quarterly,
          label: "Q2 2021",
        },
        {
          start: new Date("2021-07-01"),
          end: new Date("2021-09-30"),
          periodicity: Periodicity.Quarterly,
          label: "Q3 2021",
        },
        {
          start: new Date("2021-10-01"),
          end: new Date("2021-12-31"),
          periodicity: Periodicity.Quarterly,
          label: "Q4 2021",
        },
        {
          start: new Date("2022-01-01"),
          end: new Date("2022-03-31"),
          periodicity: Periodicity.Quarterly,
          label: "Q1 2022",
        },
        {
          start: new Date("2022-04-01"),
          end: new Date("2022-06-30"),
          periodicity: Periodicity.Quarterly,
          label: "Q2 2022",
        },
        {
          start: new Date("2022-07-01"),
          end: new Date("2022-09-30"),
          periodicity: Periodicity.Quarterly,
          label: "Q3 2022",
        },
        {
          start: new Date("2022-10-01"),
          end: new Date("2022-12-31"),
          periodicity: Periodicity.Quarterly,
          label: "Q4 2022",
        },
        {
          start: new Date("2023-01-01"),
          end: new Date("2023-03-31"),
          periodicity: Periodicity.Quarterly,
          label: "Q1 2023",
        },
      ];

      const actual = create_period_array(date_range, Periodicity.Quarterly);
      expect(actual).toEqual(expected);
    });
  });

  describe("monthly", () => {
    test("generates an array of the proper years", () => {
      const date_range: DateRange = {
        min: new Date("2021-06-15"),
        max: new Date("2022-02-14"),
      };

      const expected: Period[] = [
        {
          start: new Date("2021-06-01"),
          end: new Date("2021-06-30"),
          periodicity: Periodicity.Monthly,
          label: "Jun 2021",
        },
        {
          start: new Date("2021-07-01"),
          end: new Date("2021-07-31"),
          periodicity: Periodicity.Monthly,
          label: "Jul 2021",
        },
        {
          start: new Date("2021-08-01"),
          end: new Date("2021-08-31"),
          periodicity: Periodicity.Monthly,
          label: "Aug 2021",
        },
        {
          start: new Date("2021-09-01"),
          end: new Date("2021-09-30"),
          periodicity: Periodicity.Monthly,
          label: "Sep 2021",
        },
        {
          start: new Date("2021-10-01"),
          end: new Date("2021-10-31"),
          periodicity: Periodicity.Monthly,
          label: "Oct 2021",
        },
        {
          start: new Date("2021-11-01"),
          end: new Date("2021-11-30"),
          periodicity: Periodicity.Monthly,
          label: "Nov 2021",
        },
        {
          start: new Date("2021-12-01"),
          end: new Date("2021-12-31"),
          periodicity: Periodicity.Monthly,
          label: "Dec 2021",
        },
        {
          start: new Date("2022-01-01"),
          end: new Date("2022-01-31"),
          periodicity: Periodicity.Monthly,
          label: "Jan 2022",
        },
        {
          start: new Date("2022-02-01"),
          end: new Date("2022-02-28"),
          periodicity: Periodicity.Monthly,
          label: "Feb 2022",
        },
      ];

      const actual = create_period_array(date_range, Periodicity.Monthly);
      expect(actual).toEqual(expected);
    });
  });
});
