"""Create ai_logs table."""

from __future__ import annotations

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "004_create_ai_logs"
down_revision: Union[str, None] = "003_create_quotations"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "ai_logs",
        sa.Column("id", sa.String(length=32), nullable=False),
        sa.Column("request_text", sa.Text(), nullable=False),
        sa.Column("response_json", sa.Text(), server_default="", nullable=False),
        sa.Column("ok", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.Column("source", sa.String(length=32), server_default="ai", nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    op.drop_table("ai_logs")
