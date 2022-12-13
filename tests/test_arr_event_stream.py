from saasy.models import *


def test_single_contract():
    contracts = [
        Contract(
            "a", date.fromisoformat("2020-01-01"), date.fromisoformat("2020-12-31"), 100
        )
    ]
    ce_stream = ContractEventStream(contracts)
    ae_stream = ArrEventStream(ce_stream)

    expected = [
        ArrEvent(ce_stream[0], ArrEventType.New, 100),
        ArrEvent(ce_stream[1], ArrEventType.Churn, -100),
    ]

    actual = list(ae_stream)

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
    ce_stream = ContractEventStream(contracts)
    ae_stream = ArrEventStream(ce_stream)

    expected = [
        ArrEvent(ce_stream[0], ArrEventType.New, 100),
        ArrEvent(ce_stream[2], ArrEventType.Renewal, 0),
        ArrEvent(ce_stream[3], ArrEventType.Churn, -100),
    ]

    actual = list(ae_stream)

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
    ce_stream = ContractEventStream(contracts)
    ae_stream = ArrEventStream(ce_stream)

    expected = [
        ArrEvent(ce_stream[0], ArrEventType.New, 100),
        ArrEvent(ce_stream[2], ArrEventType.Renewal, 0),
        ArrEvent(ce_stream[2], ArrEventType.Expansion, 50),
        ArrEvent(ce_stream[3], ArrEventType.Churn, -150),
    ]

    actual = list(ae_stream)

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
    ce_stream = ContractEventStream(contracts)
    ae_stream = ArrEventStream(ce_stream)

    expected = [
        ArrEvent(ce_stream[0], ArrEventType.New, 100),
        ArrEvent(ce_stream[2], ArrEventType.Renewal, 0),
        ArrEvent(ce_stream[2], ArrEventType.Downsell, -25),
        ArrEvent(ce_stream[3], ArrEventType.Churn, -75),
    ]

    actual = list(ae_stream)

    assert actual == expected


def test_new_churn_new():
    contracts = [
        Contract(
            "a", date.fromisoformat("2020-01-01"), date.fromisoformat("2020-12-31"), 100
        ),
        Contract(
            "a", date.fromisoformat("2021-06-01"), date.fromisoformat("2022-05-31"), 200
        ),
    ]
    ce_stream = ContractEventStream(contracts)
    ae_stream = ArrEventStream(ce_stream)

    expected = [
        ArrEvent(ce_stream[0], ArrEventType.New, 100),
        ArrEvent(ce_stream[1], ArrEventType.Churn, -100),
        ArrEvent(ce_stream[2], ArrEventType.New, 200),
        ArrEvent(ce_stream[3], ArrEventType.Churn, -200),
    ]

    actual = list(ae_stream)

    assert actual == expected


def test_delayed_renewal():
    contracts = [
        Contract(
            "a", date.fromisoformat("2020-01-01"), date.fromisoformat("2020-12-31"), 100
        ),
        Contract(
            "a", date.fromisoformat("2021-01-05"), date.fromisoformat("2021-12-31"), 175
        ),
    ]
    ce_stream = ContractEventStream(contracts)
    ae_stream = ArrEventStream(ce_stream)

    expected = [
        ArrEvent(ce_stream[0], ArrEventType.New, 100),
        ArrEvent(ce_stream[2], ArrEventType.Renewal, 0),
        ArrEvent(ce_stream[2], ArrEventType.Expansion, 75),
        ArrEvent(ce_stream[3], ArrEventType.Churn, -175),
    ]

    actual = list(ae_stream)

    assert actual == expected
