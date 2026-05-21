from app.services.approval import determine_if_sensitive


def test_sensitive_detection_salary() -> None:
    decision = determine_if_sensitive("What are your salary expectations?")
    assert decision.needs_user_approval is True

