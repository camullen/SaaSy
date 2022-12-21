import Contract from "../../src/models/contract";

const ContractTestCases = {
  single_contract: [
    new Contract({
      customer_id: "a",
      start_date: new Date("2020-01-01"),
      end_date: new Date("2020-12-31"),
      tcv: 100,
    }),
  ],

  single_renewal: [
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
  ],

  single_expansion: [
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
  ],

  single_downsell: [
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
  ],

  new_churn_new: [
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
  ],

  delayed_renewal: [
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
  ],

  delayed_expansion: [
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
  ],

  delayed_downsell: [
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
  ],

  early_renewal: [
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
  ],

  early_expansion: [
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
  ],

  early_downsell: [
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
  ],
};

export default ContractTestCases;
