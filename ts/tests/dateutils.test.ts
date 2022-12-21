import { describe, expect, test } from '@jest/globals';
import { yearfrac, mround } from "../src/dateutils";

describe('yearfrac function', () => {
  test('calculates 1.5 from 2020-01-01 to 2021-06-15', () => {
    expect(yearfrac(new Date('2020-01-01'), new Date('2021-06-15'))).toEqual(1.5)
  })
})

describe('mround function', () => {
  test('rounds a number to 1 decimal place', () => {
    expect(mround(1.56, 1)).toEqual(1.6)
  })
})