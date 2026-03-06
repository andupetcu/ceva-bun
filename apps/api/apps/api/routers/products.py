from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from ..services.product_service import ProductService
from ..schemas.product import Product, ProductList


router = APIRouter(prefix="/products", tags=["products"])
service = ProductService()


@router.get("", response_model=ProductList)
def list_products(
    category: Optional[str] = Query(default=None),
    min_price: Optional[int] = Query(default=None, ge=0),
    max_price: Optional[int] = Query(default=None, ge=0),
    available: bool = Query(default=True),
    limit: int = Query(default=20, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
) -> ProductList:
    items, total = service.list(
        category=category,
        min_price=min_price,
        max_price=max_price,
        available=available,
        limit=limit,
        offset=offset,
    )
    return ProductList(items=items, total=total)


@router.get("/random", response_model=Product)
def random_product(
    category: str = Query(...),
    min_price: Optional[int] = Query(default=None, ge=0),
    max_price: Optional[int] = Query(default=None, ge=0),
    available: bool = Query(default=True),
) -> Product:
    result = service.random(
        category=category,
        min_price=min_price,
        max_price=max_price,
        available=available,
    )
    if not result:
        raise HTTPException(status_code=404, detail="No product found for filters")
    return result  # type: ignore[return-value]


@router.get("/{product_id}", response_model=Product)
def get_product(product_id: int) -> Product:
    p = service.get(product_id)
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")
    return p  # type: ignore[return-value]

