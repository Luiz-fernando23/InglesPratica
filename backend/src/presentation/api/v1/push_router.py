from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from presentation.dependencies.auth import get_current_user
from infrastructure.database.base import get_db
from infrastructure.database.models import PushSubscriptionModel
from infrastructure.push.sender import send_push
from core.config import settings
from domain.entities.user import User

router = APIRouter(prefix="/push", tags=["push"])


class PushKeys(BaseModel):
    p256dh: str
    auth: str


class SubscribeRequest(BaseModel):
    endpoint: str = Field(max_length=2000)
    keys: PushKeys
    remind_time: str = Field(default="08:00", pattern=r"^\d{2}:\d{2}$")


@router.get("/vapid-key")
async def vapid_key():
    return {"public_key": settings.vapid_public_key, "enabled": bool(settings.vapid_private_key)}


@router.post("/subscribe", status_code=201)
async def subscribe(
    body: SubscribeRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    res = await db.execute(
        select(PushSubscriptionModel).where(PushSubscriptionModel.endpoint == body.endpoint)
    )
    sub = res.scalar_one_or_none()
    if sub:
        sub.user_id = str(user.id)
        sub.p256dh = body.keys.p256dh
        sub.auth = body.keys.auth
        sub.remind_time = body.remind_time
    else:
        sub = PushSubscriptionModel(
            user_id=str(user.id),
            endpoint=body.endpoint,
            p256dh=body.keys.p256dh,
            auth=body.keys.auth,
            remind_time=body.remind_time,
        )
        db.add(sub)
    await db.commit()
    return {"ok": True}


@router.delete("/subscribe", status_code=204)
async def unsubscribe(
    endpoint: str = Query(..., max_length=2000),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await db.execute(
        delete(PushSubscriptionModel).where(
            PushSubscriptionModel.endpoint == endpoint,
            PushSubscriptionModel.user_id == str(user.id),
        )
    )
    await db.commit()
    return None


@router.post("/test")
async def test_push(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    res = await db.execute(
        select(PushSubscriptionModel).where(PushSubscriptionModel.user_id == str(user.id))
    )
    subs = list(res.scalars().all())
    results = [send_push(s.endpoint, s.p256dh, s.auth, {"title": "Inglês na Mão 📚", "body": "Push de teste — está funcionando! ✅", "url": "/"}) for s in subs]
    return {"devices": len(subs), "results": results}
