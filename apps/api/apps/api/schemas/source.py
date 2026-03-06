from pydantic import BaseModel, AnyHttpUrl


class Source(BaseModel):
    id: int | None = None
    name: str
    url: AnyHttpUrl | None = None
    affiliate_url: AnyHttpUrl | None = None

    class Config:
        from_attributes = True

