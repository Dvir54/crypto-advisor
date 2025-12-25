from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import relationship
import uuid

from app.models.base import Base


class Preferences(Base):
    __tablename__ = "preferences"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True)
    crypto_assets = Column(ARRAY(String))  # ["BTC", "ETH", "SOL"]
    investor_type = Column(String)  # "hodler" | "daytrader" | "nft"
    content_types = Column(ARRAY(String))  # ["news", "charts", "social", "fun"]

    user = relationship("User", back_populates="preferences")

