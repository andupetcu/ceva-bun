from __future__ import annotations
from typing import Any, Optional
from ..repositories.product_repo import InMemoryProductRepo


class ProductService:
    def __init__(self, repo: InMemoryProductRepo | None = None) -> None:
        self.repo = repo or InMemoryProductRepo()

    def _attach_source(self, p: dict) -> dict:
        src = next((s for s in self.repo.sources if s["id"] == p.get("source_id")), None)
        if src:
            out = dict(p)
            out["source"] = src
            return out
        return p

    def list(
        self,
        *,
        category: Optional[str] = None,
        min_price: Optional[int] = None,
        max_price: Optional[int] = None,
        available: bool = True,
        limit: int = 20,
        offset: int = 0,
    ) -> tuple[list[dict], int]:
        items, total = self.repo.list_products(
            category=category,
            min_price=min_price,
            max_price=max_price,
            available=available,
            limit=limit,
            offset=offset,
        )
        return [self._attach_source(p) for p in items], total

    def get(self, product_id: int) -> dict | None:
        p = self.repo.get_product(product_id)
        return self._attach_source(p) if p else None

    def random(
        self,
        *,
        category: str,
        min_price: Optional[int] = None,
        max_price: Optional[int] = None,
        available: bool = True,
    ) -> dict | None:
        p = self.repo.pick_random(
            category=category,
            min_price=min_price,
            max_price=max_price,
            available=available,
        )
        return self._attach_source(p) if p else None

