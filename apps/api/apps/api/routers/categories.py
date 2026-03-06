from fastapi import APIRouter

router = APIRouter(tags=["categories"])


CATEGORIES = [
    "Ceva Bun de Baut",
    "Ceva Buna de Mancat",
    "Ceva Bun de Facut",
]


@router.get("/categories")
def get_categories() -> list[str]:
    return CATEGORIES

