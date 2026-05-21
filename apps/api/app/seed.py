from __future__ import annotations

from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.db.session import SessionLocal
from app.models.user import User
from app.models.user_profile import UserProfile
from app.models.profile_fact import ProfileFact
from app.services.jobs import create_job


def run() -> None:
    db: Session = SessionLocal()
    try:
        email = "demo@example.com"
        existing = db.query(User).filter(User.email == email).one_or_none()
        if existing:
            return

        user = User(email=email, password_hash=hash_password("password123"), auth_provider="password")
        db.add(user)
        db.commit()
        db.refresh(user)

        profile = UserProfile(user_id=user.id, full_name="Demo User", location_text="San Francisco, CA", remote_preference="remote")
        db.add(profile)
        db.commit()
        db.refresh(profile)

        # Approved facts to demonstrate guardrails: generation uses only these.
        db.add(
            ProfileFact(
                profile_id=profile.id,
                fact_type="skills",
                fact_key="skills",
                fact_value={"skills": ["Python", "SQL", "FastAPI"]},
                source_type="user_edit",
                source_ref=None,
                confidence=1.0,
                approval_status="approved",
            )
        )
        db.commit()

        create_job(
            db,
            job_source="manual",
            external_job_id=None,
            source_url=None,
            company_name="ExampleCo",
            title="Backend Engineer",
            location_text="Remote",
            remote_type="remote",
            salary_min=150000,
            salary_max=190000,
            salary_currency="USD",
            description_raw="Looking for Python + FastAPI + Postgres experience.",
        )
    finally:
        db.close()


if __name__ == "__main__":
    run()

