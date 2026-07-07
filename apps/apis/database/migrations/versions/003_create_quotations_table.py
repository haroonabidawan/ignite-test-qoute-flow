"""Create quotations table."""

from __future__ import annotations

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "003_create_quotations"
down_revision: Union[str, None] = "002_create_clients"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

quotation_status = postgresql.ENUM(
    "Draft",
    "Sent",
    "Approved",
    "Rejected",
    name="quotationstatus",
    create_type=False,
)


def upgrade() -> None:
    quotation_status.create(op.get_bind(), checkfirst=True)
    op.create_table(
        "quotations",
        sa.Column("id", sa.String(length=32), nullable=False),
        sa.Column("client_id", sa.String(length=32), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column(
            "status",
            quotation_status,
            nullable=False,
            server_default="Draft",
        ),
        sa.Column(
            "items",
            sa.JSON(),
            nullable=False,
            server_default=sa.text("'[]'::json"),
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["client_id"], ["clients.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_quotations_client_id"), "quotations", ["client_id"], unique=False
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_quotations_client_id"), table_name="quotations")
    op.drop_table("quotations")
    quotation_status.drop(op.get_bind(), checkfirst=True)
