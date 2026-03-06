from pydantic import BaseModel, AnyHttpUrl
from typing import Any
from .source import Source


class Product(BaseModel):
    id: int
    title: str
    description: str | None = None
    category: str
    price_cents: int
    old_price_cents: int | None = None
    price_suffix: str | None = None
    currency: str = "RON"
    image_url: AnyHttpUrl | None = None
    product_url: AnyHttpUrl | None = None
    affiliate_url: AnyHttpUrl | None = None
    available: bool = True
    rating: float | None = None
    source: Source | None = None
    attributes: dict[str, Any] | None = None

    class Config:
        from_attributes = True


class ProductList(BaseModel):
    items: list[Product]
    total: int

