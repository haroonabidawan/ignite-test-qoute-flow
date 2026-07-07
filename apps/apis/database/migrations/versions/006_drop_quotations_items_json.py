"""Move line items from quotations.items JSON into quotation_items rows."""

from __future__ import annotations

import json
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "006_drop_quotations_items_json"
down_revision: Union[str, None] = "005_create_quotation_items"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    rows = bind.execute(
        sa.text("SELECT id, items FROM quotations WHERE items IS NOT NULL")
    ).mappings()

    for row in rows:
        raw_items = row["items"]
        if not raw_items:
            continue
        items = raw_items if isinstance(raw_items, list) else json.loads(raw_items)
        for item in items:
            bind.execute(
                sa.text(
                    """
                    INSERT INTO quotation_items (
                        id, quotation_id, title, description, quantity,
                        unit_price, estimated_hours, created_at, updated_at
                    ) VALUES (
                        :id, :quotation_id, :title, :description, :quantity,
                        :unit_price, :estimated_hours, now(), now()
                    )
                    ON CONFLICT (id) DO NOTHING
                    """
                ),
                {
                    "id": str(item.get("id")),
                    "quotation_id": row["id"],
                    "title": str(item.get("title", "")),
                    "description": str(item.get("description", "")),
                    "quantity": int(item.get("quantity", 1)),
                    "unit_price": item.get("unit_price"),
                    "estimated_hours": item.get("estimated_hours"),
                },
            )

    op.drop_column("quotations", "items")


def downgrade() -> None:
    op.add_column(
        "quotations",
        sa.Column(
            "items",
            sa.JSON(),
            nullable=False,
            server_default=sa.text("'[]'::json"),
        ),
    )
