from __future__ import annotations
import random
from datetime import datetime, timedelta
from typing import Iterable, Optional


class InMemoryProductRepo:
    def __init__(self) -> None:
        now = datetime.utcnow()
        self.sources = [
            {
                "id": 1,
                "name": "Escape Central",
                "url": "https://escapecentral.ro",
                "affiliate_url": None,
            },
            {
                "id": 2,
                "name": "Mega Image",
                "url": "https://www.mega-image.ro/",
                "affiliate_url": None,
            },
        ]
        self.products = [
            {
                "id": 1,
                "title": "Phantom of the Opera - Escape Room",
                "description": "O experiență plină de suspans și mister.",
                "category": "Ceva Bun de Facut",
                "price_cents": 11000,
                "price_suffix": "lei/persoană",
                "image_url": "https://escapecentral.ro/wp-content/uploads/2025/09/Background4-450x450.jpg",
                "product_url": "https://escapecentral.ro",
                "source_id": 1,
                "available": True,
                "created_at": now - timedelta(days=2),
                "old_price_cents": 13000,
            },
            {
                "id": 2,
                "title": "Cafea de specialitate",
                "description": "Single origin, prăjire medie.",
                "category": "Ceva Bun de Baut",
                "price_cents": 3500,
                "image_url": None,
                "product_url": None,
                "source_id": 2,
                "available": True,
                "created_at": now - timedelta(days=14),
                "old_price_cents": None,
            },
            {
                "id": 3,
                "title": "Burger artizanal",
                "description": "Carne de vită, cheddar, sos casei.",
                "category": "Ceva Buna de Mancat",
                "price_cents": 4200,
                "image_url": None,
                "product_url": None,
                "source_id": 2,
                "available": True,
                "created_at": now - timedelta(days=40),
                "old_price_cents": 5000,
            },
        ]

    def list_sources(self) -> list[dict]:
        return self.sources

    def list_products(
        self,
        *,
        category: Optional[str] = None,
        min_price: Optional[int] = None,
        max_price: Optional[int] = None,
        available: bool = True,
        limit: int = 20,
        offset: int = 0,
    ) -> tuple[list[dict], int]:
        items: Iterable[dict] = self.products
        if available:
            items = [p for p in items if p.get("available", True)]
        if category:
            items = [p for p in items if p["category"] == category]
        if min_price is not None:
            items = [p for p in items if p["price_cents"] >= min_price]
        if max_price is not None:
            items = [p for p in items if p["price_cents"] <= max_price]

        items = list(items)
        total = len(items)
        items = items[offset : offset + limit]
        return items, total

    def get_product(self, product_id: int) -> dict | None:
        return next((p for p in self.products if p["id"] == product_id), None)

    def pick_random(
        self,
        *,
        category: str,
        min_price: Optional[int] = None,
        max_price: Optional[int] = None,
        available: bool = True,
    ) -> dict | None:
        candidates, _ = self.list_products(
            category=category,
            min_price=min_price,
            max_price=max_price,
            available=available,
            limit=200,
            offset=0,
        )
        if not candidates:
            return None

        def weight(p: dict) -> float:
            created_at = p.get("created_at")
            freshness_boost = 0.0
            if created_at:
                age = datetime.utcnow() - created_at
                if age <= timedelta(days=7):
                    freshness_boost = 0.5
                elif age <= timedelta(days=30):
                    freshness_boost = 0.2
            discount_boost = 0.0
            old = p.get("old_price_cents")
            nowp = p.get("price_cents")
            if old and nowp and nowp < old and old > 0:
                discount_boost = min((old - nowp) / old, 0.5)
            return 1.0 + freshness_boost + discount_boost

        weights = [weight(p) for p in candidates]
        choice = random.choices(candidates, weights=weights, k=1)[0]
        return choice

