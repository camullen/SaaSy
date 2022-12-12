from dataclasses import dataclass
from datetime import date
from enum import Enum, auto


@dataclass
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
