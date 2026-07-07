"""Tests for quotation helper calculations."""

from __future__ import annotations

from datetime import UTC, datetime

from app.helpers.quotation import item_total, serialize_item, serialize_quotation
from app.models.quotation import Quotation, QuotationStatus
from app.models.quotation_item import QuotationItem


def test_item_total_with_price() -> None:
    item = QuotationItem(
        quotation_id="q1",
        title="Design",
        description="",
        quantity=2,
        unit_price=150.0,
        estimated_hours=None,
    )
    assert item_total(item) == 300.0


def test_item_total_without_price() -> None:
    item = QuotationItem(
        quotation_id="q1",
        title="TBD",
        description="",
        quantity=3,
        unit_price=None,
        estimated_hours=5,
    )
    assert item_total(item) == 0.0


def test_serialize_quotation_total() -> None:
    quotation = Quotation(
        id="q1",
        client_id="c1",
        title="Website",
        status=QuotationStatus.DRAFT,
        created_at=datetime(2026, 1, 15, 12, 0, tzinfo=UTC),
    )
    quotation.items = [
        QuotationItem(
            id="item-1",
            quotation_id="q1",
            title="Build",
            description="",
            quantity=1,
            unit_price=1000.0,
            estimated_hours=10,
        ),
        QuotationItem(
            id="item-2",
            quotation_id="q1",
            title="Hosting",
            description="",
            quantity=1,
            unit_price=None,
            estimated_hours=None,
        ),
    ]
    read = serialize_quotation(quotation)
    assert read.total == 1000.0
    assert len(read.items) == 2
    assert read.items[0].total == 1000.0
    assert read.items[1].total == 0.0


def test_serialize_item_rounds_total() -> None:
    item = QuotationItem(
        id="item-3",
        quotation_id="q1",
        title="Line",
        description="",
        quantity=3,
        unit_price=10.33,
        estimated_hours=None,
    )
    read = serialize_item(item)
    assert read.total == 30.99


x = 1
