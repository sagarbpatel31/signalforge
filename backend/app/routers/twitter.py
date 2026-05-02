from fastapi import APIRouter
from ..schemas import Post
from ..mock_data import POSTS

router = APIRouter(prefix="/api", tags=["twitter"])


@router.get("/posts", response_model=list[Post])
async def get_posts() -> list[Post]:
    return POSTS
