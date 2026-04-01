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
  'Cirurgia Geral', 'Ortopedia', 'Cardiologia',
  'Neurologia', 'Oftalmologia', 'Urologia'
];

export const ROOMS = ['Sala 01','Sala 02','Sala 03','Sala 04','Sala 05'];

export const SURGEONS = [
  'Dra. Ana Silva', 'Dr. Carlos Mendes',
  'Dra. Juliana Ferreira', 'Dr. Roberto Almeida'
];

export const FILIAIS = [
  'Hospital Central — São Paulo',
  'Hospital Norte — Campinas',
  'Hospital Sul — Santos'
];

export const CENTROS = [
  'Centro Cirúrgico A — Geral',
  'Centro Cirúrgico B — Especializado'
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
  'Ortopedia': [
    { name: 'Luvas Estéreis', qty: '4 pares', icon: '🧤' },
    { name: 'Parafusos Ortopédicos', qty: '6 un', icon: '🔩' },
    { name: 'Placas de Titânio', qty: '2 un', icon: '🦴' },
    { name: 'Soro Fisiológico', qty: '3L', icon: '💧' },
    { name: 'Cimento Ósseo', qty: '1 un', icon: '🧱' },
  ],
  'Cardiologia': [
    { name: 'Cateter Cardíaco', qty: '2 un', icon: '❤️' },
    { name: 'Stent', qty: '1 un', icon: '🫀' },
    { name: 'Luvas Estéreis', qty: '6 pares', icon: '🧤' },
    { name: 'Contraste', qty: '100mL', icon: '💉' },
    { name: 'Soro Fisiológico', qty: '4L', icon: '💧' },
  ],
  'Neurologia': [
    { name: 'Micro-instrumentos', qty: '1 kit', icon: '🔬' },
    { name: 'Luvas Estéreis', qty: '6 pares', icon: '🧤' },
    { name: 'Clips de Aneurisma', qty: '3 un', icon: '📎' },
    { name: 'Soro Fisiológico', qty: '3L', icon: '💧' },
    { name: 'Gaze Estéril', qty: '30 un', icon: '🩹' },
  ],
  'Oftalmologia': [
    { name: 'Lente Intraocular', qty: '1 un', icon: '👁️' },
    { name: 'Viscoelástico', qty: '2 un', icon: '💧' },
    { name: 'Micro-bisturi', qty: '1 un', icon: '🔪' },
    { name: 'Luvas Estéreis', qty: '2 pares', icon: '🧤' },
    { name: 'Colírio Anestésico', qty: '1 un', icon: '💉' },
  ],
  'Urologia': [
    { name: 'Cateter Uretral', qty: '2 un', icon: '🏥' },
    { name: 'Luvas Estéreis', qty: '4 pares', icon: '🧤' },
    { name: 'Soro Fisiológico', qty: '3L', icon: '💧' },
    { name: 'Bisturi nº11', qty: '2 un', icon: '🔪' },
    { name: 'Gaze Estéril', qty: '20 un', icon: '🩹' },
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
    { off: -1, h: '09:00', service: 'Cirurgia Geral', patient: 'Teresa Cristina', room: 'Sala 01', surgeon: 'Dra. Ana Silva', status: 'green', notes: 'Apendicectomia' },
    { off: -1, h: '14:00', service: 'Oftalmologia', patient: 'Antônio Souza', room: 'Sala 05', surgeon: 'Dra. Ana Silva', status: 'green', notes: 'Vitrectomia posterior' },
    { off: 0, h: '07:00', service: 'Cirurgia Geral', patient: 'Maria da Silva Santos', room: 'Sala 01', surgeon: 'Dra. Ana Silva', status: 'green', notes: 'Colecistectomia laparoscópica' },
    { off: 0, h: '09:00', service: 'Ortopedia', patient: 'João Pedro Oliveira', room: 'Sala 02', surgeon: 'Dr. Carlos Mendes', status: 'green', notes: 'Artroscopia de joelho direito' },
    { off: 0, h: '10:00', service: 'Cardiologia', patient: 'Ana Clara Mendes', room: 'Sala 03', surgeon: 'Dra. Juliana Ferreira', status: 'blue', notes: 'Cateterismo cardíaco' },
    { off: 0, h: '12:00', service: 'Bloqueio', patient: '', room: '', surgeon: '', status: 'gray', notes: 'Higienização das salas' },
    { off: 0, h: '14:00', service: 'Neurologia', patient: 'Carlos Eduardo Lima', room: 'Sala 04', surgeon: 'Dr. Roberto Almeida', status: 'yellow', notes: 'Craniotomia — aguardando exames' },
    { off: 0, h: '16:00', service: 'Oftalmologia', patient: 'Fernanda Costa', room: 'Sala 05', surgeon: 'Dra. Ana Silva', status: 'green', notes: 'Facoemulsificação catarata OE' },
    { off: 1, h: '08:00', service: 'Cirurgia Geral', patient: 'Roberto Almeida Jr.', room: 'Sala 01', surgeon: 'Dra. Juliana Ferreira', status: 'yellow', notes: 'Herniorrafia inguinal' },
    { off: 1, h: '10:00', service: 'Ortopedia', patient: 'Luciana Martins', room: 'Sala 02', surgeon: 'Dr. Carlos Mendes', status: 'green', notes: 'Fixação de fratura de fêmur' },
    { off: 1, h: '12:00', service: 'Bloqueio', patient: '', room: '', surgeon: '', status: 'gray', notes: 'Higienização das salas' },
    { off: 1, h: '14:00', service: 'Urologia', patient: 'Paulo Henrique Dias', room: 'Sala 03', surgeon: 'Dr. Roberto Almeida', status: 'yellow', notes: 'Litotripsia' },
    { off: 2, h: '09:00', service: 'Cardiologia', patient: 'Marcos Vinícius', room: 'Sala 03', surgeon: 'Dra. Juliana Ferreira', status: 'green', notes: 'Implante de marcapasso' },
    { off: 2, h: '12:00', service: 'Bloqueio', patient: '', room: '', surgeon: '', status: 'gray', notes: 'Higienização' },
    { off: 3, h: '08:00', service: 'Neurologia', patient: 'Juliana Ferreira Lopes', room: 'Sala 04', surgeon: 'Dr. Roberto Almeida', status: 'green', notes: 'Descompressão microvascular' },
    { off: 3, h: '12:00', service: 'Bloqueio', patient: '', room: '', surgeon: '', status: 'gray', notes: 'Higienização' },
    { off: 4, h: '10:00', service: 'Ortopedia', patient: 'Renato Borges', room: 'Sala 02', surgeon: 'Dr. Carlos Mendes', status: 'yellow', notes: 'Artroplastia total de quadril' },
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
