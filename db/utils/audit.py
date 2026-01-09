import typing as t

from sqlalchemy.orm import Session

import db.models.inventory_models as models


def log_event(
    db: Session,
    *,
    action: str,
    target_type: str,
    target_name: t.Optional[str] = None,
    actor: str = "local",
    details: t.Optional[dict] = None,
) -> None:
    """
    Best-effort audit logging. Never raises (to avoid breaking core flows).
    """
    try:
        evt = models.AppAuditEvent(
            actor=actor,
            action=action,
            target_type=target_type,
            target_name=target_name,
            details=details,
        )
        db.add(evt)
        db.commit()
    except Exception:
        # Intentionally swallow audit failures
        db.rollback()
