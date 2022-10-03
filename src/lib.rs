use std::collections::HashMap;
use std::collections::hash_map::Entry::{Occupied, Vacant};
use chrono::naive::NaiveDate;
use serde::Deserialize;

pub struct Contract {
    customer_id: String,
    start_date: NaiveDate,
    end_date: NaiveDate,
    tcv: f64,
}

pub struct Customer {
    id: String,
    contracts: Vec<Contract>,
}

#[derive(Debug, Deserialize)]
pub struct ContractRecord {
    customer_id: String,
    start_date: NaiveDate,
    end_date: NaiveDate,
    tcv: f64,
}

pub struct SaasData {
    customers: HashMap<String, Customer>
}

impl SaasData {
    pub fn new<T: IntoIterator<Item = ContractRecord>>(data_iter: T) -> Self {
        let mut data = SaasData { customers: HashMap::new() };
        for record in data_iter {
            data.add_contract_record(record);
        }
        data
    }

    fn add_contract_record(&mut self, record: ContractRecord) {
        let mut customer = self.get_or_create_customer(&record.customer_id);
        customer.add_contract_record(record);
    }

    fn get_or_create_customer(&mut self, customer_id: &str) -> &mut Customer {
        match self.customers.entry(customer_id.to_string()) {
            Vacant(entry) => entry.insert(Customer::new(customer_id)),
            Occupied(entry) => entry.into_mut(),
        }
    }
}

impl Customer {
    fn new(customer_id: &str) -> Self {
        Customer {id: customer_id.to_string(), contracts: vec![] }
    }

    fn add_contract_record(&mut self, record: ContractRecord) {
        self.contracts.push(Contract::from(record));
    }
}



impl From<ContractRecord> for Contract {
    fn from(r : ContractRecord) -> Self {
        Contract { customer_id: r.customer_id, start_date: r.start_date, end_date: r.end_date, tcv: r.tcv }
    }
}



// impl<'a> Customer<'a> {
//     pub fn new(id: String) -> Self {
//         Customer {
//             id,
//             contracts: vec![],
//         }
//     }
// }
