from __future__ import annotations

from alembic import op
import sqlalchemy as sa

revision = "0002_application_tracker_fields"
down_revision = "0001_init"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("applications", sa.Column("application_source", sa.String(length=40), nullable=False, server_default="other"))
    op.add_column("applications", sa.Column("resume_version", sa.String(length=80), nullable=True))
    op.add_column("applications", sa.Column("cover_letter_version", sa.String(length=80), nullable=True))
    op.add_column("applications", sa.Column("follow_up_date", sa.DateTime(timezone=True), nullable=True))
    op.add_column("applications", sa.Column("recruiter_contact", sa.String(), nullable=True))
    op.add_column("applications", sa.Column("notes", sa.Text(), nullable=True))
    op.add_column("applications", sa.Column("submitted_by_extension", sa.Boolean(), nullable=False, server_default=sa.text("false")))

    # remove server_default now that existing rows are backfilled
    op.alter_column("applications", "application_source", server_default=None)


def downgrade() -> None:
    op.drop_column("applications", "submitted_by_extension")
    op.drop_column("applications", "notes")
    op.drop_column("applications", "recruiter_contact")
    op.drop_column("applications", "follow_up_date")
    op.drop_column("applications", "cover_letter_version")
    op.drop_column("applications", "resume_version")
    op.drop_column("applications", "application_source")

