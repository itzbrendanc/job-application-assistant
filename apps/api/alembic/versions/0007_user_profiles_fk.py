"""add FK user_profiles.user_id -> users.id

Revision ID: 0007
Revises: 0006
Create Date: 2026-05-21
"""

from __future__ import annotations

from alembic import op

revision = "0007"
down_revision = "0006"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Existing databases created from 0001 lack the FK constraint; add it for correct ORM relationship joins.
    op.create_foreign_key(
        "fk_user_profiles_user_id_users",
        "user_profiles",
        "users",
        ["user_id"],
        ["id"],
        ondelete=None,
    )


def downgrade() -> None:
    op.drop_constraint("fk_user_profiles_user_id_users", "user_profiles", type_="foreignkey")

