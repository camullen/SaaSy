use chrono::naive::NaiveDate;
use serde::Deserialize;
use std::cmp::Ordering;
use std::collections::hash_map::Entry::{Occupied, Vacant};
use std::collections::HashMap;

pub struct Contract {
    customer_id: String,
    start_date: NaiveDate,
    end_date: NaiveDate,
    tcv: f64,
    acv: f64,
}

pub struct ArrEvent<'a> {
    date: NaiveDate,
    arr_change: f64,
    contract: &'a Contract,
    event_type: ArrEventType,
}

pub enum ArrEventType {
    New,
    Expansion,
    Downsell,
    Churn,
    Renewal,
}

pub struct CustomerArrEvents<'a> {
    events: Vec<ArrEvent<'a>>,
}

impl<'a> CustomerArrEvents<'a> {
    pub fn new(cust: &'a mut Customer) -> Self {
        let mut events = vec![];
        let mut active_contracts = vec![];
        cust.contracts.sort_unstable();
        for (i, contract) in cust.contracts.iter().enumerate() {
            if i == 0 {
                events.push(ArrEvent {
                    date: contract.start_date.clone(),
                    arr_change: contract.acv,
                    contract: &contract,
                    event_type: ArrEventType::New,
                });
                active_contracts.push(contract);
                continue;
            }
            // Check to see if any active contracts are ending before the start date
        }
        CustomerArrEvents { events }
    }
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
    customers: HashMap<String, Customer>,
}

impl SaasData {
    pub fn new<T: IntoIterator<Item = ContractRecord>>(data_iter: T) -> Self {
        let mut data = SaasData {
            customers: HashMap::new(),
        };
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
        Customer {
            id: customer_id.to_string(),
            contracts: vec![],
        }
    }

    fn add_contract_record(&mut self, record: ContractRecord) {
        self.contracts.push(Contract::from(record));
    }
}

impl From<ContractRecord> for Contract {
    fn from(r: ContractRecord) -> Self {
        let contract_dur_days = (r.end_date - r.start_date).num_days() as f64;
        // Round to 1 decimal place
        let contract_dur_years: f64 = (contract_dur_days * 10.0 / 365.0).round() / 10.0;
        let acv = r.tcv / contract_dur_years;
        Contract {
            customer_id: r.customer_id,
            start_date: r.start_date,
            end_date: r.end_date,
            tcv: r.tcv,
            acv,
        }
    }
}

impl PartialOrd for Contract {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        let ordering = match self.start_date.cmp(&other.start_date) {
            Ordering::Greater => Ordering::Greater,
            Ordering::Less => Ordering::Less,
            Ordering::Equal => match self.end_date.cmp(&other.end_date) {
                Ordering::Greater => Ordering::Greater,
                Ordering::Less => Ordering::Less,
                Ordering::Equal => match self.tcv.partial_cmp(&other.tcv) {
                    Some(Ordering::Greater) => Ordering::Greater,
                    Some(Ordering::Less) => Ordering::Less,
                    Some(Ordering::Equal) => self.customer_id.cmp(&other.customer_id),
                    None => return None,
                },
            },
        };
        Some(ordering)
    }
}

impl Ord for Contract {
    fn cmp(&self, other: &Self) -> Ordering {
        return self.partial_cmp(other).unwrap();
    }
}

impl Eq for Contract {}

impl PartialEq for Contract {
    fn eq(&self, other: &Self) -> bool {
        self.cmp(other) == Ordering::Equal
    }

    fn ne(&self, other: &Self) -> bool {
        !self.eq(other)
    }
}
