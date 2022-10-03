use chrono::naive::NaiveDate;
use serde::Deserialize;

pub struct Contract<'a> {
    customer: &'a Customer<'a>,
    start_date: NaiveDate,
    end_date: NaiveDate,
    tcv: f64,
}

pub struct Customer<'a> {
    id: String,
    contracts: Vec<Contract<'a>>,
}

#[derive(Debug, Deserialize)]
pub struct ContractRecord {
    customer_id: String,
    start_date: String,
    end_date: String,
    tcv: f64,
}

// impl<'a> Customer<'a> {
//     pub fn new(id: String) -> Self {
//         Customer {
//             id,
//             contracts: vec![],
//         }
//     }
// }
