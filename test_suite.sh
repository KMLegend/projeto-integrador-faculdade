#!/bin/bash
# ============================================================
# SUITE COMPLETA DE TESTES - AGENDA QUICK API
# ============================================================
BASE="http://localhost:8000"
PASS=0
FAIL=0
WARNINGS=()
FAILURES=()

check() {
  local desc="$1"
  local actual="$2"
  local expected="$3"
  if [ "$actual" = "$expected" ]; then
    echo "  [PASS] $desc"
    PASS=$((PASS+1))
  else
    echo "  [FAIL] $desc | esperado='$expected' obtido='$actual'"
    FAIL=$((FAIL+1))
    FAILURES+=("$desc | esperado='$expected' obtido='$actual'")
  fi
}

echo "============================================================"
echo " AGENDA QUICK - TESTES DE INTEGRAÇÃO DA API"
echo "============================================================"

# ----------------------------------------------------------
# 1. HEALTH CHECK
# ----------------------------------------------------------
echo ""
echo "--- [1] HEALTH CHECK ---"
HEALTH=$(curl -s "$BASE/")
STATUS_VAL=$(echo "$HEALTH" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('status',''))" 2>/dev/null)
check "GET / retorna status=ok" "$STATUS_VAL" "ok"

VERSION=$(echo "$HEALTH" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('version',''))" 2>/dev/null)
check "GET / retorna version=2.0.0" "$VERSION" "2.0.0"

# ----------------------------------------------------------
# 2. AUTENTICAÇÃO
# ----------------------------------------------------------
echo ""
echo "--- [2] AUTENTICAÇÃO ---"

LOGIN_ADMIN=$(curl -s -X POST "$BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@agendaquick.com","password":"admin123"}')
ADMIN_TOKEN=$(echo "$LOGIN_ADMIN" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('access_token',''))" 2>/dev/null)
ADMIN_TYPE=$(echo "$LOGIN_ADMIN" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('user_type',''))" 2>/dev/null)
check "Login admin retorna token" "$([ -n "$ADMIN_TOKEN" ] && echo sim || echo nao)" "sim"
check "Login admin retorna user_type=administrador" "$ADMIN_TYPE" "administrador"

LOGIN_MEDICO=$(curl -s -X POST "$BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"carlos.mendes@agendaquick.com","password":"medico123"}')
MEDICO_TOKEN=$(echo "$LOGIN_MEDICO" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('access_token',''))" 2>/dev/null)
MEDICO_TYPE=$(echo "$LOGIN_MEDICO" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('user_type',''))" 2>/dev/null)
check "Login médico retorna token" "$([ -n "$MEDICO_TOKEN" ] && echo sim || echo nao)" "sim"
check "Login médico retorna user_type=medico" "$MEDICO_TYPE" "medico"

# Login inválido
WRONG_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@agendaquick.com","password":"senha_errada"}')
check "Login com senha errada retorna 401" "$WRONG_STATUS" "401"

NOUSER_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"naoexiste@teste.com","password":"qualquer"}')
check "Login com email inexistente retorna 401" "$NOUSER_STATUS" "401"

# ----------------------------------------------------------
# 3. PROTEÇÃO DE ROTAS (sem token)
# ----------------------------------------------------------
echo ""
echo "--- [3] PROTEÇÃO DE ROTAS (sem token) ---"

for endpoint in "/api/v2/salas" "/api/v2/pacientes" "/api/v2/insumos" "/api/v2/usuarios" "/api/appointments"; do
  STATUS_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE$endpoint")
  check "GET $endpoint sem token retorna 401" "$STATUS_CODE" "401"
done

# ----------------------------------------------------------
# 4. SALAS
# ----------------------------------------------------------
echo ""
echo "--- [4] SALAS (CRUD) ---"

# GET
SALAS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/api/v2/salas" -H "Authorization: Bearer $ADMIN_TOKEN")
check "GET /api/v2/salas retorna 200" "$SALAS_STATUS" "200"

SALAS_BODY=$(curl -s "$BASE/api/v2/salas" -H "Authorization: Bearer $ADMIN_TOKEN")
HAS_ITEMS=$(echo "$SALAS_BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); print('sim' if 'items' in d else 'nao')" 2>/dev/null)
check "GET /api/v2/salas retorna campo 'items'" "$HAS_ITEMS" "sim"

HAS_TOTAL=$(echo "$SALAS_BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); print('sim' if 'total' in d else 'nao')" 2>/dev/null)
check "GET /api/v2/salas retorna campo 'total'" "$HAS_TOTAL" "sim"

# POST - criar sala
CREATE_SALA=$(curl -s -X POST "$BASE/api/v2/salas" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"nome":"Sala Teste API 99","capacidade":5,"ativo":true}')
SALA_ID=$(echo "$CREATE_SALA" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('id',''))" 2>/dev/null)
check "POST /api/v2/salas cria sala e retorna id" "$([ -n "$SALA_ID" ] && echo sim || echo nao)" "sim"

# PUT - atualizar sala
if [ -n "$SALA_ID" ]; then
  UPDATE_SALA=$(curl -s -o /dev/null -w "%{http_code}" -X PUT "$BASE/api/v2/salas/$SALA_ID" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"nome":"Sala Teste Atualizada","capacidade":8}')
  check "PUT /api/v2/salas/$SALA_ID retorna 200" "$UPDATE_SALA" "200"

  # DELETE - remover sala criada no teste
  DEL_SALA=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$BASE/api/v2/salas/$SALA_ID" \
    -H "Authorization: Bearer $ADMIN_TOKEN")
  check "DELETE /api/v2/salas/$SALA_ID retorna 200" "$DEL_SALA" "200"
fi

# POST sala - médico não deve poder criar (role guard)
MEDICO_SALA_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/api/v2/salas" \
  -H "Authorization: Bearer $MEDICO_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"nome":"Sala Medico Sem Permissao","capacidade":3}')
check "POST /api/v2/salas como médico retorna 403" "$MEDICO_SALA_STATUS" "403"

# ----------------------------------------------------------
# 5. PACIENTES
# ----------------------------------------------------------
echo ""
echo "--- [5] PACIENTES (CRUD) ---"

PACIENTES_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/api/v2/pacientes" -H "Authorization: Bearer $ADMIN_TOKEN")
check "GET /api/v2/pacientes retorna 200" "$PACIENTES_STATUS" "200"

# POST - criar paciente
CREATE_PAC=$(curl -s -X POST "$BASE/api/v2/pacientes" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"nome":"Paciente Teste API","cpf":"12345678901","telefone":"11999999999"}')
PAC_ID=$(echo "$CREATE_PAC" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('id',''))" 2>/dev/null)
check "POST /api/v2/pacientes cria paciente e retorna id" "$([ -n "$PAC_ID" ] && echo sim || echo nao)" "sim"

# POST - CPF inválido (menos de 11 dígitos)
CPF_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/api/v2/pacientes" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"nome":"Teste CPF Invalido","cpf":"123"}')
check "POST /api/v2/pacientes CPF inválido retorna 422" "$CPF_STATUS" "422"

# DELETE - limpar paciente de teste
if [ -n "$PAC_ID" ]; then
  DEL_PAC=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$BASE/api/v2/pacientes/$PAC_ID" \
    -H "Authorization: Bearer $ADMIN_TOKEN")
  check "DELETE /api/v2/pacientes/$PAC_ID retorna 200" "$DEL_PAC" "200"
fi

# ----------------------------------------------------------
# 6. INSUMOS
# ----------------------------------------------------------
echo ""
echo "--- [6] INSUMOS (CRUD) ---"

INSUMOS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/api/v2/insumos" -H "Authorization: Bearer $ADMIN_TOKEN")
check "GET /api/v2/insumos retorna 200" "$INSUMOS_STATUS" "200"

# GET categorias de insumos
CAT_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/api/v2/insumos/categorias" -H "Authorization: Bearer $ADMIN_TOKEN")
check "GET /api/v2/insumos/categorias retorna 200" "$CAT_STATUS" "200"

# POST insumo (busca categoria_id=1 que deve existir)
CREATE_INS=$(curl -s -X POST "$BASE/api/v2/insumos" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"nome":"Insumo Teste API","categoria_id":1,"unidade_medida":"unidade","quantidade":10,"ativo":true}')
INS_ID=$(echo "$CREATE_INS" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('id',''))" 2>/dev/null)
check "POST /api/v2/insumos cria insumo e retorna id" "$([ -n "$INS_ID" ] && echo sim || echo nao)" "sim"

# DELETE insumo de teste
if [ -n "$INS_ID" ]; then
  DEL_INS=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$BASE/api/v2/insumos/$INS_ID" \
    -H "Authorization: Bearer $ADMIN_TOKEN")
  check "DELETE /api/v2/insumos/$INS_ID retorna 200" "$DEL_INS" "200"
fi

# ----------------------------------------------------------
# 7. USUÁRIOS
# ----------------------------------------------------------
echo ""
echo "--- [7] USUÁRIOS ---"

USUARIOS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/api/v2/usuarios" -H "Authorization: Bearer $ADMIN_TOKEN")
check "GET /api/v2/usuarios retorna 200" "$USUARIOS_STATUS" "200"

# Médico não deve listar usuários
MEDICO_USR_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/api/v2/usuarios" -H "Authorization: Bearer $MEDICO_TOKEN")
check "GET /api/v2/usuarios como médico retorna 403" "$MEDICO_USR_STATUS" "403"

# POST - criar usuário com senha curta (deve falhar)
SHORT_PWD_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/api/v2/usuarios" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"nome":"Teste","email":"teste@x.com","password":"123","tipo":"medico","filial_id":1}')
check "POST /api/v2/usuarios com senha curta retorna 422" "$SHORT_PWD_STATUS" "422"

# POST - tipo inválido
TIPO_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/api/v2/usuarios" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"nome":"Teste","email":"teste@x.com","password":"senha123","tipo":"invalido","filial_id":1}')
check "POST /api/v2/usuarios com tipo inválido retorna 422" "$TIPO_STATUS" "422"

# ----------------------------------------------------------
# 8. AGENDAMENTOS
# ----------------------------------------------------------
echo ""
echo "--- [8] AGENDAMENTOS ---"

APPT_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/api/appointments" -H "Authorization: Bearer $ADMIN_TOKEN")
check "GET /api/appointments retorna 200" "$APPT_STATUS" "200"

# POST - criar agendamento
CREATE_APPT=$(curl -s -X POST "$BASE/api/appointments" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key":"2030-01-15_10:00","data":{"service":"Cirurgia Geral","patient":"Paciente Teste","room":"Sala 1","surgeon":"Dr. Carlos Mendes","status":"yellow","notes":"Teste de agendamento"}}')
APPT_STATUS_FIELD=$(echo "$CREATE_APPT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('status',''))" 2>/dev/null)
check "POST /api/appointments cria agendamento com status=success" "$APPT_STATUS_FIELD" "success"

# PUT - atualizar status do agendamento
PUT_APPT_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X PUT "$BASE/api/appointments/2030-01-15_10:00" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"green"}')
check "PUT /api/appointments/:key atualiza status (200)" "$PUT_APPT_STATUS" "200"

# DELETE
DEL_APPT_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$BASE/api/appointments/2030-01-15_10:00" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
check "DELETE /api/appointments/:key retorna 200" "$DEL_APPT_STATUS" "200"

# ----------------------------------------------------------
# 9. RELATÓRIOS
# ----------------------------------------------------------
echo ""
echo "--- [9] RELATÓRIOS ---"

REL_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/api/v2/relatorios" -H "Authorization: Bearer $ADMIN_TOKEN")
check "GET /api/v2/relatorios retorna 200" "$REL_STATUS" "200"

REL_BODY=$(curl -s "$BASE/api/v2/relatorios" -H "Authorization: Bearer $ADMIN_TOKEN")
HAS_TOTAL=$(echo "$REL_BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); print('sim' if 'total_cirurgias' in d else 'nao')" 2>/dev/null)
check "GET /api/v2/relatorios retorna campo total_cirurgias" "$HAS_TOTAL" "sim"

HAS_AGENDAMENTOS=$(echo "$REL_BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); print('sim' if 'agendamentos' in d else 'nao')" 2>/dev/null)
check "GET /api/v2/relatorios retorna campo agendamentos" "$HAS_AGENDAMENTOS" "sim"

# Relatório com filtro de data
REL_FILTER_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
  "$BASE/api/v2/relatorios?data_inicio=2025-01-01&data_fim=2025-12-31" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
check "GET /api/v2/relatorios com filtro de data retorna 200" "$REL_FILTER_STATUS" "200"

# ----------------------------------------------------------
# 10. FILIAIS
# ----------------------------------------------------------
echo ""
echo "--- [10] FILIAIS ---"

FILIAIS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/api/v2/filiais" -H "Authorization: Bearer $ADMIN_TOKEN")
check "GET /api/v2/filiais retorna 200" "$FILIAIS_STATUS" "200"

# ----------------------------------------------------------
# 11. PAGINAÇÃO
# ----------------------------------------------------------
echo ""
echo "--- [11] PAGINAÇÃO ---"

PAGE_BODY=$(curl -s "$BASE/api/v2/salas?page=1&page_size=2" -H "Authorization: Bearer $ADMIN_TOKEN")
HAS_PAGE=$(echo "$PAGE_BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); print('sim' if 'page' in d and 'total_pages' in d else 'nao')" 2>/dev/null)
check "GET /api/v2/salas?page=1&page_size=2 retorna paginação" "$HAS_PAGE" "sim"

# Página inválida (0)
PAGE_ZERO_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/api/v2/salas?page=0" -H "Authorization: Bearer $ADMIN_TOKEN")
check "GET /api/v2/salas?page=0 retorna 422 ou 200 com ajuste" "$([ "$PAGE_ZERO_STATUS" = "422" ] || [ "$PAGE_ZERO_STATUS" = "200" ] && echo ok || echo nao)" "ok"

# ----------------------------------------------------------
# 12. BUSCA / FILTROS
# ----------------------------------------------------------
echo ""
echo "--- [12] BUSCA E FILTROS ---"

SEARCH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/api/v2/pacientes?nome=test" -H "Authorization: Bearer $ADMIN_TOKEN")
check "GET /api/v2/pacientes?nome=test retorna 200" "$SEARCH_STATUS" "200"

SEARCH_SALA=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/api/v2/salas?nome=Sala" -H "Authorization: Bearer $ADMIN_TOKEN")
check "GET /api/v2/salas?nome=Sala retorna 200" "$SEARCH_SALA" "200"

# ----------------------------------------------------------
# 13. ENDPOINTS INEXISTENTES
# ----------------------------------------------------------
echo ""
echo "--- [13] ENDPOINTS INEXISTENTES ---"

NOT_FOUND=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/api/v2/nao-existe" -H "Authorization: Bearer $ADMIN_TOKEN")
check "GET /api/v2/nao-existe retorna 404" "$NOT_FOUND" "404"

# ----------------------------------------------------------
# 14. DOCS (SWAGGER)
# ----------------------------------------------------------
echo ""
echo "--- [14] SWAGGER UI ---"

DOCS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/docs")
check "GET /docs retorna 200 (Swagger acessível)" "$DOCS_STATUS" "200"

OPENAPI_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/openapi.json")
check "GET /openapi.json retorna 200" "$OPENAPI_STATUS" "200"

# ----------------------------------------------------------
# RESUMO FINAL
# ----------------------------------------------------------
echo ""
echo "============================================================"
echo " RESUMO DOS TESTES"
echo "============================================================"
echo " PASSOU: $PASS"
echo " FALHOU: $FAIL"
echo " TOTAL:  $((PASS + FAIL))"
echo ""
if [ ${#FAILURES[@]} -gt 0 ]; then
  echo "FALHAS ENCONTRADAS:"
  for f in "${FAILURES[@]}"; do
    echo "  - $f"
  done
fi
echo "============================================================"
