# Agenda Quick — Explicação dos Códigos (Etapa 03)

## 1. Visão Geral da Arquitetura

O Agenda Quick foi construído como uma **SPA (Single Page Application)** contida em um **único arquivo `index.html`**. Toda a lógica de apresentação (HTML), estilização (CSS) e comportamento interativo (JavaScript) coexistem neste arquivo, o que facilita a entrega, o deploy e a manutenção em fase acadêmica.

O conceito central é: **cinco telas (divs)** residem simultaneamente no DOM, mas apenas uma é visível por vez. O JavaScript alterna a visibilidade através da manipulação de classes CSS, criando a ilusão de uma navegação multipáginas, porém sem recarregar o navegador.

---

## 2. Estrutura HTML — O Esqueleto da Aplicação

### 2.1 Cabeçalho (`<head>`)

```html
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Agenda Quick — Agendamento de Centros Cirúrgicos</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

- **`charset="UTF-8"`**: garante a renderização correta de acentos (á, ã, ç, etc.).
- **`viewport`**: permite que o layout se adapte a telas de celulares e tablets (responsividade).
- **Google Fonts (Inter)**: importa a fonte "Inter" para tipografia moderna.

### 2.2 As Cinco Telas (`<div class="screen">`)

Cada tela é um bloco `<div>` com a classe `screen`. Apenas a primeira (Login) recebe a classe `active` no carregamento:

```html
<div id="screen-login"     class="screen active"> ... </div>  <!-- Tela 1 -->
<div id="screen-dashboard"  class="screen screen-wide"> ... </div>  <!-- Tela 2 -->
<div id="screen-patient"    class="screen"> ... </div>         <!-- Tela 3 -->
<div id="screen-schedule"   class="screen"> ... </div>         <!-- Tela 4 -->
<div id="screen-confirm"    class="screen"> ... </div>         <!-- Tela 5 -->
```

- **`screen`**: oculta a div (`display: none`).
- **`active`**: exibe a div (`display: block`) com animação de entrada.
- **`screen-wide`**: variante usada no Dashboard para acomodar o calendário com `max-width: 720px` em vez de `520px`.

### 2.3 Anatomia de Cada Tela

| Tela | ID | Conteúdo Principal |
|------|----|--------------------|
| 1 — Login | `screen-login` | Botão SSO, formulário usuário/senha, botão "Entrar" |
| 2 — Dashboard | `screen-dashboard` | Grid de atalhos, calendário visual de agendamentos, barra de estatísticas |
| 3 — Cadastro de Paciente | `screen-patient` | Campos Nome, CPF e E-mail, botão "Salvar e Continuar" |
| 4 — Agendamento | `screen-schedule` | Selects de Paciente e Sala, inputs de Data/Hora, botão "Confirmar" |
| 5 — Confirmação | `screen-confirm` | Ícone animado de sucesso, resumo da reserva, protocolo |

### 2.4 Formulários e Semântica

Os formulários utilizam a tag `<form>` com o atributo `onsubmit`, que intercepta o envio e evita o recarregamento da página:

```html
<form onsubmit="return handleLogin(event)">
```

O `return false` no handler impede o comportamento padrão do formulário (que seria enviar dados a um servidor e recarregar).

---

## 3. Estilização CSS — Identidade Visual Médica

### 3.1 Variáveis CSS (Custom Properties)

```css
:root {
  --primary: #0B6CB4;       /* Azul hospitalar principal */
  --primary-dark: #084E8A;  /* Azul mais escuro (hover) */
  --primary-light: #4DA3E0; /* Azul mais claro (foco)   */
  --accent: #00C9A7;        /* Verde-menta (destaques)  */
  --bg-body: #EFF4F9;       /* Fundo geral (cinza-azulado leve) */
  --bg-card: #FFFFFF;       /* Fundo dos cartões        */
  --text-primary: #1A2A3A;  /* Texto principal (escuro) */
  --text-muted: #8FA3B5;    /* Texto secundário (cinza) */
  --border: #D4DEE8;        /* Bordas (cinza claro)     */
}
```

Todas as cores do sistema são definidas como variáveis em `:root`. Isso garante **consistência** — se precisarmos alterar o tom de azul, basta mudar uma única linha e toda a interface é atualizada.

### 3.2 Paleta de Cores Médica

As cores foram escolhidas seguindo convenções da área da saúde:
- **Azul (#0B6CB4)**: transmite confiança, segurança, profissionalismo.
- **Verde-menta (#00C9A7)**: associado a saúde e aprovação.
- **Branco e Cinza claro**: limpeza, ambiente estéril, neutralidade.

### 3.3 Sistema de Cards

O elemento `.card` é o container principal de todas as telas:

```css
.card {
  background: #FFFFFF;
  border-radius: 20px;
  box-shadow: 0 16px 48px rgba(11,108,180,0.14);
  padding: 44px 40px;
}
.card::before {   /* Barra colorida no topo */
  height: 5px;
  background: linear-gradient(90deg, #0B6CB4, #00C9A7);
}
```

A barra gradiente no topo do card é um recurso visual que reforça a identidade cromática e cria hierarquia.

### 3.4 Animações

```css
@keyframes fadeSlideIn {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

Quando uma tela recebe a classe `active`, a animação `fadeSlideIn` é disparada, fazendo o conteúdo surgir suavemente de baixo para cima. Isso melhora a percepção de fluidez.

### 3.5 Responsividade

```css
@media (max-width: 560px) {
  .card { padding: 32px 22px; }
}
@media (max-width: 480px) {
  .form-row { grid-template-columns: 1fr; }
  .dashboard-grid { grid-template-columns: 1fr; }
}
```

As media queries adaptam o layout para telas menores: reduzem o padding dos cards e empilham campos que estavam lado a lado em uma única coluna.

### 3.6 Calendário Visual

O calendário é renderizado com CSS Grid de 7 colunas (uma por dia da semana):

```css
.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 3px;
}
.calendar-day.today {
  background: var(--primary);
  color: #fff;
  border-radius: 50%;
}
```

Dias com agendamentos recebem **bolinhas coloridas** (`.event-dot`) posicionadas abaixo do número:
- **Azul**: Cirurgia Geral / Cardiologia
- **Verde**: indicador secundário
- **Laranja**: Ortopedia

---

## 4. JavaScript — Lógica e Interatividade

### 4.1 Função de Navegação (`navigateTo`)

```javascript
function navigateTo(screenId) {
  // Remove 'active' de todas as telas
  document.querySelectorAll('.screen').forEach(function(s) {
    s.classList.remove('active');
  });
  // Adiciona 'active' na tela destino
  document.getElementById(screenId).classList.add('active');
  // Se for o Dashboard, re-renderiza o calendário
  if (screenId === 'screen-dashboard') {
    renderCalendar();
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
```

Esta é a **função central da SPA**. Ela:
1. **Seleciona** todas as divs com classe `screen`.
2. **Remove** a classe `active` de todas (oculta tudo).
3. **Adiciona** `active` somente no destino (mostra a tela desejada).
4. **Re-renderiza** o calendário ao voltar ao Dashboard (para refletir novos agendamentos).

### 4.2 Handlers dos Formulários

Cada formulário possui um handler que intercepta o `submit`:

| Handler | Tela | Ação |
|---------|------|------|
| `handleLogin(event)` | 1 → 2 | Previne recarga, navega ao Dashboard |
| `handlePatient(event)` | 3 → 4 | Cria opção no select de pacientes, navega ao Agendamento |
| `handleSchedule(event)` | 4 → 5 | Preenche resumo, adiciona ao array de agendamentos, navega à Confirmação |

Exemplo — `handlePatient`:
```javascript
function handlePatient(event) {
  event.preventDefault(); // Impede o envio real do formulário

  var patientName = document.getElementById('patient-name').value.trim();
  if (patientName) {
    var select = document.getElementById('sched-patient');
    var option = document.createElement('option');
    option.value = patientName;
    option.textContent = patientName;
    select.appendChild(option); // Adiciona dinamicamente ao select
    select.value = patientName; // Pré-seleciona o novo paciente
  }
  navigateTo('screen-schedule');
}
```

### 4.3 Calendário Interativo

O calendário é **gerado dinamicamente** pelo JavaScript, sem bibliotecas externas:

```javascript
function renderCalendar() {
  var firstDay   = new Date(calViewYear, calViewMonth, 1).getDay(); // Dia da semana do dia 1
  var daysInMonth = new Date(calViewYear, calViewMonth + 1, 0).getDate(); // Total de dias

  // Cria as células vazias antes do dia 1
  for (var e = 0; e < firstDay; e++) { /* div vazia */ }

  // Cria uma célula para cada dia do mês
  for (var d = 1; d <= daysInMonth; d++) {
    // Verifica se tem agendamentos neste dia
    var dayAppts = appointments.filter(function(a) { return a.date === key; });
    if (dayAppts.length > 0) {
      // Adiciona bolinhas coloridas e evento de clique
    }
  }
}
```

**Funcionalidades do calendário:**
- Navegação entre meses (botões ◀ ▶)
- Dia atual destacado com fundo azul
- Bolinhas coloridas nos dias com cirurgias
- Clique em um dia exibe lista de agendamentos (paciente, sala, horário)
- Novos agendamentos aparecem automaticamente ao retornar ao Dashboard

### 4.4 Dados de Agendamentos (Simulação)

```javascript
var appointments = [
  { date: '2026-03-25', time: '07:30', patient: 'Maria da Silva',
    room: 'Sala 01 — Cirurgia Geral', color: 'blue' },
  // ... mais registros
];
```

Os agendamentos são armazenados em um **array JavaScript** (simulando um banco de dados). Ao preencher e confirmar na Tela 4, um novo objeto é adicionado (`.push()`) e o calendário é atualizado ao voltar ao Dashboard.

---

## 5. Fluxo Completo de Navegação

```
┌─────────────┐     ┌──────────────┐     ┌────────────────┐
│  TELA 1     │     │   TELA 2     │     │   TELA 3       │
│  Login      │────▶│  Dashboard   │────▶│  Cadastro      │
│             │     │  + Calendário│◀────│  de Paciente   │
└─────────────┘     └──────┬───────┘     └───────┬────────┘
                           │                     │
                           ▼                     ▼
                    ┌──────────────┐     ┌────────────────┐
                    │   TELA 4     │     │                │
                    │  Agendamento │────▶│   TELA 5       │
                    │              │     │  Confirmação   │
                    └──────────────┘     └────────────────┘
                           ▲                     │
                           └─────────────────────┘
                              "Voltar ao Início"
```

---

## 6. Tecnologias Utilizadas

| Tecnologia | Uso |
|------------|-----|
| HTML5 | Estrutura semântica das 5 telas |
| CSS3 | Layout (Grid, Flexbox), animações, variáveis, media queries |
| JavaScript (ES5) | Navegação SPA, manipulação do DOM, calendário dinâmico |
| Google Fonts | Tipografia Inter (sans-serif moderna) |
| SVG inline | Ícones vetoriais sem dependência de bibliotecas externas |

---

## 7. Conclusão

A implementação demonstra como é possível construir uma interface completa e funcional com tecnologias web nativas (HTML, CSS, JavaScript), sem necessidade de frameworks como React ou Vue.js. O padrão SPA foi implementado manualmente, o que evidencia o entendimento dos conceitos fundamentais de manipulação do DOM, estilização responsiva e programação orientada a eventos.
