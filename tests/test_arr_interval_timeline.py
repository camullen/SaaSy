from typing import Sequence
from saasy.models import (
    Contract,
    ContractEventStream,
    ArrEventStream,
    ArrInterval,
    ArrIntervalTimeline,
)
from datetime import date
import portion as P


def create_arr_interval_timeline(contracts: Sequence[Contract]) -> ArrIntervalTimeline:
    return ArrIntervalTimeline(ArrEventStream(ContractEventStream(contracts)))


def test_single_contract():

    contracts = [
        Contract(
            "a", date.fromisoformat("2020-01-01"), date.fromisoformat("2020-12-31"), 100
        )
    ]

    expected = [
        ArrInterval(P.open(-P.inf, date.fromisoformat("2020-01-01")), 0),
        ArrInterval(
            P.closed(
                date.fromisoformat("2020-01-01"), date.fromisoformat("2020-12-31")
            ),
            100,
        ),
        ArrInterval(P.open(date.fromisoformat("2020-12-31"), P.inf), 0),
    ]

    actual = list(create_arr_interval_timeline(contracts))

    assert actual == expected


def test_single_renewal():
    contracts = [
        Contract(
            "a", date.fromisoformat("2020-01-01"), date.fromisoformat("2020-12-31"), 100
        ),
        Contract(
            "a", date.fromisoformat("2021-01-01"), date.fromisoformat("2021-12-31"), 100
        ),
    ]

    expected = [
        ArrInterval(P.open(-P.inf, date.fromisoformat("2020-01-01")), 0),
        ArrInterval(
            P.closed(
                date.fromisoformat("2020-01-01"), date.fromisoformat("2021-12-31")
            ),
            100,
        ),
        ArrInterval(P.open(date.fromisoformat("2021-12-31"), P.inf), 0),
    ]

    actual = list(create_arr_interval_timeline(contracts))

    assert actual == expected


def test_single_expansion():
    contracts = [
        Contract(
            "a", date.fromisoformat("2020-01-01"), date.fromisoformat("2020-12-31"), 100
        ),
        Contract(
            "a", date.fromisoformat("2021-01-01"), date.fromisoformat("2021-12-31"), 150
        ),
    ]

    expected = [
        ArrInterval(P.open(-P.inf, date.fromisoformat("2020-01-01")), 0),
        ArrInterval(
            P.closedopen(
                date.fromisoformat("2020-01-01"), date.fromisoformat("2021-01-01")
            ),
            100,
        ),
        ArrInterval(
            P.closed(
                date.fromisoformat("2021-01-01"), date.fromisoformat("2021-12-31")
            ),
            150,
        ),
        ArrInterval(P.open(date.fromisoformat("2021-12-31"), P.inf), 0),
    ]

    actual = list(create_arr_interval_timeline(contracts))

    assert actual == expected


def test_single_downsell():
    contracts = [
        Contract(
            "a", date.fromisoformat("2020-01-01"), date.fromisoformat("2020-12-31"), 100
        ),
        Contract(
            "a", date.fromisoformat("2021-01-01"), date.fromisoformat("2021-12-31"), 75
        ),
    ]

    expected = [
        ArrInterval(P.open(-P.inf, date.fromisoformat("2020-01-01")), 0),
        ArrInterval(
            P.closedopen(
                date.fromisoformat("2020-01-01"), date.fromisoformat("2021-01-01")
            ),
            100,
        ),
        ArrInterval(
            P.closed(
                date.fromisoformat("2021-01-01"), date.fromisoformat("2021-12-31")
            ),
            75,
        ),
        ArrInterval(P.open(date.fromisoformat("2021-12-31"), P.inf), 0),
    ]

    actual = list(create_arr_interval_timeline(contracts))

    assert actual == expected
