from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from typing import List
from core.database import get_db
from infrastructure.models import Sala, Paciente, Insumo, Agendamento
from .schemas import SalaSchema, PacienteSchema, InsumoSchema

router = APIRouter(prefix="/api", tags=["auxiliary"])

# --- SALAS ---
@router.get("/salas", response_model=List[SalaSchema])
def get_salas(db: Session = Depends(get_db)):
    return db.query(Sala).all()

@router.post("/salas")
def create_sala(sala: dict, db: Session = Depends(get_db)):
    db_sala = Sala(nome=sala.get("nome"), capacidade=sala.get("capacidade"), ativo=sala.get("ativo", True), centro_id=1)
    db.add(db_sala)
    db.commit()
    return {"status": "success"}

@router.put("/salas/{sala_id}")
def update_sala(sala_id: int, sala: dict, db: Session = Depends(get_db)):
    db_sala = db.query(Sala).filter(Sala.id == sala_id).first()
    if not db_sala: raise HTTPException(status_code=404)
    db_sala.nome = sala.get("nome", db_sala.nome)
    db_sala.capacidade = sala.get("capacidade", db_sala.capacidade)
    db_sala.ativo = sala.get("ativo", db_sala.ativo)
    db.commit()
    return {"status": "success"}

@router.delete("/salas/{sala_id}")
def delete_sala(sala_id: int, db: Session = Depends(get_db)):
    db_sala = db.query(Sala).filter(Sala.id == sala_id).first()
    if db_sala:
        db.delete(db_sala)
        db.commit()
    return {"status": "success"}

@router.post("/salas/bulk")
def bulk_salas(salas: List[dict], db: Session = Depends(get_db)):
    new_salas = [Sala(nome=s.get("nome"), capacidade=s.get("capacidade"), ativo=s.get("ativo", True), centro_id=1) for s in salas]
    db.add_all(new_salas)
    db.commit()
    return {"status": "success"}

# --- PACIENTES ---
@router.get("/pacientes", response_model=List[PacienteSchema])
def get_pacientes(db: Session = Depends(get_db)):
    return db.query(Paciente).all()

@router.post("/pacientes")
def create_paciente(pac: dict, db: Session = Depends(get_db)):
    db_pac = Paciente(nome=pac.get("nome"), cpf=pac.get("cpf"), telefone=pac.get("telefone"), filial_id=1)
    db.add(db_pac)
    db.commit()
    return {"status": "success"}

@router.put("/pacientes/{pac_id}")
def update_paciente(pac_id: int, pac: dict, db: Session = Depends(get_db)):
    db_pac = db.query(Paciente).filter(Paciente.id == pac_id).first()
    if not db_pac: raise HTTPException(status_code=404)
    db_pac.nome = pac.get("nome", db_pac.nome)
    db_pac.cpf = pac.get("cpf", db_pac.cpf)
    db_pac.telefone = pac.get("telefone", db_pac.telefone)
    db.commit()
    return {"status": "success"}

@router.delete("/pacientes/{pac_id}")
def delete_paciente(pac_id: int, db: Session = Depends(get_db)):
    db_pac = db.query(Paciente).filter(Paciente.id == pac_id).first()
    if db_pac:
        db.delete(db_pac)
        db.commit()
    return {"status": "success"}

@router.post("/pacientes/bulk")
def bulk_pacientes(pacs: List[dict], db: Session = Depends(get_db)):
    new_pacs = [Paciente(nome=p.get("nome"), cpf=p.get("cpf"), telefone=p.get("telefone"), filial_id=1) for p in pacs]
    db.add_all(new_pacs)
    db.commit()
    return {"status": "success"}

# --- INSUMOS ---
@router.get("/insumos", response_model=List[InsumoSchema])
def get_insumos(db: Session = Depends(get_db)):
    return db.query(Insumo).all()

@router.post("/insumos")
def create_insumo(ins: dict, db: Session = Depends(get_db)):
    db_ins = Insumo(
        nome=ins.get("nome"), 
        categoria_id=ins.get("categoria_id", 1), 
        unidade_medida=ins.get("unidade_medida"), 
        quantidade=ins.get("quantidade", 0),
        ativo=ins.get("ativo", True)
    )
    db.add(db_ins)
    db.commit()
    return {"status": "success"}

@router.put("/insumos/{ins_id}")
def update_insumo(ins_id: int, ins: dict, db: Session = Depends(get_db)):
    db_ins = db.query(Insumo).filter(Insumo.id == ins_id).first()
    if not db_ins: raise HTTPException(status_code=404)
    db_ins.nome = ins.get("nome", db_ins.nome)
    db_ins.categoria_id = ins.get("categoria_id", db_ins.categoria_id)
    db_ins.unidade_medida = ins.get("unidade_medida", db_ins.unidade_medida)
    db_ins.quantidade = ins.get("quantidade", db_ins.quantidade)
    db_ins.ativo = ins.get("ativo", db_ins.ativo)
    db.commit()
    return {"status": "success"}

@router.delete("/insumos/{ins_id}")
def delete_insumo(ins_id: int, db: Session = Depends(get_db)):
    db_ins = db.query(Insumo).filter(Insumo.id == ins_id).first()
    if db_ins:
        db.delete(db_ins)
        db.commit()
    return {"status": "success"}

@router.post("/insumos/bulk")
def bulk_insumos(insumos: List[dict], db: Session = Depends(get_db)):
    new_ins = [
        Insumo(
            nome=i.get("nome"), 
            categoria_id=i.get("categoria_id", 1), 
            unidade_medida=i.get("unidade_medida", "unidade"), 
            quantidade=i.get("quantidade", 0),
            ativo=i.get("ativo", True)
        ) for i in insumos
    ]
    db.add_all(new_ins)
    db.commit()
    return {"status": "success"}

# --- RELATORIOS ---
@router.get("/relatorios")
def get_relatorios(db: Session = Depends(get_db)):
    total_cirurgias = db.query(Agendamento).count()
    realizadas = db.query(Agendamento).filter(Agendamento.status == 'realizado').count()
    canceladas = db.query(Agendamento).filter(Agendamento.status == 'cancelado').count()
    total_pacientes = db.query(Paciente).count()
    total_salas = db.query(Sala).count()

    return {
        "total_cirurgias": total_cirurgias,
        "realizadas": realizadas,
        "canceladas": canceladas,
        "total_pacientes": total_pacientes,
        "total_salas": total_salas,
    }
