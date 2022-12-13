from dataclasses import dataclass
from datetime import date, timedelta
from enum import Enum, auto
from functools import total_ordering
from typing import Self
from collections.abc import Sequence, Iterable
from dateutil.utils import within_delta


@dataclass
class Contract:
    customer_id: str
    start_date: date
    end_date: date
    tcv: float

    def __post_init__(self) -> None:
        pass
        # Initialize tcv or acv fields

    def len_years(self) -> float:
        return yearfrac(self.start_date, self.end_date)

    @property
    def acv(self) -> float:
        return self.tcv / self.len_years()


class ContractEventType(Enum):
    Start = auto()
    End = auto()


@total_ordering
@dataclass
class ContractEvent:
    contract: Contract
    event_type: ContractEventType

    @property
    def event_date(self) -> date:
        if self.event_type == ContractEventType.Start:
            return self.contract.start_date
        return self.contract.end_date

    @property
    def acv(self) -> float:
        return self.contract.acv

    @property
    def arr_change(self) -> float:
        if self.event_type == ContractEventType.Start:
            return self.acv
        return -(self.acv)

    def __lt__(self, other: Self) -> bool:
        if not isinstance(other, self.__class__):
            return NotImplemented
        if self.event_date < other.event_date:
            return True
        if self.event_date > other.event_date:
            return False
        if self.event_type == other.event_type:
            return False
        # We want contract end events to be emmitted before contract start events
        return self.event_type == ContractEventType.End

    def __lte__(self, other: Self) -> bool:
        if not isinstance(other, self.__class__):
            return NotImplemented
        if self.event_date < other.event_date:
            return True
        if self.event_date > other.event_date:
            return False
        if self.event_type == other.event_type:
            return True
        return self.event_type == ContractEventType.End


class ContractEventStream(Sequence[ContractEvent]):

    def __init__(self, contracts: Iterable[Contract]) -> None:
        self.__contract_events: list[ContractEvent] = []
        for contract in contracts:
            self.__contract_events.append(
                ContractEvent(contract, ContractEventType.Start))
            self.__contract_events.append(
                ContractEvent(contract, ContractEventType.End))
        self.__contract_events.sort()

    def __getitem__(self, index: int) -> ContractEvent:
        return self.__contract_events.__getitem__(index)

    def __len__(self) -> int:
        return self.__contract_events.__len__()


class ArrEventType(Enum):
    New = auto()
    Expansion = auto()
    Downsell = auto()
    Churn = auto()
    Renewal = auto()


@dataclass
class ArrEvent:
    contract_event: ContractEvent
    event_type: ArrEventType
    arr_change: float

    @property
    def event_date(self) -> date:
        return self.contract_event.event_date


MAX_RENEWLAL_GAP_DAYS = 10


class ArrEventStream(Sequence[ArrEvent]):

    def __init__(self, contract_events: ContractEventStream) -> None:
        self.__arr_events: list[ArrEvent] = []
        curr_arr = 0
        for i, ce in enumerate(contract_events):
            if curr_arr < 0:
                raise ValueError("Current arr creating ArrEventStream goes negative")
            
            # Get the previous ARR event if it exists
            prev_arr_event = self.__arr_events[-1] if len(self.__arr_events) > 0 else None

            if ce.event_type == ContractEventType.Start:
                # This indicates that there was either a previous churn or this is the first event
                if curr_arr == 0:
                    # if no previous ARR events, create a new one
                    if prev_arr_event is None:
                        self.__arr_events.append(ArrEvent(ce, ArrEventType.New, ce.arr_change))
                        curr_arr += ce.arr_change

                    # Check if previous ArrEvent was a churn and decide if this is a restart or a renewal
                    elif prev_arr_event.event_type == ArrEventType.Churn:

                        # Check for renewal event
                        if within_days(prev_arr_event.event_date, ce.event_date, MAX_RENEWLAL_GAP_DAYS):
                            # remove the previous churn event and replace with a renewal event and possibly an expansion or downsell event
                            self.__arr_events.pop()

                            # Add the renewal event
                            self.__arr_events.append(ArrEvent(ce, ArrEventType.Renewal, 0))

                            # additional change to ARR (could be positive or negative)
                            arr_change = ce.arr_change + prev_arr_event.arr_change
                            if arr_change < 0:
                                self.__arr_events.append(ArrEvent(ce, ArrEventType.Downsell, arr_change))

                            if arr_change > 0:
                                self.__arr_events.append(ArrEvent(ce, ArrEventType.Expansion, arr_change))
                            
                            curr_arr = ce.arr_change

                        else:
                            # this is a restart and the event type should be new
                            self.__arr_events.append(ArrEvent(ce, ArrEventType.New, ce.arr_change))
                            curr_arr += ce.arr_change

                    # This would mean that current arr is 0 even after a non-curn event
                    else:
                        raise ValueError("Current ARR is 0 even after a non-churn event")
                
                # This branch indicates that we have an existing ARR stream and the new contract should be an expansion
                else:
                    if prev_arr_event is None:
                        raise ValueError("No previous arr_event when current_arr is greater than 0")
                    #TODO: handle Downsell -> Gap -> Expansion case
                    self.__arr_events.append(ArrEvent(ce, ArrEventType.Expansion, ce.arr_change))
                    curr_arr += ce.arr_change

            # This branch indicates that we're encountering the end of a contract
            else:
                if curr_arr == 0:
                    raise ValueError("Recieved contract end event when current ARR is 0")
                
                new_arr = curr_arr + ce.arr_change

                if new_arr < 0:
                    raise ValueError("Received contract end event that drops current arr below 0")
                
                # Indicates a churn
                # We handle delayed renewals above, but the code assumes that we emit a churn here
                if new_arr == 0:
                    self.__arr_events.append(ArrEvent(ce, ArrEventType.Churn, -curr_arr))
                    curr_arr = new_arr
                
                # New arr will be greater than 0, indicating a downsell
                else:
                    self.__arr_events.append(ArrEvent(ce, ArrEventType.Downsell, ce.arr_change))
                    curr_arr = new_arr
                    #TODO handle early renewal

    def __getitem__(self, index: int) -> ArrEvent:
        return self.__arr_events.__getitem__(index)

    def __len__(self) -> int:
        return self.__arr_events.__len__()                        

                    

        # if ce.event_type == ContractEventType.End and ce.arr_change != 0:
        #     raise ValueError("Encountered a contract end event when current arr is 0")


class Customer:

    def __init__(self, id: str) -> None:
        self.id: str = id
        self.__contracts: list[Contract] = []
        self.__arr_events: list[ArrEvent] = []

    def __repr__(self) -> str:
        return str(self.__dict__)


class SaasData:

    def __init__(self) -> None:
        self.__customers: dict[str, Customer] = {}


# Date utility functions

def yearfrac(a: date, b: date, decimals: int = 1, absolute: bool = True) -> float:
    days = (b - a).days
    raw_frac = days / 365.0
    frac = round(raw_frac, decimals)
    if absolute:
        return abs(frac)
    return frac


def within_days(a: date, b: date, days: int) -> bool:
    delta = timedelta(days=days)
    return within_delta(a, b, delta)
