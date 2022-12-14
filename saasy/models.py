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
                ContractEvent(contract, ContractEventType.Start)
            )
            self.__contract_events.append(
                ContractEvent(contract, ContractEventType.End)
            )
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


MAX_RENEWAL_GAP_DAYS = 10


class ArrEventStream(Sequence[ArrEvent]):
    def __init__(self, contract_events: ContractEventStream) -> None:
        self.__arr_events: list[ArrEvent] = []
        self.__curr_arr = 0
        for ce in contract_events:
            self.__handle_contract_event(ce)

    def __getitem__(self, index: int) -> ArrEvent:
        return self.__arr_events.__getitem__(index)

    def __len__(self) -> int:
        return self.__arr_events.__len__()

    def __handle_contract_event(self, ce: ContractEvent):
        if self.__curr_arr < 0:
            raise ValueError("Current arr creating ArrEventStream goes negative")
        match ce.event_type:
            case ContractEventType.Start:
                self.__handle_start_contract(ce)
            case ContractEventType.End:
                self.__handle_end_contract(ce)
            case _:
                raise ValueError("Invalid contract event type: ", ce.event_type)

    def __handle_start_contract(self, ce: ContractEvent) -> None:
        # Handle first contract
        if self.__is_first_contract():
            self.__handle_new_arr(ce)
            return

        # Handle case where previous arr event was a churn
        if self.__is_prev_event_churn():
            self.__handle_prev_churn(ce)
            return

        if self.__curr_arr <= 0:
            raise ValueError("Current ARR is 0 or less without preceeding churn event")

        self.__handle_expansion(ce)

    def __handle_end_contract(self, ce: ContractEvent):
        # Ensure that state hasn't been corrupted
        # check to make sure that there is a previous arr event
        if self.__get_prev_arr_event() is None:
            raise ValueError(
                "Received contract end event and previous ARR event is None"
            )
        if self.__curr_arr == 0:
            raise ValueError("Recieved contract end event when current ARR is 0: ", ce)

        if self.__is_prev_early_renewal(ce):
            self.__handle_early_renewal(ce)
            return

        if self.__is_churn(ce):
            self.__handle_churn(ce)
            return

        if self.__is_downsell(ce):
            self.__handle_downsell(ce)
            return

        raise RuntimeError(
            "Unexpected state - neither churn, early renewal or downsell on ending contract"
        )

    def __is_churn(self, ce: ContractEvent) -> bool:
        return self.__curr_arr + ce.arr_change == 0

    def __is_downsell(self, ce: ContractEvent) -> bool:
        return self.__curr_arr + ce.arr_change > 0

    def __is_prev_early_renewal(self, ce: ContractEvent) -> bool:
        return self.__is_contract_continuous(ce)

    def __handle_churn(self, ce: ContractEvent) -> None:
        self.__arr_events.append(ArrEvent(ce, ArrEventType.Churn, -self.__curr_arr))
        self.__curr_arr = 0

    def __handle_downsell(self, ce: ContractEvent) -> None:
        self.__arr_events.append(ArrEvent(ce, ArrEventType.Downsell, ce.arr_change))
        self.__curr_arr += ce.arr_change

    def __get_prev_arr_event(self) -> ArrEvent | None:
        if len(self.__arr_events) == 0:
            return None
        return self.__arr_events[-1]

    def __is_first_contract(self) -> bool:
        return self.__get_prev_arr_event() is None

    def __handle_new_arr(self, ce: ContractEvent) -> None:
        self.__arr_events.append(ArrEvent(ce, ArrEventType.New, ce.arr_change))
        self.__curr_arr += ce.arr_change

    def __is_prev_event_churn(self) -> bool:
        prev_arr = self.__get_prev_arr_event()
        result = prev_arr is not None and prev_arr.event_type == ArrEventType.Churn
        if result and self.__curr_arr != 0:
            raise ValueError("Previous event was churn but curr_arr is not 0")
        return result

    def __handle_prev_churn(self, ce: ContractEvent) -> None:
        if self.__is_contract_continuous(ce):
            self.__handle_renewal(ce)
            return
        self.__handle_new_arr(ce)

    def __is_contract_continuous(self, ce: ContractEvent) -> bool:
        prev_arr = self.__get_prev_arr_event()

        return prev_arr is not None and within_days(
            prev_arr.event_date,
            ce.event_date,
            MAX_RENEWAL_GAP_DAYS,
        )

    def __handle_renewal(self, ce: ContractEvent) -> None:
        # Remove previous churn event
        prev_arr = self.__arr_events.pop()
        self.__curr_arr -= prev_arr.arr_change
        next_arr_change = ce.arr_change - self.__curr_arr

        # Append the renewal
        self.__arr_events.append(ArrEvent(ce, ArrEventType.Renewal, 0))

        # Renewal only
        if next_arr_change == 0:
            return

        event_type = (
            ArrEventType.Downsell if next_arr_change < 0 else ArrEventType.Expansion
        )
        self.__arr_events.append(ArrEvent(ce, event_type, next_arr_change))

        self.__curr_arr += next_arr_change

    def __handle_early_renewal(self, ce: ContractEvent) -> None:
        prev_arr_event = self.__get_prev_arr_event()
        assert prev_arr_event is not None
        # Logic is the same for handling the renewal
        self.__handle_renewal(prev_arr_event.contract_event)

    def __handle_expansion(self, ce: ContractEvent) -> None:
        self.__arr_events.append(ArrEvent(ce, ArrEventType.Expansion, ce.arr_change))
        self.__curr_arr += ce.arr_change


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
    return within_delta(a, b, delta)  # type: ignore
