import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from presentation.auth import router as auth_router
from presentation.routes.appointments import router as appointments_router
from presentation.routes.salas import router as salas_router
from presentation.routes.pacientes import router as pacientes_router
from presentation.routes.insumos import router as insumos_router
from presentation.routes.usuarios import router as usuarios_router
from presentation.routes.relatorios import router as relatorios_router
from presentation.routes.filiais import router as filiais_router

# Origens permitidas — em producao, substitua "*" pelos dominios reais
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")

app = FastAPI(
    title="Agenda Quick API",
    description="API de agendamento de centros cirurgicos",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Rotas de autenticacao (sem prefixo de versao) ──
app.include_router(auth_router)

# ── Rotas da API v2 ──
API_PREFIX = "/api/v2"

app.include_router(appointments_router, prefix=API_PREFIX)
app.include_router(salas_router,        prefix=API_PREFIX)
app.include_router(pacientes_router,    prefix=API_PREFIX)
app.include_router(insumos_router,      prefix=API_PREFIX)
app.include_router(usuarios_router,     prefix=API_PREFIX)
app.include_router(relatorios_router,   prefix=API_PREFIX)
app.include_router(filiais_router,      prefix=API_PREFIX)


@app.get("/", tags=["health"])
def health_check():
    return {"status": "ok", "message": "Agenda Quick API esta no ar", "version": "2.0.0"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
