from __future__ import annotations

import stripe


def test_stripe_webhook_construct_event_rejects_invalid_signature():
    payload = b'{"id":"evt_test","type":"invoice.paid","data":{"object":{"id":"in_test"}}}'
    secret = "whsec_test"
    try:
        stripe.Webhook.construct_event(payload=payload, sig_header="t=1,v1=bad", secret=secret)
    except Exception:
        assert True
    else:
        raise AssertionError("Expected signature verification failure")

