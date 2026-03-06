from fastapi import APIRouter
from ..services.product_service import ProductService
from ..schemas.source import Source


router = APIRouter(prefix="/sources", tags=["sources"])
service = ProductService()


@router.get("", response_model=list[Source])
def list_sources() -> list[Source]:
    return service.repo.list_sources()  # type: ignore[return-value]

