/**
 * appointments.js
 * Dados simulados de agendamentos e constantes do sistema.
 * Em produção, esses dados viriam de uma API REST (backend).
 *
 * Estrutura baseada no modelo de banco:
 * Filial → Centro Cirúrgico → Sala → Agendamento
 * Agendamento referencia: Paciente, Usuário (cirurgião), Tipo de Serviço, Insumo
 */

// ── Constantes ──────────────────────────────────────────────
export const HOURS = [
  '07:00','08:00','09:00','10:00','11:00',
  '12:00','13:00','14:00','15:00','16:00','17:00','18:00'
];

export const DAY_NAMES = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
export const MONTHS = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

export const STATUS_LABELS = {
  green: 'Confirmada',
  yellow: 'Pendente',
  blue: 'Em andamento',
  gray: 'Bloqueado'
};

export const STATUS_OPTIONS = [
  { value: 'yellow', label: 'Pendente' },
  { value: 'green', label: 'Confirmada' },
  { value: 'blue', label: 'Em andamento' },
];

export const SERVICES = [
  'Cirurgia Geral', 'Cirurgia Cardiaca', 'Colonoscopia',
  'Ortopedia', 'Oftalmologia'
];

export const ROOMS = ['Sala 01', 'Sala 02', 'Sala Cardio', 'Sala Norte 01'];

export const SURGEONS = [
  'Dr. Ricardo Alves', 'Dra. Fernanda Lima',
  'Dr. Paulo Mendes'
];

export const FILIAIS = [
  'Hospital Central Goiania',
  'Clinica Norte'
];

export const CENTROS = [
  'Bloco A - Cirurgia Geral',
  'Bloco B - Cardiologia',
  'Centro Cirurgico Norte'
];

// ── Insumos por tipo de cirurgia ─────────────────────────────
export const INSUMOS = {
  'Cirurgia Geral': [
    { name: 'Luvas Estéreis', qty: '4 pares', icon: '🧤' },
    { name: 'Bisturi nº15', qty: '2 un', icon: '🔪' },
    { name: 'Fios de Sutura', qty: '3 un', icon: '🧵' },
    { name: 'Soro Fisiológico', qty: '2L', icon: '💧' },
    { name: 'Gaze Estéril', qty: '20 un', icon: '🩹' },
  ],
  'Cirurgia Cardiaca': [
    { name: 'Propofol 200mg', qty: '2 amp', icon: '💉' },
    { name: 'Luvas Estéreis', qty: '6 pares', icon: '🧤' },
    { name: 'Soro Fisiológico', qty: '4L', icon: '💧' },
  ],
  'Colonoscopia': [
    { name: 'Lidocaina 2%', qty: '1 frasco', icon: '💉' },
    { name: 'Propofol 200mg', qty: '1 amp', icon: '💉' },
    { name: 'Luvas Estéreis', qty: '2 pares', icon: '🧤' },
  ],
  'Ortopedia': [
    { name: 'Luvas Estéreis', qty: '4 pares', icon: '🧤' },
    { name: 'Soro Fisiológico', qty: '3L', icon: '💧' },
  ],
  'Oftalmologia': [
    { name: 'Viscoelástico', qty: '2 un', icon: '💧' },
    { name: 'Micro-bisturi', qty: '1 un', icon: '🔪' },
    { name: 'Luvas Estéreis', qty: '2 pares', icon: '🧤' },
  ],
};

// ── Helpers ──────────────────────────────────────────────────
export function fmtDate(d) {
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

export function getWeekDays(today, weekOffset) {
  const start = new Date(today);
  start.setDate(start.getDate() - start.getDay() + weekOffset * 7);
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(d);
  }
  return days;
}

// ── Agendamentos de exemplo ──────────────────────────────────
export function createInitialAppointments() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const offsets = [-1, 0, 0, 0, 0, 0, 1, 1, 1, 2, 2, 3, 3, 4];
  const data = [
    { off: -1, h: '09:00', service: 'Cirurgia Geral', patient: 'Maria Aparecida Santos', room: 'Sala 01', surgeon: 'Dra. Fernanda Lima', status: 'green', notes: '' },
    { off: -1, h: '14:00', service: 'Oftalmologia', patient: 'Jose Carlos Oliveira', room: 'Sala Norte 01', surgeon: 'Dr. Paulo Mendes', status: 'green', notes: '' },
    { off: 0, h: '07:00', service: 'Cirurgia Geral', patient: 'Ana Paula Ferreira', room: 'Sala 01', surgeon: 'Dr. Ricardo Alves', status: 'green', notes: '' },
    { off: 0, h: '09:00', service: 'Ortopedia', patient: 'Roberto Costa Lima', room: 'Sala 02', surgeon: 'Dra. Fernanda Lima', status: 'green', notes: '' },
    { off: 0, h: '10:00', service: 'Cirurgia Cardiaca', patient: 'Lucia Helena Barbosa', room: 'Sala Cardio', surgeon: 'Dr. Paulo Mendes', status: 'blue', notes: '' },
    { off: 0, h: '12:00', service: 'Bloqueio', patient: '', room: '', surgeon: '', status: 'gray', notes: 'Higienização das salas' },
    { off: 0, h: '14:00', service: 'Colonoscopia', patient: 'Pedro Henrique Souza', room: 'Sala Norte 01', surgeon: 'Dr. Paulo Mendes', status: 'yellow', notes: '' },
    { off: 0, h: '16:00', service: 'Oftalmologia', patient: 'Maria Aparecida Santos', room: 'Sala 02', surgeon: 'Dr. Ricardo Alves', status: 'green', notes: '' },
  ];

  const appts = {};
  data.forEach(item => {
    const d = new Date(today);
    d.setDate(d.getDate() + item.off);
    const key = `${fmtDate(d)}_${item.h}`;
    appts[key] = {
      service: item.service,
      patient: item.patient,
      room: item.room,
      surgeon: item.surgeon,
      status: item.status,
      notes: item.notes,
    };
  });
  return appts;
}
