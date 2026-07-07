"""Add user_id to ai_logs for per-user usage tracking."""

from __future__ import annotations

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "007_add_ai_log_user_id"
down_revision: Union[str, None] = "006_drop_quotations_items_json"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "ai_logs",
        sa.Column("user_id", sa.String(length=32), nullable=True),
    )
    op.create_index("ix_ai_logs_user_id", "ai_logs", ["user_id"])


def downgrade() -> None:
    op.drop_index("ix_ai_logs_user_id", table_name="ai_logs")
    op.drop_column("ai_logs", "user_id")
