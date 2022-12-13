from dataclasses import dataclass
from datetime import date
from enum import Enum, auto


@dataclass(kw_only=True)
class Contract:
    customer_id: str
    start_date: date
    end_date: date
    tcv: float
    acv: float

    def __post_init__(self):
        pass
        # Initialize tcv or acv fields


class ArrEventType(Enum):
    New = auto()
    Expansion = auto()
    Downsell = auto()
    Churn = auto()
    Renewal = auto()


@dataclass
class ArrEvent:
    date: date
    arr_change: float
    contract: Contract
    event_type: ArrEventType


class Customer:

    def __init__(self, id: str) -> None:
        self.id: str = id
        self.__contracts: list[Contract] = []
        self.__arr_events: list[ArrEvent] = []

    def __repr__(self):
        return str(self.__dict__)


class SaasData:

    def __init__(self) -> None:
        self.__customers: dict[str, Customer] = {}

    