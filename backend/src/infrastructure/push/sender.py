import json
import logging
from core.config import settings

log = logging.getLogger(__name__)

PAYLOAD = {
    "title": "Inglês na Mão 📚",
    "body": "Hora de praticar! Sua sequência conta com hoje. 🔥",
    "url": "/",
}


def send_push(endpoint: str, p256dh: str, auth: str, payload: dict | None = None) -> str:
    """Retorna 'sent' | 'gone' (endpoint morto, 404/410) | 'error' | 'disabled'."""
    if not settings.vapid_private_key:
        log.warning("VAPID_PRIVATE_KEY não configurada; push ignorado")
        return "disabled"
    try:
        from pywebpush import webpush
    except ImportError:
        log.warning("pywebpush não instalado; push ignorado")
        return "disabled"
    try:
        webpush(
            subscription_info={"endpoint": endpoint, "keys": {"p256dh": p256dh, "auth": auth}},
            data=json.dumps(payload or PAYLOAD),
            vapid_private_key=settings.vapid_private_key,
            vapid_claims={"sub": settings.vapid_subject},
        )
        return "sent"
    except Exception as e:
        status = getattr(getattr(e, "response", None), "status_code", None)
        log.warning("push falhou endpoint=%s... status=%s err=%s", endpoint[:60], status, e)
        if status in (404, 410):
            return "gone"
        return "error"
