"""
Rotas de Filiais — apenas orquestracao HTTP.
"""
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from core.database import get_db
from core.deps import get_current_user
from infrastructure.models import Filial
from presentation.schemas import FilialResponse

router = APIRouter(
    prefix="/filiais",
    tags=["filiais"],
    dependencies=[Depends(get_current_user)],
)


@router.get("", response_model=List[FilialResponse])
def listar_filiais(db: Session = Depends(get_db)):
    return db.query(Filial).all()
