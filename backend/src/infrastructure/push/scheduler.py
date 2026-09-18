import asyncio
import logging
from datetime import datetime, timezone
from sqlalchemy import select, delete
from core.config import settings
from infrastructure.database.base import AsyncSessionLocal
from infrastructure.database.models import PushSubscriptionModel
from infrastructure.push.sender import send_push

log = logging.getLogger(__name__)


async def _tick():
    now = datetime.now(timezone.utc)
    today = now.date().isoformat()
    hhmm = f"{now.hour:02d}:{now.minute:02d}"
    async with AsyncSessionLocal() as db:
        res = await db.execute(select(PushSubscriptionModel))
        subs = list(res.scalars().all())
        for s in subs:
            if (s.last_sent or "") == today:
                continue
            if (s.remind_time or "08:00") > hhmm:
                continue
            result = await asyncio.to_thread(send_push, s.endpoint, s.p256dh, s.auth)
            if result == "sent":
                s.last_sent = today
                await db.commit()
            elif result == "gone":
                await db.execute(delete(PushSubscriptionModel).where(PushSubscriptionModel.id == s.id))
                await db.commit()
                log.info("push subscription removida (endpoint morto)")
            # 'error'/'disabled': tenta de novo no próximo ciclo


async def push_scheduler_loop():
    if not settings.vapid_private_key:
        log.warning("scheduler de push desativado (sem VAPID_PRIVATE_KEY)")
        return
    log.info("scheduler de push ativo (checagem a cada 60s)")
    while True:
        try:
            await _tick()
        except Exception as e:
            log.warning("push tick falhou: %s", e)
        await asyncio.sleep(60)
