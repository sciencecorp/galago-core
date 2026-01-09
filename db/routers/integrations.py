from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import typing as t

import requests
import smtplib
from email.message import EmailMessage

from db import crud
from db.utils.crypto import decrypt_secret
from db.utils.audit import log_event
from ..dependencies import get_db

router = APIRouter()


def _get_setting(db: Session, name: str, default: str = "") -> str:
    s = crud.settings.get_by(db, obj_in={"name": name})
    if s is None:
        return default
    return s.value or default


def _get_secret_plaintext(db: Session, name: str) -> str:
    secret = crud.secrets.get_by(db, obj_in={"name": name})
    if secret is None or not secret.is_active:
        raise HTTPException(status_code=400, detail=f"Secret not set: {name}")
    return decrypt_secret(secret.encrypted_value)


def _get_secret_plaintext_optional(db: Session, name: str) -> t.Optional[str]:
    secret = crud.secrets.get_by(db, obj_in={"name": name})
    if secret is None or not secret.is_active:
        return None
    try:
        return decrypt_secret(secret.encrypted_value)
    except Exception:
        return None


def _normalize_slack_channel(channel: str) -> str:
    c = (channel or "").strip()
    return c[1:] if c.startswith("#") else c


def _normalize_slack_bot_token(token: str) -> str:
    """
    Users sometimes paste tokens with surrounding whitespace/quotes or with a 'Bearer ' prefix.
    Slack expects the raw token value in the Authorization header.
    """
    tkn = (token or "").strip()
    # Strip common surrounding quotes (e.g. copied from JSON/env files)
    if len(tkn) >= 2 and ((tkn[0] == tkn[-1] == '"') or (tkn[0] == tkn[-1] == "'")):
        tkn = tkn[1:-1].strip()
    # If user pasted 'Bearer xoxb-...', normalize to raw token
    if tkn.lower().startswith("bearer "):
        tkn = tkn[7:].strip()
    return tkn


def _slack_send(db: Session, *, message: str, channel: str = "") -> None:
    webhook = _get_secret_plaintext_optional(db, "slack_webhook_url")
    bot_token = _get_secret_plaintext_optional(db, "slack_bot_token")

    # Use webhook if present
    if webhook:
        payload: dict[str, t.Any] = {"text": message}
        if channel:
            payload["channel"] = channel
        try:
            resp = requests.post(webhook, json=payload, timeout=10)
            if resp.status_code >= 400:
                raise HTTPException(status_code=500, detail=f"Slack error: {resp.text}")
            log_event(
                db,
                action="integrations.slack.send",
                target_type="integration",
                target_name="slack",
                details={"method": "webhook"},
            )
            return
        except requests.RequestException as e:
            raise HTTPException(status_code=500, detail=f"Slack request failed: {e}")

    # Fallback to bot token + Web API
    if bot_token:
        bot_token = _normalize_slack_bot_token(bot_token)
        ch = _normalize_slack_channel(channel)
        if not ch:
            raise HTTPException(
                status_code=400,
                detail="Slack bot token is set, but no channel is configured (slack_default_channel).",
            )
        try:
            resp = requests.post(
                "https://slack.com/api/chat.postMessage",
                json={"channel": ch, "text": message},
                headers={
                    "Authorization": f"Bearer {bot_token}",
                    "Content-Type": "application/json; charset=utf-8",
                },
                timeout=10,
            )
            data = (
                resp.json()
                if resp.headers.get("content-type", "").startswith("application/json")
                else {}
            )
            if resp.status_code >= 400:
                raise HTTPException(status_code=500, detail=f"Slack error: {resp.text}")
            if not data.get("ok", False):
                # Slack configuration/auth issues should be treated as a client/config error,
                # not an internal server failure.
                err = (data.get("error") or "").strip() or resp.text
                status = (
                    400
                    if err
                    in {
                        "invalid_auth",
                        "account_inactive",
                        "not_in_channel",
                        "channel_not_found",
                    }
                    else 500
                )
                raise HTTPException(status_code=status, detail=f"Slack error: {err}")
            log_event(
                db,
                action="integrations.slack.send",
                target_type="integration",
                target_name="slack",
                details={"method": "bot_token"},
            )
            return
        except requests.RequestException as e:
            raise HTTPException(status_code=500, detail=f"Slack request failed: {e}")

    raise HTTPException(
        status_code=400,
        detail="Slack not configured: set either slack_webhook_url or slack_bot_token.",
    )


@router.post("/slack/test")
def slack_test(
    body: dict,
    db: Session = Depends(get_db),
) -> t.Any:
    message = (body or {}).get("message") or "Galago: Slack test message ✅"
    channel = (body or {}).get("channel") or _get_setting(
        db, "slack_default_channel", ""
    )
    _slack_send(db, message=message, channel=channel)
    log_event(
        db,
        action="integrations.slack.test",
        target_type="integration",
        target_name="slack",
    )
    return {"ok": True}


@router.post("/slack/send")
def slack_send(
    body: dict,
    db: Session = Depends(get_db),
) -> t.Any:
    message = (body or {}).get("message")
    if not message:
        raise HTTPException(status_code=400, detail="Missing message")
    channel = (body or {}).get("channel") or _get_setting(
        db, "slack_default_channel", ""
    )
    _slack_send(db, message=message, channel=channel)
    return {"ok": True}


@router.post("/email/test")
def email_test(
    body: dict,
    db: Session = Depends(get_db),
) -> t.Any:
    subject = (body or {}).get("subject") or "Galago: Email test"
    message = (body or {}).get("message") or "This is a test email from Galago."
    return _send_email(db, subject=subject, message=message)


@router.post("/email/send")
def email_send(
    body: dict,
    db: Session = Depends(get_db),
) -> t.Any:
    subject = (body or {}).get("subject")
    message = (body or {}).get("message")
    if not subject or not message:
        raise HTTPException(status_code=400, detail="Missing subject or message")
    return _send_email(db, subject=subject, message=message)


def _send_email(db: Session, *, subject: str, message: str) -> t.Any:
    host = _get_setting(db, "smtp_host", "")
    port_str = _get_setting(db, "smtp_port", "587")
    user = _get_setting(db, "smtp_user", "")
    sender = _get_setting(db, "smtp_from", "")
    to_csv = _get_setting(db, "smtp_to", "")

    if not host or not sender or not to_csv:
        raise HTTPException(
            status_code=400, detail="SMTP settings incomplete (host/from/to required)"
        )

    try:
        port = int(port_str)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid smtp_port")

    password = _get_secret_plaintext(db, "smtp_password")
    recipients = [x.strip() for x in to_csv.split(",") if x.strip()]
    if not recipients:
        raise HTTPException(
            status_code=400, detail="No recipients configured (smtp_to)"
        )

    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = sender
    msg["To"] = ", ".join(recipients)
    msg.set_content(message)

    try:
        with smtplib.SMTP(host, port, timeout=10) as smtp:
            smtp.ehlo()
            # Opportunistic STARTTLS
            try:
                smtp.starttls()
                smtp.ehlo()
            except Exception:
                pass
            if user:
                smtp.login(user, password)
            smtp.send_message(msg)
        log_event(
            db,
            action="integrations.email.send",
            target_type="integration",
            target_name="smtp",
        )
        return {"ok": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Email send failed: {e}")
