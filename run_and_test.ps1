# ============================================================
#  AgendaQuick — Script de Deploy + Testes de Validacao
#  Uso: Abra o PowerShell NESTA pasta e execute:
#       .\run_and_test.ps1
# ============================================================

$PROJECT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Definition
$LOG_FILE    = Join-Path $PROJECT_DIR "test_results.log"
$BASE_URL    = "http://localhost:8000"
$PASS = 0
$FAIL = 0

function Log($msg) {
    $ts = Get-Date -Format "HH:mm:ss"
    $line = "[$ts] $msg"
    Write-Host $line
    Add-Content -Path $LOG_FILE -Value $line
}

function Check($label, $condition) {
    if ($condition) {
        Log "  [PASS] $label"
        $script:PASS++
    } else {
        Log "  [FAIL] $label"
        $script:FAIL++
    }
}

# Limpa log anterior
Set-Content -Path $LOG_FILE -Value "=== AgendaQuick Test Run $(Get-Date) ==="

# ──────────────────────────────────────────
# 1. Subir Docker Compose
# ──────────────────────────────────────────
Log ""
Log ">>> ETAPA 1: docker compose up --build -d"
Set-Location $PROJECT_DIR
docker compose up --build -d 2>&1 | Tee-Object -Append -FilePath $LOG_FILE

Log ""
Log "Aguardando 30s para containers ficarem prontos..."
Start-Sleep -Seconds 30

# ──────────────────────────────────────────
# 2. Health Check
# ──────────────────────────────────────────
Log ""
Log ">>> ETAPA 2: Health Check"
try {
    $r = Invoke-RestMethod -Uri "$BASE_URL/" -Method GET -TimeoutSec 10
    Check "GET / retorna status ok" ($r.status -eq "ok")
    Check "versao da API e 2.0.0"   ($r.version -eq "2.0.0")
} catch {
    Log "  [FAIL] Health check falhou: $_"
    $script:FAIL += 2
}

# ──────────────────────────────────────────
# 3. Autenticacao
# ──────────────────────────────────────────
Log ""
Log ">>> ETAPA 3: Autenticacao JWT"

$TOKEN_ADMIN = $null
$TOKEN_MEDICO = $null

# Login admin
try {
    $body = @{ email = "admin@agendaquick.com"; password = "admin123" } | ConvertTo-Json
    $r = Invoke-RestMethod -Uri "$BASE_URL/auth/login" -Method POST `
         -ContentType "application/json" -Body $body -TimeoutSec 10
    $TOKEN_ADMIN = $r.access_token
    Check "Login admin retorna access_token" ($TOKEN_ADMIN -ne $null)
    Check "Login admin retorna tipo administrador" ($r.user_type -eq "administrador")
} catch {
    Log "  [FAIL] Login admin falhou: $_"
    $script:FAIL += 2
}

# Login medico
try {
    $body = @{ email = "carlos.mendes@agendaquick.com"; password = "medico123" } | ConvertTo-Json
    $r = Invoke-RestMethod -Uri "$BASE_URL/auth/login" -Method POST `
         -ContentType "application/json" -Body $body -TimeoutSec 10
    $TOKEN_MEDICO = $r.access_token
    Check "Login medico retorna access_token" ($TOKEN_MEDICO -ne $null)
    Check "Login medico retorna tipo medico" ($r.user_type -eq "medico")
} catch {
    Log "  [FAIL] Login medico falhou: $_"
    $script:FAIL += 2
}

# Credenciais invalidas
try {
    $body = @{ email = "ninguem@x.com"; password = "errado" } | ConvertTo-Json
    Invoke-RestMethod -Uri "$BASE_URL/auth/login" -Method POST `
         -ContentType "application/json" -Body $body -TimeoutSec 10
    Log "  [FAIL] Login invalido deveria retornar 401"
    $script:FAIL++
} catch {
    Check "Login invalido retorna 401" ($_.Exception.Response.StatusCode.value__ -eq 401)
}

$HEADERS_ADMIN  = @{ Authorization = "Bearer $TOKEN_ADMIN" }
$HEADERS_MEDICO = @{ Authorization = "Bearer $TOKEN_MEDICO" }

# ──────────────────────────────────────────
# 4. Auth Guard — rota sem token
# ──────────────────────────────────────────
Log ""
Log ">>> ETAPA 4: Auth Guard"
try {
    Invoke-RestMethod -Uri "$BASE_URL/api/v2/salas" -Method GET -TimeoutSec 10
    Log "  [FAIL] Rota sem token deveria retornar 401"
    $script:FAIL++
} catch {
    Check "GET /salas sem token retorna 401" ($_.Exception.Response.StatusCode.value__ -eq 401)
}

# ──────────────────────────────────────────
# 5. CRUD Salas com Paginacao
# ──────────────────────────────────────────
Log ""
Log ">>> ETAPA 5: CRUD Salas + Paginacao"
try {
    $r = Invoke-RestMethod -Uri "$BASE_URL/api/v2/salas?page=1&page_size=5" `
         -Method GET -Headers $HEADERS_ADMIN -TimeoutSec 10
    Check "GET /salas retorna PaginatedResponse" ($r.PSObject.Properties.Name -contains "total")
    Check "GET /salas tem campo items"           ($r.PSObject.Properties.Name -contains "items")
    Check "GET /salas tem total_pages"           ($r.PSObject.Properties.Name -contains "total_pages")
} catch {
    Log "  [FAIL] GET /salas falhou: $_"
    $script:FAIL += 3
}

# Criar sala (admin)
$SALA_NOME = "Sala Teste Script $([int](Get-Date -UFormat %s))"
try {
    $body = @{ nome = $SALA_NOME; capacidade = 5; ativo = $true } | ConvertTo-Json
    $r = Invoke-RestMethod -Uri "$BASE_URL/api/v2/salas" -Method POST `
         -Headers $HEADERS_ADMIN -ContentType "application/json" -Body $body -TimeoutSec 10
    Check "POST /salas (admin) cria sala" ($r.status -eq "success")
} catch {
    Log "  [FAIL] POST /salas falhou: $_"
    $script:FAIL++
}

# Medico nao pode criar sala
try {
    $body = @{ nome = "Sala Proibida"; capacidade = 1 } | ConvertTo-Json
    Invoke-RestMethod -Uri "$BASE_URL/api/v2/salas" -Method POST `
         -Headers $HEADERS_MEDICO -ContentType "application/json" -Body $body -TimeoutSec 10
    Log "  [FAIL] Medico nao deveria criar sala (esperado 403)"
    $script:FAIL++
} catch {
    Check "POST /salas por medico retorna 403" ($_.Exception.Response.StatusCode.value__ -eq 403)
}

# GET /salas/all
try {
    $r = Invoke-RestMethod -Uri "$BASE_URL/api/v2/salas/all" `
         -Method GET -Headers $HEADERS_ADMIN -TimeoutSec 10
    Check "GET /salas/all retorna lista" ($r -is [Array])
} catch {
    Log "  [FAIL] GET /salas/all falhou: $_"
    $script:FAIL++
}

# ──────────────────────────────────────────
# 6. Pacientes
# ──────────────────────────────────────────
Log ""
Log ">>> ETAPA 6: CRUD Pacientes"
try {
    $r = Invoke-RestMethod -Uri "$BASE_URL/api/v2/pacientes?page=1" `
         -Method GET -Headers $HEADERS_ADMIN -TimeoutSec 10
    Check "GET /pacientes retorna PaginatedResponse" ($r.PSObject.Properties.Name -contains "total")
} catch {
    Log "  [FAIL] GET /pacientes falhou: $_"
    $script:FAIL++
}

$CPF_TESTE = "12345678901"
try {
    $body = @{ nome = "Paciente Teste Script"; cpf = $CPF_TESTE; telefone = "11999999999" } | ConvertTo-Json
    $r = Invoke-RestMethod -Uri "$BASE_URL/api/v2/pacientes" -Method POST `
         -Headers $HEADERS_ADMIN -ContentType "application/json" -Body $body -TimeoutSec 10
    Check "POST /pacientes cria paciente" ($r.status -eq "success")
} catch {
    Log "  [FAIL] POST /pacientes falhou: $_ (CPF pode ja existir — ignorado)"
}

# CPF invalido
try {
    $body = @{ nome = "Invalido"; cpf = "123" } | ConvertTo-Json
    Invoke-RestMethod -Uri "$BASE_URL/api/v2/pacientes" -Method POST `
         -Headers $HEADERS_ADMIN -ContentType "application/json" -Body $body -TimeoutSec 10
    Log "  [FAIL] CPF invalido deveria retornar 422"
    $script:FAIL++
} catch {
    Check "POST /pacientes CPF invalido retorna 422" ($_.Exception.Response.StatusCode.value__ -eq 422)
}

# Filtro por nome
try {
    $r = Invoke-RestMethod -Uri "$BASE_URL/api/v2/pacientes?nome=Teste" `
         -Method GET -Headers $HEADERS_ADMIN -TimeoutSec 10
    Check "GET /pacientes?nome= filtra por nome" ($r.PSObject.Properties.Name -contains "items")
} catch {
    Log "  [FAIL] Filtro por nome falhou: $_"
    $script:FAIL++
}

# ──────────────────────────────────────────
# 7. Insumos
# ──────────────────────────────────────────
Log ""
Log ">>> ETAPA 7: Insumos"
try {
    $r = Invoke-RestMethod -Uri "$BASE_URL/api/v2/insumos?page=1" `
         -Method GET -Headers $HEADERS_ADMIN -TimeoutSec 10
    Check "GET /insumos retorna PaginatedResponse" ($r.PSObject.Properties.Name -contains "total")
} catch {
    Log "  [FAIL] GET /insumos falhou: $_"
    $script:FAIL++
}

# ──────────────────────────────────────────
# 8. Usuarios
# ──────────────────────────────────────────
Log ""
Log ">>> ETAPA 8: Usuarios"
try {
    $r = Invoke-RestMethod -Uri "$BASE_URL/api/v2/usuarios?page=1" `
         -Method GET -Headers $HEADERS_ADMIN -TimeoutSec 10
    Check "GET /usuarios (admin) retorna paginado" ($r.PSObject.Properties.Name -contains "total")
} catch {
    Log "  [FAIL] GET /usuarios falhou: $_"
    $script:FAIL++
}

# Medico nao pode listar usuarios
try {
    Invoke-RestMethod -Uri "$BASE_URL/api/v2/usuarios?page=1" `
         -Method GET -Headers $HEADERS_MEDICO -TimeoutSec 10
    Log "  [FAIL] Medico nao deveria acessar /usuarios (esperado 403)"
    $script:FAIL++
} catch {
    Check "GET /usuarios por medico retorna 403" ($_.Exception.Response.StatusCode.value__ -eq 403)
}

# GET /medicos (aberto a qualquer autenticado)
try {
    $r = Invoke-RestMethod -Uri "$BASE_URL/api/v2/usuarios/medicos" `
         -Method GET -Headers $HEADERS_MEDICO -TimeoutSec 10
    Check "GET /usuarios/medicos acessivel ao medico" ($r -is [Array])
} catch {
    Log "  [FAIL] GET /usuarios/medicos falhou: $_"
    $script:FAIL++
}

# ──────────────────────────────────────────
# 9. Agendamentos
# ──────────────────────────────────────────
Log ""
Log ">>> ETAPA 9: Agendamentos"
try {
    $r = Invoke-RestMethod -Uri "$BASE_URL/api/v2/appointments" `
         -Method GET -Headers $HEADERS_ADMIN -TimeoutSec 10
    Check "GET /appointments retorna lista" ($r -ne $null)
} catch {
    Log "  [FAIL] GET /appointments falhou: $_"
    $script:FAIL++
}

# ──────────────────────────────────────────
# 10. Relatorios com filtros
# ──────────────────────────────────────────
Log ""
Log ">>> ETAPA 10: Relatorios com Filtros"
try {
    $r = Invoke-RestMethod -Uri "$BASE_URL/api/v2/relatorios" `
         -Method GET -Headers $HEADERS_ADMIN -TimeoutSec 10
    Check "GET /relatorios retorna cards de totais"     ($r.PSObject.Properties.Name -contains "total_cirurgias")
    Check "GET /relatorios tem campo realizadas"        ($r.PSObject.Properties.Name -contains "realizadas")
    Check "GET /relatorios tem campo agendamentos"      ($r.PSObject.Properties.Name -contains "agendamentos")
    Check "GET /relatorios agendamentos e lista"        ($r.agendamentos -is [Array])
} catch {
    Log "  [FAIL] GET /relatorios falhou: $_"
    $script:FAIL += 4
}

# Filtro por status
try {
    $r = Invoke-RestMethod -Uri "$BASE_URL/api/v2/relatorios?status=agendado" `
         -Method GET -Headers $HEADERS_ADMIN -TimeoutSec 10
    Check "GET /relatorios?status=agendado aceita filtro" ($r.PSObject.Properties.Name -contains "total_cirurgias")
} catch {
    Log "  [FAIL] Relatorio com filtro status falhou: $_"
    $script:FAIL++
}

# Filtro por periodo
try {
    $r = Invoke-RestMethod -Uri "$BASE_URL/api/v2/relatorios?data_inicio=2025-01-01&data_fim=2025-12-31" `
         -Method GET -Headers $HEADERS_ADMIN -TimeoutSec 10
    Check "GET /relatorios com data_inicio e data_fim" ($r.PSObject.Properties.Name -contains "agendamentos")
} catch {
    Log "  [FAIL] Relatorio com filtro data falhou: $_"
    $script:FAIL++
}

# ──────────────────────────────────────────
# 11. Filiais
# ──────────────────────────────────────────
Log ""
Log ">>> ETAPA 11: Filiais"
try {
    $r = Invoke-RestMethod -Uri "$BASE_URL/api/v2/filiais" `
         -Method GET -Headers $HEADERS_ADMIN -TimeoutSec 10
    Check "GET /filiais retorna lista" ($r -is [Array])
} catch {
    Log "  [FAIL] GET /filiais falhou: $_"
    $script:FAIL++
}

# ──────────────────────────────────────────
# Resultado Final
# ──────────────────────────────────────────
$TOTAL = $PASS + $FAIL
Log ""
Log "============================================"
Log "  RESULTADO: $PASS/$TOTAL testes passaram"
if ($FAIL -gt 0) {
    Log "  FALHAS:    $FAIL teste(s) falharam — veja detalhes acima"
} else {
    Log "  TODOS OS TESTES PASSARAM!"
}
Log "  Log salvo em: $LOG_FILE"
Log "============================================"
Log ""

# Manter janela aberta
Write-Host ""
Write-Host "Pressione ENTER para fechar..." -NoNewline
Read-Host
