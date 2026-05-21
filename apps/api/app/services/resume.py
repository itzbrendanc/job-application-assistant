from __future__ import annotations

from sqlalchemy.orm import Session

from app.models.resume import ParsedResumeData, Resume
from app.services.ai.stub import StubResumeParser, StubSkillExtractor


def parse_resume(db: Session, *, resume: Resume) -> ParsedResumeData:
    parser = StubResumeParser()
    extractor = StubSkillExtractor()
    parsed = parser.parse(resume_text=resume.content_text)
    skills = extractor.extract(parsed_resume=parsed)

    existing = db.query(ParsedResumeData).filter(ParsedResumeData.resume_id == resume.id).one_or_none()
    if existing:
        existing.extracted = parsed
        existing.skills = skills
        db.commit()
        db.refresh(existing)
        return existing

    row = ParsedResumeData(resume_id=resume.id, extracted=parsed, skills=skills, confidence=None)
    db.add(row)
    db.commit()
    db.refresh(row)
    return row

