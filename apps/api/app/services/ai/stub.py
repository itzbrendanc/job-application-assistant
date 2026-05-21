from __future__ import annotations

import re

from app.services.ai.base import ApprovedFacts


class StubResumeParser:
    def parse(self, *, resume_text: str) -> dict:
        # Deterministic toy parser: this is a placeholder for a real LLM+rules pipeline.
        lines = [ln.strip() for ln in resume_text.splitlines() if ln.strip()]
        return {"lines": lines[:200], "length": len(resume_text)}


class StubSkillExtractor:
    def extract(self, *, parsed_resume: dict) -> list[str]:
        text = "\n".join(parsed_resume.get("lines", []))
        tokens = set(re.findall(r"[A-Za-z][A-Za-z0-9+.#-]{1,}", text))
        # intentionally conservative: keep only obvious "skill-like" tokens
        return sorted([t for t in tokens if t.lower() in {"python", "sql", "fastapi", "react", "next.js", "postgres"}])


class StubJobFitScorer:
    def score(self, *, job_description: str, approved_facts: ApprovedFacts) -> dict:
        # Guardrail: only look at approved facts.
        skills = set((approved_facts.facts.get("skills") or []))
        jd = job_description.lower()
        matches = [s for s in skills if s.lower() in jd]
        score = min(100.0, float(len(matches)) * 15.0)
        return {
            "score": score,
            "match_reasons": [f"Approved skill appears in job description: {s}" for s in matches],
            "mismatch_reasons": [],
            "uncertainties": ["This is a stub scorer; replace with a real model + explanations."],
        }


class StubCoverLetterGenerator:
    def generate(self, *, job_description: str, approved_facts: ApprovedFacts) -> str:
        # Guardrail: no fabrication. This stub only echoes approved highlights.
        name = approved_facts.facts.get("full_name") or "Candidate"
        highlights = approved_facts.facts.get("highlights") or []
        safe_highlights = [h for h in highlights if isinstance(h, str)][:5]
        bullets = "\n".join([f"- {h}" for h in safe_highlights]) if safe_highlights else "- (Add approved highlights)"
        return (
            f"Dear Hiring Manager,\n\n"
            f"My name is {name}. I’m interested in this role and believe my experience may align.\n\n"
            f"Relevant highlights (user-approved only):\n{bullets}\n\n"
            f"Thank you for your time,\n{name}\n"
        )


class StubQuestionAnswerer:
    def answer(self, *, question_text: str, approved_facts: ApprovedFacts) -> str:
        # Conservative: never guess; provide an empty answer pack.
        return ""

