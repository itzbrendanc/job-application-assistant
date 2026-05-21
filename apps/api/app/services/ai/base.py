from __future__ import annotations

from dataclasses import dataclass
from typing import Protocol


@dataclass(frozen=True)
class ApprovedFacts:
    """Facts the user has explicitly approved.

    Guardrail: AI generation must ONLY use these facts.
    """

    facts: dict


class ResumeParser(Protocol):
    def parse(self, *, resume_text: str) -> dict: ...


class SkillExtractor(Protocol):
    def extract(self, *, parsed_resume: dict) -> list[str]: ...


class JobFitScorer(Protocol):
    def score(self, *, job_description: str, approved_facts: ApprovedFacts) -> dict: ...


class CoverLetterGenerator(Protocol):
    def generate(self, *, job_description: str, approved_facts: ApprovedFacts) -> str: ...


class QuestionAnswerer(Protocol):
    def answer(self, *, question_text: str, approved_facts: ApprovedFacts) -> str: ...

