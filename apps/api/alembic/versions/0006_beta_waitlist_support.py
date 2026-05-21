"""beta invites + waitlist + support

Revision ID: 0006
Revises: 0005
Create Date: 2026-05-20
"""

from __future__ import annotations

import sqlalchemy as sa
from alembic import op

revision = "0006"
down_revision = "0005"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "beta_invites",
        sa.Column("id", sa.dialects.postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("email", sa.String(length=320), nullable=False),
        sa.Column("invite_code", sa.String(length=80), nullable=False),
        sa.Column("status", sa.Enum("pending", "accepted", "revoked", name="beta_invite_status"), nullable=False),
        sa.Column("invited_by_user_id", sa.dialects.postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("accepted_by_user_id", sa.dialects.postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("accepted_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_beta_invites_email", "beta_invites", ["email"])
    op.create_index("ix_beta_invites_invite_code", "beta_invites", ["invite_code"])
    op.create_unique_constraint("uq_beta_invites_email", "beta_invites", ["email"])
    op.create_unique_constraint("uq_beta_invites_invite_code", "beta_invites", ["invite_code"])

    op.create_table(
        "waitlist_entries",
        sa.Column("id", sa.dialects.postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("email", sa.String(length=320), nullable=False),
        sa.Column("role", sa.String(length=120), nullable=True),
        sa.Column("job_search_status", sa.String(length=120), nullable=True),
        sa.Column("source", sa.String(length=120), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )
    op.create_index("ix_waitlist_entries_email", "waitlist_entries", ["email"])
    op.create_unique_constraint("uq_waitlist_entries_email", "waitlist_entries", ["email"])

    op.create_table(
        "support_messages",
        sa.Column("id", sa.dialects.postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("email", sa.String(length=320), nullable=False),
        sa.Column("subject", sa.String(length=200), nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("status", sa.Enum("open", "reviewed", "closed", name="support_message_status"), nullable=False),
        sa.Column("internal_note", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )
    op.create_index("ix_support_messages_email", "support_messages", ["email"])


def downgrade() -> None:
    op.drop_index("ix_support_messages_email", table_name="support_messages")
    op.drop_table("support_messages")
    op.execute("DROP TYPE IF EXISTS support_message_status")

    op.drop_index("ix_waitlist_entries_email", table_name="waitlist_entries")
    op.drop_table("waitlist_entries")

    op.drop_index("ix_beta_invites_invite_code", table_name="beta_invites")
    op.drop_index("ix_beta_invites_email", table_name="beta_invites")
    op.drop_table("beta_invites")
    op.execute("DROP TYPE IF EXISTS beta_invite_status")

