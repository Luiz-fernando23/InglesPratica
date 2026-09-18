import uuid
from datetime import datetime
from sqlalchemy import String, DateTime, ForeignKey, Integer, func, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from infrastructure.database.base import Base

def gen_uuid() -> str:
    return str(uuid.uuid4())

class UserModel(Base):
    __tablename__ = "users"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    batches: Mapped[list["GenerationBatchModel"]] = relationship("GenerationBatchModel", back_populates="user", cascade="all, delete-orphan")

class GenerationBatchModel(Base):
    __tablename__ = "generation_batches"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    type: Mapped[str] = mapped_column(String(20), nullable=False)  # phrase | word
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    user: Mapped[UserModel] = relationship("UserModel", back_populates="batches")
    items: Mapped[list["GeneratedItemModel"]] = relationship("GeneratedItemModel", back_populates="batch", cascade="all, delete-orphan", order_by="GeneratedItemModel.order_index")

    __table_args__ = (
        Index("ix_batches_user_created", "user_id", "created_at"),
    )

class GeneratedItemModel(Base):
    __tablename__ = "generated_items"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    batch_id: Mapped[str] = mapped_column(String(36), ForeignKey("generation_batches.id", ondelete="CASCADE"), nullable=False, index=True)
    content_en: Mapped[str] = mapped_column(String(1000), nullable=False)
    content_pt: Mapped[str] = mapped_column(String(1000), nullable=False)
    order_index: Mapped[int] = mapped_column(Integer, nullable=False)
    batch: Mapped[GenerationBatchModel] = relationship("GenerationBatchModel", back_populates="items")

class FavoriteModel(Base):
    __tablename__ = "favorites"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=gen_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    content_en: Mapped[str] = mapped_column(String(1000), nullable=False)
    content_pt: Mapped[str] = mapped_column(String(1000), nullable=False)
    kind: Mapped[str] = mapped_column(String(20), nullable=False, default="word")  # word | phrase
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)

    __table_args__ = (
        Index("ix_fav_user_content", "user_id", "content_en", unique=True),
    )
