from __future__ import annotations

from alembic import op
import sqlalchemy as sa

revision = "0005_feedback_review_fields"
down_revision = "0004_telemetry_tables"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("feedback_messages", sa.Column("reviewed", sa.Boolean(), nullable=False, server_default=sa.text("false")))
    op.add_column("feedback_messages", sa.Column("internal_note", sa.Text(), nullable=True))
    op.alter_column("feedback_messages", "reviewed", server_default=None)


def downgrade() -> None:
    op.drop_column("feedback_messages", "internal_note")
    op.drop_column("feedback_messages", "reviewed")

