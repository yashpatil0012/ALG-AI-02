from fastapi import APIRouter
from app.models.schemas import DemoLoadResponse
from app.services.demo_service import DemoService

router = APIRouter(prefix="/demo", tags=["demo"])

@router.post("/load", response_model=DemoLoadResponse)
def load_demo_data():
    loaded_docs = DemoService.load_demo_data()
    return DemoLoadResponse(
        success=True,
        message=f"Successfully loaded {len(loaded_docs)} demo documents into the vector store.",
        documents_loaded=loaded_docs
    )
