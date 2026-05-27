from fastapi.testclient import TestClient
from unittest.mock import MagicMock
from main import app
from presentation.routes.appointments import get_repository

# We mock the repository to avoid DB connection in unit tests
mock_repo = MagicMock()

from core.deps import get_current_user
from infrastructure.models import Usuario

def override_get_repository():
    return mock_repo

def override_get_current_user():
    return Usuario(
        id=1,
        nome="Admin Test",
        email="admin@agendaquick.com",
        tipo="administrador",
        ativo=True
    )

app.dependency_overrides[get_repository] = override_get_repository
app.dependency_overrides[get_current_user] = override_get_current_user
client = TestClient(app)

def test_health_check():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_get_appointments_api():
    mock_repo.get_all.return_value = []
    response = client.get("/api/v2/appointments")
    assert response.status_code == 200
    assert response.json() == {}

def test_create_appointment_api():
    mock_repo.resolve_ids.return_value = {
        'tipo_servico_id': 1, 'patient_id': 1, 'sala_id': 1, 'medico_id': 1
    }
    # repo.save will be called by use_case
    
    payload = {
        "key": "2025-08-04_08:00",
        "data": {
            "service": "Cirurgia Geral",
            "patient": "Maria",
            "room": "Sala 01",
            "surgeon": "Dr. Ricardo",
            "status": "yellow"
        }
    }
    response = client.post("/api/v2/appointments", json=payload)
    assert response.status_code == 201
    assert response.json() == {"status": "success"}
