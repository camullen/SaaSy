import { yearfrac } from "../dateutils";

interface ContractParams {
  readonly customer_id: string;
  readonly start_date: Date;
  readonly end_date: Date;
  readonly tcv: number;
}

export default class Contract {
  readonly customer_id: string;
  readonly start_date: Date;
  readonly end_date: Date;
  readonly tcv: number;

  constructor({ customer_id, start_date, end_date, tcv }: ContractParams) {
    this.customer_id = customer_id;
    this.start_date = start_date;
    this.end_date = end_date;
    this.tcv = tcv;
  }

  len_years(): number {
    return yearfrac(this.start_date, this.end_date);
  }

  get acv(): number {
    return this.tcv / this.len_years();
  }
}
