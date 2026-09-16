/* ============================================================
   GRUPOAPP - SISTEMA DE GESTÃO COMPLETA
   Arquitetura: Estado global + Views + Firestore (com cache local)
   ============================================================ */

const DB_KEY = 'grupoapp_db_v1';
const SESSION_KEY = 'grupoapp_session_v1';
const THEME_KEY = 'grupoapp_theme_v1';
const FIRESTORE_DOC = 'grupoapp/main';

async function loadDB() {
  if (window.firestore) {
    try {
      const remote = await window.firestore.doc(FIRESTORE_DOC).get();
      if (remote.exists) {
        const data = remote.data();
        localStorage.setItem(DB_KEY, JSON.stringify(data));
        return data;
      }
    } catch (error) {
      console.warn('Firestore indisponível; usando cache local:', error);
    }
  }
  const raw = localStorage.getItem(DB_KEY);
  if (raw) return JSON.parse(raw);
  const seed = seedDatabase();
  saveDB(seed);
  return seed;
}
function saveDB(db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
  if (!window.firestore) return Promise.resolve();
  return window.firestore.doc(FIRESTORE_DOC).set(db)
    .catch(error => {
      console.error('Falha ao salvar no Firestore:', error);
      toast('Não foi possível sincronizar com o Firebase', 'error');
    });
}
function getSession() { const s = localStorage.getItem(SESSION_KEY); return s ? JSON.parse(s) : null; }
function setSession(s) { localStorage.setItem(SESSION_KEY, JSON.stringify(s)); }
function clearSession() { localStorage.removeItem(SESSION_KEY); }
function isAdmin() { return state.user?.role === 'admin'; }
function requireAdmin() {
  if (isAdmin()) return true;
  toast('Este usuário possui apenas permissão de visualização', 'warning');
  return false;
}

let DB = null;
let state = {
  view: 'dashboard',
  user: getSession(),
  filters: { members: { search: '', status: '' } },
};

function seedDatabase() {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const users = [
    { id: 1, name: 'Administrador', email: 'admin@grupoapp.com', password: 'admin123', role: 'admin', status: 'active', created_at: new Date().toISOString() },
    { id: 2, name: 'Visualizador', email: 'usuario@grupoapp.com', password: 'user123', role: 'user', status: 'active', created_at: new Date().toISOString() }
  ];

  const members = [
    { id: 1, full_name: 'João da Silva', nickname: 'João', cpf: '123.456.789-00', rg: '12.345.678-9', birth_date: '1985-09-18', gender: 'M', marital_status: 'Casado', nationality: 'Brasileira', naturalidade: 'São Paulo', phone: '(11) 98765-4321', whatsapp: '5511987654321', email: 'joao@email.com', emergency_contact: 'Maria Silva', emergency_phone: '(11) 91234-5678', zip_code: '01001-000', street: 'Av. Paulista', number: '1000', complement: 'Apto 42', neighborhood: 'Bela Vista', city: 'São Paulo', state: 'SP', photo: '', entry_date: '2020-03-15', exit_date: '', role: 'Tesoureiro', status: 'active', notes: 'Membro fundador', created_at: '2020-03-15T10:00:00Z', updated_at: '2020-03-15T10:00:00Z' },
    { id: 2, full_name: 'Maria Oliveira', nickname: 'Maria', cpf: '234.567.890-11', rg: '23.456.789-0', birth_date: '1990-09-23', gender: 'F', marital_status: 'Solteira', nationality: 'Brasileira', naturalidade: 'Rio de Janeiro', phone: '(21) 98888-7777', whatsapp: '5521988887777', email: 'maria@email.com', emergency_contact: 'José Oliveira', emergency_phone: '(21) 97777-6666', zip_code: '20040-020', street: 'Rua do Ouvidor', number: '50', complement: '', neighborhood: 'Centro', city: 'Rio de Janeiro', state: 'RJ', photo: '', entry_date: '2021-01-10', exit_date: '', role: 'Secretária', status: 'active', notes: '', created_at: '2021-01-10T10:00:00Z', updated_at: '2021-01-10T10:00:00Z' },
    { id: 3, full_name: 'Carlos Santos', nickname: 'Carlos', cpf: '345.678.901-22', rg: '34.567.890-1', birth_date: '1978-09-29', gender: 'M', marital_status: 'Casado', nationality: 'Brasileira', naturalidade: 'Belo Horizonte', phone: '(31) 99999-8888', whatsapp: '5531999998888', email: 'carlos@email.com', emergency_contact: 'Ana Santos', emergency_phone: '(31) 98888-7777', zip_code: '30130-000', street: 'Rua da Bahia', number: '1120', complement: '', neighborhood: 'Centro', city: 'Belo Horizonte', state: 'MG', photo: '', entry_date: '2019-06-20', exit_date: '', role: 'Membro', status: 'active', notes: '', created_at: '2019-06-20T10:00:00Z', updated_at: '2019-06-20T10:00:00Z' },
    { id: 4, full_name: 'José Pereira', nickname: 'Zé', cpf: '456.789.012-33', rg: '45.678.901-2', birth_date: '1982-10-05', gender: 'M', marital_status: 'Divorciado', nationality: 'Brasileira', naturalidade: 'Curitiba', phone: '(41) 97777-5555', whatsapp: '5541977775555', email: 'jose@email.com', emergency_contact: 'Paula Pereira', emergency_phone: '(41) 96666-4444', zip_code: '80010-000', street: 'Rua XV de Novembro', number: '200', complement: '', neighborhood: 'Centro', city: 'Curitiba', state: 'PR', photo: '', entry_date: '2022-02-14', exit_date: '', role: 'Membro', status: 'active', notes: '', created_at: '2022-02-14T10:00:00Z', updated_at: '2022-02-14T10:00:00Z' },
    { id: 5, full_name: 'Ana Souza', nickname: 'Aninha', cpf: '567.890.123-44', rg: '56.789.012-3', birth_date: '1995-09-12', gender: 'F', marital_status: 'Solteira', nationality: 'Brasileira', naturalidade: 'Porto Alegre', phone: '(51) 96666-3333', whatsapp: '5551966663333', email: 'ana@email.com', emergency_contact: 'Roberto Souza', emergency_phone: '(51) 95555-2222', zip_code: '90020-000', street: 'Rua dos Andradas', number: '1234', complement: '', neighborhood: 'Centro Histórico', city: 'Porto Alegre', state: 'RS', photo: '', entry_date: '2023-05-01', exit_date: '', role: 'Membro', status: 'active', notes: '', created_at: '2023-05-01T10:00:00Z', updated_at: '2023-05-01T10:00:00Z' },
    { id: 6, full_name: 'Pedro Almeida', nickname: 'Pedrão', cpf: '678.901.234-55', rg: '67.890.123-4', birth_date: '1988-11-20', gender: 'M', marital_status: 'Casado', nationality: 'Brasileira', naturalidade: 'Salvador', phone: '(71) 95555-1111', whatsapp: '5571955551111', email: 'pedro@email.com', emergency_contact: 'Lucia Almeida', emergency_phone: '(71) 94444-0000', zip_code: '40020-000', street: 'Praça Tomé de Souza', number: '100', complement: '', neighborhood: 'Pelourinho', city: 'Salvador', state: 'BA', photo: '', entry_date: '2021-08-15', exit_date: '', role: 'Membro', status: 'active', notes: '', created_at: '2021-08-15T10:00:00Z', updated_at: '2021-08-15T10:00:00Z' },
    { id: 7, full_name: 'Fernanda Lima', nickname: 'Fer', cpf: '789.012.345-66', rg: '78.901.234-5', birth_date: '1992-10-28', gender: 'F', marital_status: 'Casada', nationality: 'Brasileira', naturalidade: 'Recife', phone: '(81) 94444-9999', whatsapp: '5581944449999', email: 'fernanda@email.com', emergency_contact: 'Marcos Lima', emergency_phone: '(81) 93333-8888', zip_code: '50010-000', street: 'Rua da Guia', number: '500', complement: '', neighborhood: 'Olinda', city: 'Recife', state: 'PE', photo: '', entry_date: '2020-11-20', exit_date: '', role: 'Membro', status: 'active', notes: '', created_at: '2020-11-20T10:00:00Z', updated_at: '2020-11-20T10:00:00Z' },
    { id: 8, full_name: 'Roberto Costa', nickname: 'Beto', cpf: '890.123.456-77', rg: '89.012.345-6', birth_date: '1975-12-15', gender: 'M', marital_status: 'Casado', nationality: 'Brasileira', naturalidade: 'Fortaleza', phone: '(85) 93333-7777', whatsapp: '5585933337777', email: 'roberto@email.com', emergency_contact: 'Sandra Costa', emergency_phone: '(85) 92222-6666', zip_code: '60010-000', street: 'Avenida Beira Mar', number: '2500', complement: '', neighborhood: 'Aldeota', city: 'Fortaleza', state: 'CE', photo: '', entry_date: '2018-04-10', exit_date: '', role: 'Presidente', status: 'active', notes: 'Membro mais antigo', created_at: '2018-04-10T10:00:00Z', updated_at: '2018-04-10T10:00:00Z' },
    { id: 9, full_name: 'Juliana Martins', nickname: 'Ju', cpf: '901.234.567-88', rg: '90.123.456-7', birth_date: '1998-09-05', gender: 'F', marital_status: 'Solteira', nationality: 'Brasileira', naturalidade: 'Brasília', phone: '(61) 92222-5555', whatsapp: '5561922225555', email: 'juliana@email.com', emergency_contact: 'Cláudia Martins', emergency_phone: '(61) 91111-4444', zip_code: '70040-000', street: 'Esplanada dos Ministérios', number: '1', complement: '', neighborhood: 'Zona Cívico-Administrativa', city: 'Brasília', state: 'DF', photo: '', entry_date: '2024-01-08', exit_date: '', role: 'Membro', status: 'active', notes: '', created_at: '2024-01-08T10:00:00Z', updated_at: '2024-01-08T10:00:00Z' },
    { id: 10, full_name: 'Marcos Ribeiro', nickname: 'Marquinhos', cpf: '012.345.678-99', rg: '01.234.567-8', birth_date: '1980-08-22', gender: 'M', marital_status: 'Casado', nationality: 'Brasileira', naturalidade: 'Goiânia', phone: '(62) 91111-3333', whatsapp: '5562911113333', email: 'marcos@email.com', emergency_contact: 'Teresa Ribeiro', emergency_phone: '(62) 90000-2222', zip_code: '74000-000', street: 'Avenida Goiás', number: '1500', complement: '', neighborhood: 'Setor Central', city: 'Goiânia', state: 'GO', photo: '', entry_date: '2019-09-01', exit_date: '2024-06-30', role: 'Membro', status: 'inactive', notes: 'Transferido para outra cidade', created_at: '2019-09-01T10:00:00Z', updated_at: '2024-06-30T10:00:00Z' }
  ];

  const memberships = [];
  let mId = 1;
  members.forEach(m => {
    for (let i = 8; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - i, 1);
      const month = d.getMonth();
      const year = d.getFullYear();
      const dueDate = `${year}-${String(month+1).padStart(2,'0')}-10`;
      let status = 'pending';
      let payment_date = null;
      if (i > 2) { status = 'paid'; payment_date = dueDate; }
      else if (i === 2) { status = 'paid'; payment_date = dueDate; }
      else if (i === 1) { status = 'pending'; }
      memberships.push({
        id: mId++, member_id: m.id, reference_month: month + 1, reference_year: year,
        due_date: dueDate, amount: 30.00, payment_date, payment_method: status === 'paid' ? 'pix' : null,
        status, receipt: null, notes: ''
      });
    }
  });

  const incomes = [
    { id: 1, date: `${currentYear}-${String(currentMonth+1).padStart(2,'0')}-05`, category: 'Doação', description: 'Doação de Sr. Antônio', amount: 500.00, payment_method: 'pix', responsible: 'João da Silva', receipt: null, notes: '' },
    { id: 2, date: `${currentYear}-${String(currentMonth+1).padStart(2,'0')}-10`, category: 'Evento', description: 'Bazar mensal', amount: 850.00, payment_method: 'dinheiro', responsible: 'Maria Oliveira', receipt: null, notes: '' },
    { id: 3, date: `${currentYear}-${String(currentMonth+1).padStart(2,'0')}-12`, category: 'Contribuição', description: 'Contribuição especial', amount: 200.00, payment_method: 'pix', responsible: 'Carlos Santos', receipt: null, notes: '' }
  ];

  const expenses = [
    { id: 1, date: `${currentYear}-${String(currentMonth+1).padStart(2,'0')}-03`, category: 'Alimentação', description: 'Coffee break reunião', amount: 180.00, payment_method: 'cartao', responsible: 'João da Silva', receipt: null, notes: '' },
    { id: 2, date: `${currentYear}-${String(currentMonth+1).padStart(2,'0')}-08`, category: 'Material', description: 'Material de escritório', amount: 120.00, payment_method: 'pix', responsible: 'Maria Oliveira', receipt: null, notes: '' },
    { id: 3, date: `${currentYear}-${String(currentMonth+1).padStart(2,'0')}-15`, category: 'Eventos', description: 'Decoração festa', amount: 350.00, payment_method: 'pix', responsible: 'Ana Souza', receipt: null, notes: '' }
  ];

  const message_templates = [
    { id: 1, name: 'Aniversário Padrão', type: 'birthday', message: 'Olá, {NOME}! 🎉\n\nHoje é um dia muito especial! Queremos desejar a você um feliz aniversário! 🎂\n\nQue Deus abençoe sua vida, sua família e conceda muitos anos de vida, saúde, paz e prosperidade.\n\nFeliz aniversário! 🎉🎂👏\n\nGrande abraço de todo o grupo!', active: true },
    { id: 2, name: 'Lembrete de Mensalidade', type: 'payment', message: 'Olá, {NOME}. Tudo bem?\n\nEstamos entrando em contato para lembrar sobre a mensalidade referente a {MES}, no valor de R$ {VALOR}.\n\nCaso o pagamento já tenha sido realizado, favor desconsiderar esta mensagem.\n\nObrigado!', active: true },
    { id: 3, name: 'Boas-vindas', type: 'welcome', message: 'Olá, {NOME}! Seja muito bem-vindo(a) ao grupo! 🎉\n\nEstamos muito felizes em ter você conosco.', active: true }
  ];

  const settings = {
    group_name: 'GrupoApp Demo',
    logo: '',
    address: 'Av. Principal, 1000 - Centro',
    phone: '(11) 3333-4444',
    email: 'contato@grupoapp.com',
    default_membership_amount: 30.00,
    default_due_day: 10,
    theme: 'light'
  };

  const audit_logs = [
    { id: 1, user_id: 1, user_name: 'Administrador', action: 'seed', module: 'system', record_id: 0, description: 'Sistema inicializado com dados de demonstração', created_at: new Date().toISOString() }
  ];

  return { users, members, memberships, incomes, expenses, message_templates, settings, audit_logs, nextIds: { member: 11, membership: memberships.length + 1, income: 4, expense: 4, user: 3, template: 4, log: 2 } };
}

function fmt(v) { return (v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); }
function fmtDate(d) {
  if (!d) return '—';
  const dt = typeof d === 'string' ? new Date(d + (d.length === 10 ? 'T00:00:00' : '')) : d;
  return dt.toLocaleDateString('pt-BR');
}
function fmtDateShort(d) {
  if (!d) return '—';
  const dt = typeof d === 'string' ? new Date(d + (d.length === 10 ? 'T00:00:00' : '')) : d;
  return dt.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}
function initials(name) {
  return (name || '').split(' ').filter(Boolean).slice(0, 2).map(n => n[0]).join('').toUpperCase();
}
function calcAge(birthDate) {
  if (!birthDate) return null;
  const b = new Date(birthDate + 'T00:00:00');
  const t = new Date();
  let age = t.getFullYear() - b.getFullYear();
  const m = t.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && t.getDate() < b.getDate())) age--;
  return age;
}
function daysUntilBirthday(birthDate) {
  if (!birthDate) return null;
  const b = new Date(birthDate + 'T00:00:00');
  const t = new Date(); t.setHours(0,0,0,0);
  const next = new Date(t.getFullYear(), b.getMonth(), b.getDate());
  if (next < t) next.setFullYear(t.getFullYear() + 1);
  return Math.round((next - t) / 86400000);
}
function isBirthdayToday(birthDate) { return daysUntilBirthday(birthDate) === 0; }
function monthName(m) {
  return ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'][m - 1];
}
function escapeHtml(s) {
  if (s == null) return '';
  return String(s).replace(/[&<>"]'/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function memberAvatarHtml(member, className = 'avatar-sm') {
  if (!member) return `<div class="${className}">?</div>`;
  if (member.photo) {
    return `<div class="${className}"><img src="${member.photo}" alt="${escapeHtml(member.full_name || 'Foto do membro')}" /></div>`;
  }
  return `<div class="${className}">${initials(member.full_name)}</div>`;
}
function logAction(action, module, recordId, description) {
  const u = state.user;
  DB.audit_logs.unshift({
    id: DB.nextIds.log++, user_id: u.id, user_name: u.name,
    action, module, record_id: recordId, description,
    created_at: new Date().toISOString()
  });
  saveDB(DB);
}

function toast(msg, type = 'success') {
  const c = document.getElementById('toastContainer');
  const icons = { success: 'fa-check-circle', error: 'fa-times-circle', warning: 'fa-exclamation-circle', info: 'fa-info-circle' };
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i><div>${escapeHtml(msg)}</div>`;
  c.appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; el.style.transform = 'translateX(400px)'; el.style.transition = 'all .3s'; }, 3000);
  setTimeout(() => el.remove(), 3400);
}

function openModal({ title, body, footer, size = '' }) {
  const c = document.getElementById('modalContainer');
  c.innerHTML = `
    <div class="modal-overlay" onclick="if(event.target===this) closeModal()">
      <div class="modal ${size}">
        <div class="modal-header">
          <div class="modal-title">${escapeHtml(title)}</div>
          <button class="icon-btn" onclick="closeModal()"><i class="fas fa-times"></i></button>
        </div>
        <div class="modal-body">${body}</div>
        ${footer ? `<div class="modal-footer">${footer}</div>` : ''}
      </div>
    </div>`;
}
function closeModal() { document.getElementById('modalContainer').innerHTML = ''; }

function confirmDialog(msg, onYes) {
  openModal({
    title: 'Confirmação',
    size: 'modal-sm',
    body: `<div style="display:flex;gap:12px;align-items:flex-start"><i class="fas fa-exclamation-triangle text-warning" style="font-size:24px"></i><div>${escapeHtml(msg)}</div></div>`,
    footer: `<button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
             <button class="btn btn-danger" id="confirmYes">Confirmar</button>`
  });
  document.getElementById('confirmYes').onclick = () => { closeModal(); onYes(); };
}

document.getElementById('loginForm').addEventListener('submit', e => {
  e.preventDefault();
  if (!DB) { toast('Aguarde o carregamento dos dados', 'warning'); return; }
  const email = document.getElementById('loginEmail').value.trim().toLowerCase();
  const pass = document.getElementById('loginPassword').value;
  const u = DB.users.find(x => x.email.toLowerCase() === email && x.password === pass && x.status === 'active');
  if (!u) { toast('Credenciais inválidas', 'error'); return; }
  setSession({ id: u.id, name: u.name, email: u.email, role: u.role });
  state.user = getSession();
  enterApp();
});

function logout() {
  confirmDialog('Deseja realmente sair do sistema?', () => {
    clearSession();
    state.user = null;
    document.getElementById('app').classList.add('hidden');
    document.getElementById('loginScreen').classList.remove('hidden');
  });
}

function enterApp() {
  document.getElementById('loginScreen').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');
  document.getElementById('app').dataset.role = state.user.role;
  document.getElementById('userName').textContent = state.user.name;
  document.getElementById('userRole').textContent = state.user.role === 'admin' ? 'Administrador' : 'Somente visualização';
  document.getElementById('userAvatar').textContent = initials(state.user.name);
  document.getElementById('groupName').textContent = DB.settings.group_name;
  applyTheme();
  navigate('dashboard');
  updateNotifs();
  const birthdaysToday = DB.members.filter(m => m.status === 'active' && isBirthdayToday(m.birth_date));
  if (birthdaysToday.length) {
    const names = birthdaysToday.map(m => m.full_name.split(' ')[0]).join(', ');
    toast(`Aniversário hoje: ${names}!`, 'info');
  }
}

function applyTheme() {
  const t = DB.settings.theme || 'light';
  document.documentElement.setAttribute('data-theme', t);
  const icon = document.getElementById('themeIcon');
  if (icon) icon.className = t === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}
function toggleTheme() {
  DB.settings.theme = DB.settings.theme === 'dark' ? 'light' : 'dark';
  saveDB(DB);
  applyTheme();
}

document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => navigate(item.dataset.view));
});
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('sidebarOverlay').classList.toggle('show');
}
document.getElementById('sidebarOverlay').addEventListener('click', () => {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarOverlay').classList.remove('show');
});

const viewTitles = {
  dashboard: 'Dashboard', members: 'Membros', finance: 'Financeiro',
  memberships: 'Mensalidades', income: 'Entradas', expenses: 'Despesas',
  birthdays: 'Aniversariantes', reports: 'Relatórios', messages: 'Mensagens',
  users: 'Usuários', audit: 'Auditoria', settings: 'Configurações'
};
function navigate(view) {
  state.view = view;
  document.querySelectorAll('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.view === view));
  document.getElementById('pageTitle').textContent = viewTitles[view] || view;
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarOverlay').classList.remove('show');
  render();
}

function buildNotifications() {
  const notifs = [];
  const cm = new Date().getMonth() + 1, cy = new Date().getFullYear();
  const pending = DB.memberships.filter(m => m.reference_month === cm && m.reference_year === cy && m.status === 'pending').length;
  const overdue = DB.memberships.filter(m => m.status === 'pending' && new Date(m.due_date + 'T00:00:00') < new Date()).length;
  if (pending > 0) notifs.push({ icon: 'fa-money-bill-wave', color: 'warning', text: `${pending} mensalidade(s) pendente(s) este mês`, time: 'Agora' });
  if (overdue > 0) notifs.push({ icon: 'fa-exclamation-triangle', color: 'danger', text: `${overdue} mensalidade(s) em atraso`, time: 'Agora' });
  DB.members.filter(m => m.status === 'active').forEach(m => {
    const d = daysUntilBirthday(m.birth_date);
    if (d === 0) notifs.push({ icon: 'fa-birthday-cake', color: 'success', text: `Hoje é aniversário de ${m.full_name}! 🎂`, time: 'Hoje' });
    else if (d === 1) notifs.push({ icon: 'fa-birthday-cake', color: 'info', text: `Amanhã é aniversário de ${m.full_name}`, time: 'Amanhã' });
    else if (d <= 7) notifs.push({ icon: 'fa-birthday-cake', color: 'info', text: `Aniversário de ${m.full_name} em ${d} dias`, time: `Em ${d} dias` });
  });
  return notifs;
}
function updateNotifs() {
  const n = buildNotifications();
  document.getElementById('notifCount').textContent = n.length;
  document.getElementById('notifCount').style.display = n.length ? 'flex' : 'none';
  const list = document.getElementById('notifList');
  if (!n.length) { list.innerHTML = '<div class="empty-state" style="padding:20px"><i class="fas fa-bell-slash"></i><div>Sem notificações</div></div>'; return; }
  list.innerHTML = n.map(x => `
    <div class="notif-item">
      <div class="notif-icon" style="background:${x.color === 'warning' ? '#fef3c7' : x.color === 'danger' ? '#fee2e2' : x.color === 'success' ? '#d1fae5' : '#dbeafe'}; color:${x.color === 'warning' ? '#d97706' : x.color === 'danger' ? '#dc2626' : x.color === 'success' ? '#059669' : '#2563eb'}">
        <i class="fas ${x.icon}"></i>
      </div>
      <div class="notif-text">
        <div>${escapeHtml(x.text)}</div>
        <div class="notif-time">${escapeHtml(x.time)}</div>
      </div>
    </div>`).join('');
}
function toggleNotifs() {
  document.getElementById('notifMenu').classList.toggle('show');
  updateNotifs();
}
document.addEventListener('click', e => {
  if (!e.target.closest('.dropdown')) document.getElementById('notifMenu')?.classList.remove('show');
});

function render() {
  const c = document.getElementById('content');
  const views = {
    dashboard: renderDashboard, members: renderMembers, finance: renderFinance,
    memberships: renderMemberships, income: renderIncome, expenses: renderExpenses,
    birthdays: renderBirthdays, reports: renderReports, messages: renderMessages,
    users: renderUsers, audit: renderAudit, settings: renderSettings
  };
  (views[state.view] || renderDashboard)(c);
}

function renderDashboard(c) {
  const cm = new Date().getMonth() + 1, cy = new Date().getFullYear();
  const active = DB.members.filter(m => m.status === 'active').length;
  const inactive = DB.members.filter(m => m.status !== 'active').length;
  const monthBirthdays = DB.members.filter(m => {
    if (!m.birth_date) return false;
    return new Date(m.birth_date + 'T00:00:00').getMonth() + 1 === cm && m.status === 'active';
  });
  const monthPaid = DB.memberships.filter(m => m.reference_month === cm && m.reference_year === cy && m.status === 'paid').length;
  const monthPending = DB.memberships.filter(m => m.reference_month === cm && m.reference_year === cy && m.status === 'pending').length;
  const totalIncome = DB.incomes.reduce((s, x) => s + x.amount, 0);
  const totalExpense = DB.expenses.reduce((s, x) => s + x.amount, 0);
  const membershipIncome = DB.memberships.filter(m => m.status === 'paid').reduce((s, x) => s + x.amount, 0);
  const balance = totalIncome + membershipIncome - totalExpense;

  c.innerHTML = `
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-icon primary"><i class="fas fa-users"></i></div><div><div class="stat-label">Total de Membros</div><div class="stat-value">${DB.members.length}</div></div></div>
      <div class="stat-card"><div class="stat-icon success"><i class="fas fa-user-check"></i></div><div><div class="stat-label">Membros Ativos</div><div class="stat-value">${active}</div></div></div>
      <div class="stat-card"><div class="stat-icon gray"><i class="fas fa-user-slash"></i></div><div><div class="stat-label">Membros Inativos</div><div class="stat-value">${inactive}</div></div></div>
      <div class="stat-card"><div class="stat-icon purple"><i class="fas fa-birthday-cake"></i></div><div><div class="stat-label">Aniversariantes do Mês</div><div class="stat-value">${monthBirthdays.length}</div></div></div>
      <div class="stat-card"><div class="stat-icon info"><i class="fas fa-check-circle"></i></div><div><div class="stat-label">Mensalidades Pagas (mês)</div><div class="stat-value">${monthPaid}</div></div></div>
      <div class="stat-card"><div class="stat-icon warning"><i class="fas fa-clock"></i></div><div><div class="stat-label">Mensalidades Pendentes</div><div class="stat-value">${monthPending}</div></div></div>
      <div class="stat-card"><div class="stat-icon success"><i class="fas fa-arrow-down"></i></div><div><div class="stat-label">Total de Entradas</div><div class="stat-value">${fmt(totalIncome + membershipIncome)}</div></div></div>
      <div class="stat-card"><div class="stat-icon danger"><i class="fas fa-arrow-up"></i></div><div><div class="stat-label">Total de Despesas</div><div class="stat-value">${fmt(totalExpense)}</div></div></div>
      <div class="stat-card"><div class="stat-icon primary"><i class="fas fa-wallet"></i></div><div><div class="stat-label">Saldo Atual</div><div class="stat-value ${balance >= 0 ? 'text-success' : 'text-danger'}">${fmt(balance)}</div></div></div>
    </div>

    <div class="grid-2">
      <div class="card">
        <div class="card-header"><div class="card-title"><i class="fas fa-chart-line"></i> Fluxo Financeiro (últimos 6 meses)</div></div>
        <div class="chart-container"><canvas id="chartFinance"></canvas></div>
      </div>
      <div class="card">
        <div class="card-header"><div class="card-title"><i class="fas fa-birthday-cake"></i> Próximos Aniversariantes</div></div>
        <div class="bday-list" id="bdayList"></div>
      </div>
    </div>

    <div class="grid-2">
      <div class="card">
        <div class="card-header"><div class="card-title"><i class="fas fa-credit-card"></i> Mensalidades do Mês (${monthName(cm)})</div></div>
        <div class="chart-container"><canvas id="chartMemberships"></canvas></div>
      </div>
      <div class="card">
        <div class="card-header"><div class="card-title"><i class="fas fa-bolt"></i> Ações Rápidas</div></div>
        <div style="display:grid;gap:10px;grid-template-columns:1fr 1fr">
          <button class="btn btn-primary" onclick="navigate('members'); setTimeout(openMemberForm, 100)"><i class="fas fa-user-plus"></i> Novo Membro</button>
          <button class="btn btn-success" onclick="navigate('income'); setTimeout(openIncomeForm, 100)"><i class="fas fa-plus"></i> Nova Entrada</button>
          <button class="btn btn-secondary" onclick="navigate('expenses'); setTimeout(openExpenseForm, 100)"><i class="fas fa-minus"></i> Nova Despesa</button>
          <button class="btn btn-whatsapp" onclick="navigate('birthdays')"><i class="fab fa-whatsapp"></i> Aniversariantes</button>
        </div>
      </div>
    </div>
  `;

  const months = [];
  const incomeData = [], expenseData = [], balanceData = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(cy, cm - 1 - i, 1);
    const m = d.getMonth() + 1, y = d.getFullYear();
    months.push(monthName(m).substring(0, 3));
    const inc = DB.incomes.filter(x => { const dd = new Date(x.date + 'T00:00:00'); return dd.getMonth() + 1 === m && dd.getFullYear() === y; }).reduce((s, x) => s + x.amount, 0)
            + DB.memberships.filter(x => x.reference_month === m && x.reference_year === y && x.status === 'paid').reduce((s, x) => s + x.amount, 0);
    const exp = DB.expenses.filter(x => { const dd = new Date(x.date + 'T00:00:00'); return dd.getMonth() + 1 === m && dd.getFullYear() === y; }).reduce((s, x) => s + x.amount, 0);
    incomeData.push(inc); expenseData.push(exp); balanceData.push(inc - exp);
  }
  new Chart(document.getElementById('chartFinance'), {
    type: 'bar',
    data: {
      labels: months,
      datasets: [
        { label: 'Entradas', data: incomeData, backgroundColor: '#10b981' },
        { label: 'Despesas', data: expenseData, backgroundColor: '#ef4444' },
        { label: 'Saldo', type: 'line', data: balanceData, borderColor: '#4f46e5', backgroundColor: 'rgba(79,70,229,0.1)', tension: 0.3, fill: false }
      ]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } }, scales: { y: { beginAtZero: true } } }
  });

  const paid = DB.memberships.filter(m => m.reference_month === cm && m.reference_year === cy && m.status === 'paid').length;
  const pend = DB.memberships.filter(m => m.reference_month === cm && m.reference_year === cy && m.status === 'pending').length;
  const over = DB.memberships.filter(m => m.status === 'pending' && new Date(m.due_date + 'T00:00:00') < new Date()).length;
  new Chart(document.getElementById('chartMemberships'), {
    type: 'doughnut',
    data: { labels: ['Pagas', 'Pendentes', 'Em atraso'], datasets: [{ data: [paid, pend, over], backgroundColor: ['#10b981', '#f59e0b', '#ef4444'] }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
  });

  const upcoming = DB.members.filter(m => m.status === 'active' && m.birth_date)
    .map(m => ({ ...m, days: daysUntilBirthday(m.birth_date) }))
    .sort((a, b) => a.days - b.days).slice(0, 5);
  const bl = document.getElementById('bdayList');
  if (!upcoming.length) bl.innerHTML = '<div class="empty-state"><i class="fas fa-birthday-cake"></i><div>Sem aniversariantes próximos</div></div>';
  else bl.innerHTML = upcoming.map(m => `
    <div class="bday-item ${m.days === 0 ? 'bday-today' : ''}">
      ${memberAvatarHtml(m)}
      <div class="bday-info">
        <div class="bday-name">${escapeHtml(m.full_name)}</div>
        <div class="bday-date">🎂 ${fmtDateShort(m.birth_date)} • ${m.days === 0 ? '<strong class="bday-today-label">Hoje!</strong>' : m.days === 1 ? 'Amanhã' : `Em ${m.days} dias`} • Completará ${calcAge(m.birth_date) + (m.days > 0 ? 1 : 0)} anos</div>
      </div>
      <button class="btn btn-whatsapp btn-sm" onclick="sendBirthdayWhatsapp(${m.id})"><i class="fab fa-whatsapp"></i></button>
    </div>`).join('');
}

function renderMembers(c) {
  const f = state.filters.members;
  let list = [...DB.members];
  if (f.search) {
    const s = f.search.toLowerCase();
    list = list.filter(m => m.full_name.toLowerCase().includes(s) || (m.cpf||'').includes(s) || (m.phone||'').includes(s) || (m.whatsapp||'').includes(s) || (m.email||'').toLowerCase().includes(s));
  }
  if (f.status) list = list.filter(m => m.status === f.status);
  if (f.birthdays) list = list.filter(m => m.birth_date && new Date(m.birth_date + 'T00:00:00').getMonth() + 1 === new Date().getMonth() + 1);

  c.innerHTML = `
    <div class="toolbar">
      <div class="search-box"><i class="fas fa-search"></i><input id="memberSearch" placeholder="Buscar por nome, CPF, telefone, e-mail..." value="${escapeHtml(f.search)}"></div>
      <select id="memberStatusFilter" style="max-width:180px">
        <option value="">Todos os status</option>
        <option value="active" ${f.status==='active'?'selected':''}>Ativos</option>
        <option value="inactive" ${f.status==='inactive'?'selected':''}>Inativos</option>
        <option value="away" ${f.status==='away'?'selected':''}>Afastados</option>
        <option value="transferred" ${f.status==='transferred'?'selected':''}>Transferidos</option>
      </select>
      <label style="display:flex;align-items:center;gap:6px;cursor:pointer"><input type="checkbox" id="memberBdayFilter" ${f.birthdays?'checked':''} style="width:auto"> Aniversariantes do mês</label>
      <div style="flex:1"></div>
      <button class="btn btn-primary" onclick="openMemberForm()"><i class="fas fa-plus"></i> Novo Membro</button>
    </div>

    <div class="card" style="padding:0">
      <div class="table-wrap">
        <table>
          <thead><tr>
            <th>Membro</th><th>Contato</th><th>Nascimento</th><th>Função</th><th>Status</th><th>Entrada</th><th>Financeiro</th><th style="text-align:right">Ações</th>
          </tr></thead>
          <tbody id="membersBody"></tbody>
        </table>
      </div>
    </div>
  `;

  document.getElementById('memberSearch').oninput = e => { state.filters.members.search = e.target.value; renderMembers(c); };
  document.getElementById('memberStatusFilter').onchange = e => { state.filters.members.status = e.target.value; renderMembers(c); };
  document.getElementById('memberBdayFilter').onchange = e => { state.filters.members.birthdays = e.target.checked; renderMembers(c); };

  const body = document.getElementById('membersBody');
  if (!list.length) { body.innerHTML = `<tr><td colspan="8"><div class="empty-state"><i class="fas fa-users"></i><div>Nenhum membro encontrado</div></div></td></tr>`; return; }

  body.innerHTML = list.map(m => {
    const cm = new Date().getMonth() + 1, cy = new Date().getFullYear();
    const paid = DB.memberships.filter(x => x.member_id === m.id && x.reference_month === cm && x.reference_year === cy && x.status === 'paid').length;
    const pend = DB.memberships.filter(x => x.member_id === m.id && x.reference_month === cm && x.reference_year === cy && x.status === 'pending').length;
    const finBadge = pend === 0 ? '<span class="badge badge-success">Em dia</span>' : `<span class="badge badge-warning">${pend} pend.</span>`;
    const statusBadge = { active: '<span class="badge badge-success">Ativo</span>', inactive: '<span class="badge badge-gray">Inativo</span>', away: '<span class="badge badge-warning">Afastado</span>', transferred: '<span class="badge badge-info">Transferido</span>' }[m.status] || '';
    return `<tr>
      <td><div class="member-cell">${memberAvatarHtml(m)}<div><div class="member-name">${escapeHtml(m.full_name)}${m.nickname ? ` <span class="text-muted">(${escapeHtml(m.nickname)})</span>` : ''}</div><div class="member-sub">${escapeHtml(m.cpf || '—')}</div></div></div></td>
      <td><div>${escapeHtml(m.phone || '—')}</div><div class="member-sub">${escapeHtml(m.whatsapp || '')}</div></td>
      <td>${fmtDate(m.birth_date)}<div class="member-sub">${calcAge(m.birth_date) ?? '—'} anos</div></td>
      <td>${escapeHtml(m.role || '—')}</td>
      <td>${statusBadge}</td>
      <td>${fmtDate(m.entry_date)}</td>
      <td>${finBadge}</td>
      <td><div class="actions" style="justify-content:flex-end">
        <button class="btn btn-icon btn-secondary" title="Ver" onclick="viewMember(${m.id})"><i class="fas fa-eye"></i></button>
        <button class="btn btn-icon btn-secondary" title="Editar" onclick="openMemberForm(${m.id})"><i class="fas fa-edit"></i></button>
        <button class="btn btn-icon btn-whatsapp" title="WhatsApp" onclick="sendBirthdayWhatsapp(${m.id})"><i class="fab fa-whatsapp"></i></button>
        ${m.status === 'active' ? `<button class="btn btn-icon btn-secondary" title="Inativar" onclick="toggleMemberStatus(${m.id})"><i class="fas fa-user-slash"></i></button>` : `<button class="btn btn-icon btn-success" title="Reativar" onclick="toggleMemberStatus(${m.id})"><i class="fas fa-user-check"></i></button>`}
        <button class="btn btn-icon btn-danger" title="Excluir" onclick="deleteMember(${m.id})"><i class="fas fa-trash"></i></button>
      </div></td>
    </tr>`;
  }).join('');
}

function openMemberForm(id = null) {
  if (!requireAdmin()) return;
  const m = id ? DB.members.find(x => x.id === id) : { status: 'active', gender: 'M', marital_status: 'Solteiro(a)', photo: '' };
  const isEdit = !!id;
  window._memberPhotoData = m.photo || '';
  openModal({
    title: isEdit ? 'Editar Membro' : 'Novo Membro',
    size: 'modal-lg',
    body: `
      <div class="tabs">
        <div class="tab active" data-tab="personal">Dados Pessoais</div>
        <div class="tab" data-tab="contact">Contatos</div>
        <div class="tab" data-tab="address">Endereço</div>
        <div class="tab" data-tab="group">Grupo</div>
      </div>
      <div id="tab-personal">
        <div class="form-row">
          <div>
            <label>Foto do membro</label>
            <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap">
              <div class="photo-preview" id="memberPhotoPreview" style="width:90px;height:90px;cursor:pointer">
                ${m.photo ? `<img src="${m.photo}" alt="Foto do membro" />` : '<i class="fas fa-user" style="font-size:28px"></i>'}
              </div>
              <div style="flex:1;min-width:200px">
                <input type="file" id="f_photo_input" accept="image/*" capture="environment" />
                <div class="text-muted mt-2" style="font-size:12px">PNG, JPG ou WEBP. A imagem será salva junto ao cadastro.</div>
              </div>
            </div>
          </div>
        </div>
        <div class="form-row cols-2">
          <div><label>Nome completo *</label><input id="f_full_name" value="${escapeHtml(m.full_name || '')}" required></div>
          <div><label>Nome social / apelido</label><input id="f_nickname" value="${escapeHtml(m.nickname || '')}"></div>
        </div>
        <div class="form-row cols-3">
          <div><label>CPF</label><input id="f_cpf" value="${escapeHtml(m.cpf || '')}" placeholder="000.000.000-00"></div>
          <div><label>RG</label><input id="f_rg" value="${escapeHtml(m.rg || '')}"></div>
          <div><label>Data de nascimento</label><input type="date" id="f_birth_date" value="${m.birth_date || ''}"></div>
        </div>
        <div class="form-row cols-3">
          <div><label>Sexo</label><select id="f_gender"><option value="M" ${m.gender==='M'?'selected':''}>Masculino</option><option value="F" ${m.gender==='F'?'selected':''}>Feminino</option><option value="O" ${m.gender==='O'?'selected':''}>Outro</option></select></div>
          <div><label>Estado civil</label><select id="f_marital_status"><option>Solteiro(a)</option><option>Casado(a)</option><option>Divorciado(a)</option><option>Viúvo(a)</option><option>União estável</option></select></div>
          <div><label>Nacionalidade</label><input id="f_nationality" value="${escapeHtml(m.nationality || 'Brasileira')}"></div>
        </div>
        <div class="form-row"><div><label>Naturalidade</label><input id="f_naturalidade" value="${escapeHtml(m.naturalidade || '')}"></div></div>
      </div>
      <div id="tab-contact" class="hidden">
        <div class="form-row cols-2">
          <div><label>Telefone</label><input id="f_phone" value="${escapeHtml(m.phone || '')}"></div>
          <div><label>WhatsApp</label><input id="f_whatsapp" value="${escapeHtml(m.whatsapp || '')}" placeholder="5511999999999"></div>
        </div>
        <div class="form-row"><div><label>E-mail</label><input type="email" id="f_email" value="${escapeHtml(m.email || '')}"></div></div>
        <div class="form-row cols-2">
          <div><label>Contato de emergência</label><input id="f_emergency_contact" value="${escapeHtml(m.emergency_contact || '')}"></div>
          <div><label>Telefone de emergência</label><input id="f_emergency_phone" value="${escapeHtml(m.emergency_phone || '')}"></div>
        </div>
      </div>
      <div id="tab-address" class="hidden">
        <div class="form-row cols-4">
          <div><label>CEP <button type="button" class="btn btn-sm btn-secondary" onclick="lookupCep()" style="margin-left:4px"><i class="fas fa-search"></i></button></label><input id="f_zip_code" value="${escapeHtml(m.zip_code || '')}" maxlength="9"></div>
          <div style="grid-column: span 3"><label>Rua</label><input id="f_street" value="${escapeHtml(m.street || '')}"></div>
        </div>
        <div class="form-row cols-3">
          <div><label>Número</label><input id="f_number" value="${escapeHtml(m.number || '')}"></div>
          <div><label>Complemento</label><input id="f_complement" value="${escapeHtml(m.complement || '')}"></div>
          <div><label>Bairro</label><input id="f_neighborhood" value="${escapeHtml(m.neighborhood || '')}"></div>
        </div>
        <div class="form-row cols-2">
          <div><label>Cidade</label><input id="f_city" value="${escapeHtml(m.city || '')}"></div>
          <div><label>Estado</label><input id="f_state" value="${escapeHtml(m.state || '')}" maxlength="2"></div>
        </div>
      </div>
      <div id="tab-group" class="hidden">
        <div class="form-row cols-3">
          <div><label>Data de entrada</label><input type="date" id="f_entry_date" value="${m.entry_date || new Date().toISOString().substring(0,10)}"></div>
          <div><label>Cargo / função</label><input id="f_role" value="${escapeHtml(m.role || '')}"></div>
          <div><label>Status</label><select id="f_status"><option value="active" ${m.status==='active'?'selected':''}>Ativo</option><option value="inactive" ${m.status==='inactive'?'selected':''}>Inativo</option><option value="away" ${m.status==='away'?'selected':''}>Afastado</option><option value="transferred" ${m.status==='transferred'?'selected':''}>Transferido</option></select></div>
        </div>
        <div class="form-row cols-2">
          <div><label>Data de saída</label><input type="date" id="f_exit_date" value="${m.exit_date || ''}"></div>
          <div><label>Motivo da saída</label><input id="f_exit_reason" value="${escapeHtml(m.exit_reason || '')}"></div>
        </div>
        <div class="form-row"><div><label>Observações</label><textarea id="f_notes" rows="3">${escapeHtml(m.notes || '')}</textarea></div></div>
      </div>
    `,
    footer: `<button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
             <button class="btn btn-primary" onclick="saveMember(${id || 'null'})"><i class="fas fa-save"></i> Salvar</button>`
  });
  document.getElementById('f_marital_status').value = m.marital_status || 'Solteiro(a)';
  const photoInput = document.getElementById('f_photo_input');
  if (photoInput) {
    photoInput.onchange = (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => {
        window._memberPhotoData = ev.target.result;
        const preview = document.getElementById('memberPhotoPreview');
        if (preview) {
          preview.innerHTML = `<img src="${window._memberPhotoData}" alt="Foto do membro" />`;
        }
      };
      reader.readAsDataURL(file);
    };
  }
  document.querySelectorAll('.tab').forEach(t => t.onclick = () => {
    document.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
    t.classList.add('active');
    ['personal','contact','address','group'].forEach(k => document.getElementById('tab-' + k).classList.add('hidden'));
    document.getElementById('tab-' + t.dataset.tab).classList.remove('hidden');
  });
}

async function lookupCep() {
  const cep = document.getElementById('f_zip_code').value.replace(/\D/g, '');
  if (cep.length !== 8) { toast('CEP inválido', 'warning'); return; }
  try {
    const r = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const d = await r.json();
    if (d.erro) { toast('CEP não encontrado', 'error'); return; }
    document.getElementById('f_street').value = d.logradouro || '';
    document.getElementById('f_neighborhood').value = d.bairro || '';
    document.getElementById('f_city').value = d.localidade || '';
    document.getElementById('f_state').value = d.uf || '';
    toast('Endereço preenchido automaticamente', 'success');
  } catch (e) { toast('Erro ao buscar CEP', 'error'); }
}

function saveMember(id) {
  if (!requireAdmin()) return;
  const photo = window._memberPhotoData || '';
  const data = {
    full_name: document.getElementById('f_full_name').value.trim(),
    nickname: document.getElementById('f_nickname').value.trim(),
    cpf: document.getElementById('f_cpf').value.trim(),
    rg: document.getElementById('f_rg').value.trim(),
    birth_date: document.getElementById('f_birth_date').value,
    photo,
    gender: document.getElementById('f_gender').value,
    marital_status: document.getElementById('f_marital_status').value,
    nationality: document.getElementById('f_nationality').value.trim(),
    naturalidade: document.getElementById('f_naturalidade').value.trim(),
    phone: document.getElementById('f_phone').value.trim(),
    whatsapp: document.getElementById('f_whatsapp').value.trim(),
    email: document.getElementById('f_email').value.trim(),
    emergency_contact: document.getElementById('f_emergency_contact').value.trim(),
    emergency_phone: document.getElementById('f_emergency_phone').value.trim(),
    zip_code: document.getElementById('f_zip_code').value.trim(),
    street: document.getElementById('f_street').value.trim(),
    number: document.getElementById('f_number').value.trim(),
    complement: document.getElementById('f_complement').value.trim(),
    neighborhood: document.getElementById('f_neighborhood').value.trim(),
    city: document.getElementById('f_city').value.trim(),
    state: document.getElementById('f_state').value.trim().toUpperCase(),
    entry_date: document.getElementById('f_entry_date').value,
    role: document.getElementById('f_role').value.trim(),
    status: document.getElementById('f_status').value,
    exit_date: document.getElementById('f_exit_date').value,
    exit_reason: document.getElementById('f_exit_reason').value.trim(),
    notes: document.getElementById('f_notes').value.trim(),
    updated_at: new Date().toISOString()
  };
  if (!data.full_name) { toast('Nome é obrigatório', 'error'); return; }

  if (id) {
    const idx = DB.members.findIndex(x => x.id === id);
    DB.members[idx] = { ...DB.members[idx], ...data };
    logAction('update', 'members', id, `Dados de ${data.full_name} atualizados`);
    toast('Membro atualizado', 'success');
  } else {
    data.id = DB.nextIds.member++;
    data.created_at = new Date().toISOString();
    DB.members.push(data);
    logAction('create', 'members', data.id, `Membro ${data.full_name} cadastrado`);
    toast('Membro cadastrado', 'success');
  }
  saveDB(DB);
  closeModal();
  render();
}

function viewMember(id) {
  const m = DB.members.find(x => x.id === id);
  if (!m) return;
  const mems = DB.memberships.filter(x => x.member_id === id);
  const paid = mems.filter(x => x.status === 'paid').reduce((s, x) => s + x.amount, 0);
  const pend = mems.filter(x => x.status === 'pending').reduce((s, x) => s + x.amount, 0);
  const statusBadge = { active: '<span class="badge badge-success">Ativo</span>', inactive: '<span class="badge badge-gray">Inativo</span>', away: '<span class="badge badge-warning">Afastado</span>', transferred: '<span class="badge badge-info">Transferido</span>' }[m.status] || '';

  openModal({
    title: 'Perfil do Membro',
    size: 'modal-lg',
    body: `
      <div style="display:flex;gap:20px;align-items:center;margin-bottom:20px;flex-wrap:wrap">
        ${memberAvatarHtml(m, 'avatar-lg')}
        <div style="flex:1;min-width:200px">
          <h2 style="margin-bottom:4px">${escapeHtml(m.full_name)}${m.nickname ? ` <span class="text-muted">(${escapeHtml(m.nickname)})</span>` : ''}</h2>
          <div>${escapeHtml(m.role || 'Sem função')} ${statusBadge}</div>
        </div>
        <div style="display:flex;gap:6px">
          <button class="btn btn-secondary" onclick="closeModal(); openMemberForm(${m.id})"><i class="fas fa-edit"></i> Editar</button>
          <button class="btn btn-whatsapp" onclick="sendBirthdayWhatsapp(${m.id})"><i class="fab fa-whatsapp"></i> WhatsApp</button>
        </div>
      </div>

      <div class="tabs">
        <div class="tab active" data-tab="info">Informações</div>
        <div class="tab" data-tab="fin">Financeiro</div>
        <div class="tab" data-tab="hist">Histórico</div>
      </div>

      <div id="vt-info">
        <h3 class="mb-3">Dados Pessoais</h3>
        <div class="info-grid">
          <div class="info-item"><label>CPF</label><div class="value">${escapeHtml(m.cpf || '—')}</div></div>
          <div class="info-item"><label>RG</label><div class="value">${escapeHtml(m.rg || '—')}</div></div>
          <div class="info-item"><label>Nascimento</label><div class="value">${fmtDate(m.birth_date)} (${calcAge(m.birth_date) ?? '—'} anos)</div></div>
          <div class="info-item"><label>Sexo</label><div class="value">${m.gender === 'M' ? 'Masculino' : m.gender === 'F' ? 'Feminino' : 'Outro'}</div></div>
          <div class="info-item"><label>Estado civil</label><div class="value">${escapeHtml(m.marital_status || '—')}</div></div>
          <div class="info-item"><label>Nacionalidade</label><div class="value">${escapeHtml(m.nationality || '—')}</div></div>
        </div>
        <h3 class="mb-3 mt-4">Contatos</h3>
        <div class="info-grid">
          <div class="info-item"><label>Telefone</label><div class="value">${escapeHtml(m.phone || '—')}</div></div>
          <div class="info-item"><label>WhatsApp</label><div class="value">${escapeHtml(m.whatsapp || '—')}</div></div>
          <div class="info-item"><label>E-mail</label><div class="value">${escapeHtml(m.email || '—')}</div></div>
          <div class="info-item"><label>Emergência</label><div class="value">${escapeHtml(m.emergency_contact || '—')} — ${escapeHtml(m.emergency_phone || '—')}</div></div>
        </div>
        <h3 class="mb-3 mt-4">Endereço</h3>
        <div class="info-grid">
          <div class="info-item"><label>Endereço</label><div class="value">${escapeHtml(m.street || '—')}, ${escapeHtml(m.number || '')} ${escapeHtml(m.complement || '')}</div></div>
          <div class="info-item"><label>Bairro</label><div class="value">${escapeHtml(m.neighborhood || '—')}</div></div>
          <div class="info-item"><label>Cidade/UF</label><div class="value">${escapeHtml(m.city || '—')}/${escapeHtml(m.state || '—')} — CEP ${escapeHtml(m.zip_code || '—')}</div></div>
        </div>
        <h3 class="mb-3 mt-4">Grupo</h3>
        <div class="info-grid">
          <div class="info-item"><label>Entrada</label><div class="value">${fmtDate(m.entry_date)}</div></div>
          <div class="info-item"><label>Saída</label><div class="value">${m.exit_date ? fmtDate(m.exit_date) + ' — ' + escapeHtml(m.exit_reason || '') : '—'}</div></div>
          <div class="info-item" style="grid-column:1/-1"><label>Observações</label><div class="value">${escapeHtml(m.notes || '—')}</div></div>
        </div>
      </div>

      <div id="vt-fin" class="hidden">
        <div class="stats-grid" style="grid-template-columns:repeat(4,1fr)">
          <div class="stat-card"><div class="stat-icon success"><i class="fas fa-check"></i></div><div><div class="stat-label">Total Pago</div><div class="stat-value">${fmt(paid)}</div></div></div>
          <div class="stat-card"><div class="stat-icon warning"><i class="fas fa-clock"></i></div><div><div class="stat-label">Total Pendente</div><div class="stat-value">${fmt(pend)}</div></div></div>
          <div class="stat-card"><div class="stat-icon info"><i class="fas fa-list"></i></div><div><div class="stat-label">Registros</div><div class="stat-value">${mems.length}</div></div></div>
          <div class="stat-card"><div class="stat-icon primary"><i class="fas fa-credit-card"></i></div><div><div class="stat-label">Pagas / Pend.</div><div class="stat-value">${mems.filter(x=>x.status==='paid').length}/${mems.filter(x=>x.status==='pending').length}</div></div></div>
        </div>
        <div class="table-wrap mt-4">
          <table>
            <thead><tr><th>Mês</th><th>Vencimento</th><th>Valor</th><th>Pagamento</th><th>Status</th><th></th></tr></thead>
            <tbody>
              ${mems.sort((a,b)=>b.reference_year-a.reference_year||b.reference_month-a.reference_month).map(x => `
                <tr>
                  <td>${monthName(x.reference_month)}/${x.reference_year}</td>
                  <td>${fmtDate(x.due_date)}</td>
                  <td>${fmt(x.amount)}</td>
                  <td>${x.payment_date ? fmtDate(x.payment_date) : '—'}</td>
                  <td>${x.status === 'paid' ? '<span class="badge badge-success">Pago</span>' : '<span class="badge badge-warning">Pendente</span>'}</td>
                  <td><button class="btn btn-sm btn-primary" onclick="closeModal(); openPaymentForm(${x.member_id}, ${x.reference_month}, ${x.reference_year})"><i class="fas fa-money-bill"></i> Registrar</button></td>
                </tr>`).join('') || '<tr><td colspan="6"><div class="empty-state">Sem mensalidades registradas</div></td></tr>'}
            </tbody>
          </table>
        </div>
      </div>

      <div id="vt-hist" class="hidden">
        <div class="info-grid">
          <div class="info-item"><label>Cadastrado em</label><div class="value">${fmtDate(m.created_at)}</div></div>
          <div class="info-item"><label>Última atualização</label><div class="value">${fmtDate(m.updated_at)}</div></div>
        </div>
        <h3 class="mb-3 mt-4">Alterações recentes</h3>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Data</th><th>Usuário</th><th>Ação</th><th>Descrição</th></tr></thead>
            <tbody>
              ${DB.audit_logs.filter(l => l.module === 'members' && l.record_id === id).slice(0, 20).map(l => `
                <tr><td>${fmtDate(l.created_at)}</td><td>${escapeHtml(l.user_name)}</td><td>${escapeHtml(l.action)}</td><td>${escapeHtml(l.description)}</td></tr>
              `).join('') || '<tr><td colspan="4"><div class="empty-state">Sem histórico</div></td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    `
  });
  document.querySelectorAll('.tab').forEach(t => t.onclick = () => {
    document.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
    t.classList.add('active');
    ['info','fin','hist'].forEach(k => document.getElementById('vt-' + k).classList.add('hidden'));
    document.getElementById('vt-' + t.dataset.tab).classList.remove('hidden');
  });
}

function toggleMemberStatus(id) {
  if (!requireAdmin()) return;
  const m = DB.members.find(x => x.id === id);
  if (!m) return;
  const newStatus = m.status === 'active' ? 'inactive' : 'active';
  m.status = newStatus;
  m.updated_at = new Date().toISOString();
  logAction('update', 'members', id, `Status de ${m.full_name} alterado para ${newStatus}`);
  saveDB(DB);
  toast(`Membro ${newStatus === 'active' ? 'reativado' : 'inativado'}`, 'success');
  render();
}

function deleteMember(id) {
  if (!requireAdmin()) return;
  const m = DB.members.find(x => x.id === id);
  if (!m) return;
  confirmDialog(`Deseja realmente excluir ${m.full_name}? Esta ação não pode ser desfeita.`, () => {
    DB.members = DB.members.filter(x => x.id !== id);
    DB.memberships = DB.memberships.filter(x => x.member_id !== id);
    logAction('delete', 'members', id, `Membro ${m.full_name} excluído`);
    saveDB(DB);
    toast('Membro excluído', 'success');
    render();
  });
}

function renderFinance(c) {
  const totalIncome = DB.incomes.reduce((s, x) => s + x.amount, 0);
  const membershipIncome = DB.memberships.filter(m => m.status === 'paid').reduce((s, x) => s + x.amount, 0);
  const totalExpense = DB.expenses.reduce((s, x) => s + x.amount, 0);
  const balance = totalIncome + membershipIncome - totalExpense;

  c.innerHTML = `
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-icon success"><i class="fas fa-arrow-down"></i></div><div><div class="stat-label">Total Entradas</div><div class="stat-value text-success">${fmt(totalIncome + membershipIncome)}</div></div></div>
      <div class="stat-card"><div class="stat-icon danger"><i class="fas fa-arrow-up"></i></div><div><div class="stat-label">Total Despesas</div><div class="stat-value text-danger">${fmt(totalExpense)}</div></div></div>
      <div class="stat-card"><div class="stat-icon primary"><i class="fas fa-wallet"></i></div><div><div class="stat-label">Saldo Atual</div><div class="stat-value ${balance >= 0 ? 'text-success' : 'text-danger'}">${fmt(balance)}</div></div></div>
      <div class="stat-card"><div class="stat-icon info"><i class="fas fa-credit-card"></i></div><div><div class="stat-label">Mensalidades Recebidas</div><div class="stat-value">${fmt(membershipIncome)}</div></div></div>
    </div>

    <div class="card">
      <div class="card-header"><div class="card-title"><i class="fas fa-chart-area"></i> Evolução do Saldo</div></div>
      <div class="chart-container"><canvas id="chartBalance"></canvas></div>
    </div>

    <div class="card">
      <div class="card-header"><div class="card-title"><i class="fas fa-list"></i> Últimas Movimentações</div></div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Data</th><th>Tipo</th><th>Descrição</th><th>Categoria</th><th>Valor</th></tr></thead>
          <tbody>
            ${[...DB.incomes.map(x => ({ ...x, type: 'income' })), ...DB.expenses.map(x => ({ ...x, type: 'expense' })), ...DB.memberships.filter(x => x.status === 'paid').map(x => ({ ...x, type: 'membership', description: `Mensalidade ${monthName(x.reference_month)}/${x.reference_year}`, category: 'Mensalidade' }))]
              .sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 15).map(x => `
                <tr>
                  <td>${fmtDate(x.date)}</td>
                  <td>${x.type === 'income' ? '<span class="badge badge-success">Entrada</span>' : x.type === 'membership' ? '<span class="badge badge-info">Mensalidade</span>' : '<span class="badge badge-danger">Despesa</span>'}</td>
                  <td>${escapeHtml(x.description)}</td>
                  <td>${escapeHtml(x.category)}</td>
                  <td class="${x.type === 'expense' ? 'text-danger' : 'text-success'}">${x.type === 'expense' ? '-' : '+'} ${fmt(x.amount)}</td>
                </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  const cm = new Date().getMonth() + 1, cy = new Date().getFullYear();
  const months = [], bal = [];
  let running = 0;
  for (let i = 5; i >= 0; i--) {
    const d = new Date(cy, cm - 1 - i, 1);
    const m = d.getMonth() + 1, y = d.getFullYear();
    months.push(monthName(m).substring(0, 3));
    const inc = DB.incomes.filter(x => { const dd = new Date(x.date + 'T00:00:00'); return dd.getMonth() + 1 === m && dd.getFullYear() === y; }).reduce((s, x) => s + x.amount, 0)
            + DB.memberships.filter(x => x.reference_month === m && x.reference_year === y && x.status === 'paid').reduce((s, x) => s + x.amount, 0);
    const exp = DB.expenses.filter(x => { const dd = new Date(x.date + 'T00:00:00'); return dd.getMonth() + 1 === m && dd.getFullYear() === y; }).reduce((s, x) => s + x.amount, 0);
    running += inc - exp;
    bal.push(running);
  }
  new Chart(document.getElementById('chartBalance'), {
    type: 'line',
    data: { labels: months, datasets: [{ label: 'Saldo acumulado', data: bal, borderColor: '#4f46e5', backgroundColor: 'rgba(79,70,229,0.1)', fill: true, tension: 0.3 }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } }, scales: { y: { beginAtZero: false } } }
  });
}

function renderMemberships(c) {
  const cm = new Date().getMonth() + 1, cy = new Date().getFullYear();
  c.innerHTML = `
    <div class="toolbar">
      <select id="memMonth" style="max-width:180px">
        ${Array.from({length:12}, (_, i) => `<option value="${i+1}" ${i+1===cm?'selected':''}>${monthName(i+1)}</option>`).join('')}
      </select>
      <input type="number" id="memYear" value="${cy}" style="max-width:120px">
      <div style="flex:1"></div>
      <button class="btn btn-primary" onclick="generateMonthlyMemberships()"><i class="fas fa-magic"></i> Gerar Mensalidades do Mês</button>
    </div>

    <div class="card" style="padding:0">
      <div class="table-wrap">
        <table>
          <thead><tr><th>Membro</th><th>Referência</th><th>Vencimento</th><th>Valor</th><th>Pagamento</th><th>Status</th><th style="text-align:right">Ações</th></tr></thead>
          <tbody id="memBody"></tbody>
        </table>
      </div>
    </div>
  `;
  const render = () => {
    const m = +document.getElementById('memMonth').value;
    const y = +document.getElementById('memYear').value;
    const body = document.getElementById('memBody');
    const rows = DB.members.filter(x => x.status === 'active').map(mem => {
      const rec = DB.memberships.find(x => x.member_id === mem.id && x.reference_month === m && x.reference_year === y);
      if (!rec) return `<tr>
        <td><div class="member-cell">${memberAvatarHtml(mem)}<div class="member-name">${escapeHtml(mem.full_name)}</div></div></td>
        <td>${monthName(m)}/${y}</td><td>—</td><td>—</td><td>—</td>
        <td><span class="badge badge-gray">Não gerada</span></td>
        <td><div class="actions" style="justify-content:flex-end"><button class="btn btn-sm btn-primary" onclick="openPaymentForm(${mem.id}, ${m}, ${y})"><i class="fas fa-plus"></i> Gerar</button></div></td>
      </tr>`;
      const isOverdue = rec.status === 'pending' && new Date(rec.due_date + 'T00:00:00') < new Date();
      const badge = rec.status === 'paid' ? '<span class="badge badge-success">Pago</span>' : isOverdue ? '<span class="badge badge-danger">Em atraso</span>' : '<span class="badge badge-warning">Pendente</span>';
      return `<tr>
        <td><div class="member-cell">${memberAvatarHtml(mem)}<div class="member-name">${escapeHtml(mem.full_name)}</div></div></td>
        <td>${monthName(m)}/${y}</td>
        <td>${fmtDate(rec.due_date)}</td>
        <td>${fmt(rec.amount)}</td>
        <td>${rec.payment_date ? fmtDate(rec.payment_date) : '—'}</td>
        <td>${badge}</td>
        <td><div class="actions" style="justify-content:flex-end">
          <button class="btn btn-sm btn-primary" onclick="openPaymentForm(${mem.id}, ${m}, ${y})"><i class="fas fa-edit"></i> ${rec.status === 'paid' ? 'Editar' : 'Registrar'}</button>
          ${rec.status === 'pending' ? `<button class="btn btn-sm btn-whatsapp" onclick="sendPaymentReminder(${mem.id}, ${m}, ${y})"><i class="fab fa-whatsapp"></i></button>` : ''}
        </div></td>
      </tr>`;
    });
    body.innerHTML = rows.join('') || '<tr><td colspan="7"><div class="empty-state">Sem membros ativos</div></td></tr>';
  };
  document.getElementById('memMonth').onchange = render;
  document.getElementById('memYear').onchange = render;
  render();
}

function generateMonthlyMemberships() {
  const m = +document.getElementById('memMonth').value;
  const y = +document.getElementById('memYear').value;
  const day = DB.settings.default_due_day || 10;
  const amount = DB.settings.default_membership_amount || 30;
  let created = 0;
  DB.members.filter(x => x.status === 'active').forEach(mem => {
    if (DB.memberships.find(x => x.member_id === mem.id && x.reference_month === m && x.reference_year === y)) return;
    DB.memberships.push({
      id: DB.nextIds.membership++, member_id: mem.id, reference_month: m, reference_year: y,
      due_date: `${y}-${String(m).padStart(2,'0')}-${String(day).padStart(2,'0')}`,
      amount, payment_date: null, payment_method: null, status: 'pending', receipt: null, notes: ''
    });
    created++;
  });
  logAction('generate', 'memberships', 0, `Mensalidades de ${monthName(m)}/${y} geradas (${created})`);
  saveDB(DB);
  toast(`${created} mensalidade(s) gerada(s)`, 'success');
  render();
}

function openPaymentForm(memberId, month, year) {
  if (!requireAdmin()) return;
  const rec = DB.memberships.find(x => x.member_id === memberId && x.reference_month === month && x.reference_year === year);
  const member = DB.members.find(x => x.id === memberId);
  const isEdit = !!rec;
  openModal({
    title: `${isEdit ? 'Editar' : 'Registrar'} Mensalidade — ${member.full_name}`,
    body: `
      <div class="form-row cols-2">
        <div><label>Mês de referência</label><input value="${monthName(month)}/${year}" disabled></div>
        <div><label>Valor (R$)</label><input type="number" step="0.01" id="p_amount" value="${rec ? rec.amount : DB.settings.default_membership_amount || 30}"></div>
      </div>
      <div class="form-row cols-2">
        <div><label>Dia de vencimento</label><input type="number" id="p_due_day" value="${rec ? new Date(rec.due_date + 'T00:00:00').getDate() : DB.settings.default_due_day || 10}" min="1" max="31"></div>
        <div><label>Status</label><select id="p_status"><option value="paid" ${rec?.status==='paid'?'selected':''}>Pago</option><option value="pending" ${!rec || rec.status==='pending'?'selected':''}>Pendente</option><option value="exempt" ${rec?.status==='exempt'?'selected':''}>Isento</option></select></div>
      </div>
      <div class="form-row cols-2">
        <div><label>Data do pagamento</label><input type="date" id="p_payment_date" value="${rec?.payment_date || ''}"></div>
        <div><label>Forma de pagamento</label><select id="p_payment_method"><option value="">—</option><option value="dinheiro">Dinheiro</option><option value="pix">PIX</option><option value="transferencia">Transferência</option><option value="cartao">Cartão</option><option value="outro">Outro</option></select></div>
      </div>
      <div class="form-row"><div><label>Observação</label><textarea id="p_notes" rows="2">${escapeHtml(rec?.notes || '')}</textarea></div></div>
    `,
    footer: `<button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
             <button class="btn btn-primary" onclick="savePayment(${memberId}, ${month}, ${year})"><i class="fas fa-save"></i> Salvar</button>`
  });
  if (rec) { document.getElementById('p_payment_method').value = rec.payment_method || ''; }
}

function savePayment(memberId, month, year) {
  if (!requireAdmin()) return;
  const status = document.getElementById('p_status').value;
  const dueDay = +document.getElementById('p_due_day').value;
  const data = {
    amount: +document.getElementById('p_amount').value,
    due_date: `${year}-${String(month).padStart(2,'0')}-${String(dueDay).padStart(2,'0')}`,
    status,
    payment_date: document.getElementById('p_payment_date').value || null,
    payment_method: document.getElementById('p_payment_method').value || null,
    notes: document.getElementById('p_notes').value.trim()
  };
  let rec = DB.memberships.find(x => x.member_id === memberId && x.reference_month === month && x.reference_year === year);
  if (rec) {
    Object.assign(rec, data);
    logAction('update', 'memberships', rec.id, `Mensalidade ${monthName(month)}/${year} atualizada`);
  } else {
    rec = { id: DB.nextIds.membership++, member_id: memberId, reference_month: month, reference_year: year, receipt: null, ...data };
    DB.memberships.push(rec);
    logAction('create', 'memberships', rec.id, `Mensalidade ${monthName(month)}/${year} criada`);
  }
  saveDB(DB);
  closeModal();
  toast('Mensalidade salva', 'success');
  render();
}

function renderIncome(c) {
  c.innerHTML = `
    <div class="toolbar">
      <div class="search-box"><i class="fas fa-search"></i><input id="incSearch" placeholder="Buscar descrição..."></div>
      <select id="incCat" style="max-width:180px"><option value="">Todas categorias</option>${[...new Set(DB.incomes.map(x=>x.category))].map(c=>`<option>${c}</option>`).join('')}</select>
      <div style="flex:1"></div>
      <button class="btn btn-success" onclick="openIncomeForm()"><i class="fas fa-plus"></i> Nova Entrada</button>
    </div>
    <div class="card" style="padding:0">
      <div class="table-wrap">
        <table>
          <thead><tr><th>Data</th><th>Descrição</th><th>Categoria</th><th>Pagamento</th><th>Responsável</th><th>Valor</th><th style="text-align:right">Ações</th></tr></thead>
          <tbody id="incBody"></tbody>
        </table>
      </div>
    </div>
  `;
  const render = () => {
    const s = document.getElementById('incSearch').value.toLowerCase();
    const cat = document.getElementById('incCat').value;
    let list = [...DB.incomes];
    if (s) list = list.filter(x => x.description.toLowerCase().includes(s));
    if (cat) list = list.filter(x => x.category === cat);
    list.sort((a, b) => new Date(b.date) - new Date(a.date));
    const body = document.getElementById('incBody');
    body.innerHTML = list.length ? list.map(x => `
      <tr>
        <td>${fmtDate(x.date)}</td>
        <td>${escapeHtml(x.description)}</td>
        <td><span class="badge badge-info">${escapeHtml(x.category)}</span></td>
        <td>${escapeHtml(x.payment_method || '—')}</td>
        <td>${escapeHtml(x.responsible || '—')}</td>
        <td class="text-success">${fmt(x.amount)}</td>
        <td><div class="actions" style="justify-content:flex-end">
          <button class="btn btn-icon btn-secondary" onclick="openIncomeForm(${x.id})"><i class="fas fa-edit"></i></button>
          <button class="btn btn-icon btn-danger" onclick="deleteIncome(${x.id})"><i class="fas fa-trash"></i></button>
        </div></td>
      </tr>`).join('') : '<tr><td colspan="7"><div class="empty-state"><i class="fas fa-inbox"></i><div>Nenhuma entrada</div></div></td></tr>';
  };
  document.getElementById('incSearch').oninput = render;
  document.getElementById('incCat').onchange = render;
  render();
}

function openIncomeForm(id = null) {
  if (!requireAdmin()) return;
  const x = id ? DB.incomes.find(i => i.id === id) : { date: new Date().toISOString().substring(0,10), payment_method: 'pix' };
  openModal({
    title: id ? 'Editar Entrada' : 'Nova Entrada',
    body: `
      <div class="form-row cols-2">
        <div><label>Data *</label><input type="date" id="i_date" value="${x.date}" required></div>
        <div><label>Valor (R$) *</label><input type="number" step="0.01" id="i_amount" value="${x.amount || ''}" required></div>
      </div>
      <div class="form-row"><div><label>Descrição *</label><input id="i_description" value="${escapeHtml(x.description || '')}" required></div></div>
      <div class="form-row cols-2">
        <div><label>Categoria</label><select id="i_category">
          ${['Mensalidade','Oferta','Doação','Contribuição','Evento','Venda','Outras entradas'].map(c=>`<option ${x.category===c?'selected':''}>${c}</option>`).join('')}
        </select></div>
        <div><label>Forma de pagamento</label><select id="i_payment_method">
          <option value="dinheiro" ${x.payment_method==='dinheiro'?'selected':''}>Dinheiro</option>
          <option value="pix" ${x.payment_method==='pix'?'selected':''}>PIX</option>
          <option value="transferencia" ${x.payment_method==='transferencia'?'selected':''}>Transferência</option>
          <option value="cartao" ${x.payment_method==='cartao'?'selected':''}>Cartão</option>
          <option value="outro" ${x.payment_method==='outro'?'selected':''}>Outro</option>
        </select></div>
      </div>
      <div class="form-row"><div><label>Responsável</label><input id="i_responsible" value="${escapeHtml(x.responsible || '')}"></div></div>
      <div class="form-row"><div><label>Observação</label><textarea id="i_notes" rows="2">${escapeHtml(x.notes || '')}</textarea></div></div>
    `,
    footer: `<button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
             <button class="btn btn-success" onclick="saveIncome(${id || 'null'})"><i class="fas fa-save"></i> Salvar</button>`
  });
}

function saveIncome(id) {
  if (!requireAdmin()) return;
  const data = {
    date: document.getElementById('i_date').value,
    amount: +document.getElementById('i_amount').value,
    description: document.getElementById('i_description').value.trim(),
    category: document.getElementById('i_category').value,
    payment_method: document.getElementById('i_payment_method').value,
    responsible: document.getElementById('i_responsible').value.trim(),
    notes: document.getElementById('i_notes').value.trim()
  };
  if (!data.description || !data.amount) { toast('Preencha descrição e valor', 'error'); return; }
  if (id) {
    Object.assign(DB.incomes.find(x => x.id === id), data);
    logAction('update', 'income', id, `Entrada "${data.description}" atualizada`);
  } else {
    data.id = DB.nextIds.income++;
    data.receipt = null;
    DB.incomes.push(data);
    logAction('create', 'income', data.id, `Entrada "${data.description}" cadastrada`);
  }
  saveDB(DB);
  closeModal();
  toast('Entrada salva', 'success');
  render();
}

function deleteIncome(id) {
  if (!requireAdmin()) return;
  confirmDialog('Excluir esta entrada?', () => {
    const x = DB.incomes.find(i => i.id === id);
    DB.incomes = DB.incomes.filter(i => i.id !== id);
    logAction('delete', 'income', id, `Entrada "${x.description}" excluída`);
    saveDB(DB);
    toast('Entrada excluída', 'success');
    render();
  });
}

function renderExpenses(c) {
  c.innerHTML = `
    <div class="toolbar">
      <div class="search-box"><i class="fas fa-search"></i><input id="expSearch" placeholder="Buscar descrição..."></div>
      <select id="expCat" style="max-width:180px"><option value="">Todas categorias</option>${[...new Set(DB.expenses.map(x=>x.category))].map(c=>`<option>${c}</option>`).join('')}</select>
      <div style="flex:1"></div>
      <button class="btn btn-danger" onclick="openExpenseForm()"><i class="fas fa-plus"></i> Nova Despesa</button>
    </div>
    <div class="card" style="padding:0">
      <div class="table-wrap">
        <table>
          <thead><tr><th>Data</th><th>Descrição</th><th>Categoria</th><th>Pagamento</th><th>Responsável</th><th>Valor</th><th style="text-align:right">Ações</th></tr></thead>
          <tbody id="expBody"></tbody>
        </table>
      </div>
    </div>
  `;
  const render = () => {
    const s = document.getElementById('expSearch').value.toLowerCase();
    const cat = document.getElementById('expCat').value;
    let list = [...DB.expenses];
    if (s) list = list.filter(x => x.description.toLowerCase().includes(s));
    if (cat) list = list.filter(x => x.category === cat);
    list.sort((a, b) => new Date(b.date) - new Date(a.date));
    const body = document.getElementById('expBody');
    body.innerHTML = list.length ? list.map(x => `
      <tr>
        <td>${fmtDate(x.date)}</td>
        <td>${escapeHtml(x.description)}</td>
        <td><span class="badge badge-danger">${escapeHtml(x.category)}</span></td>
        <td>${escapeHtml(x.payment_method || '—')}</td>
        <td>${escapeHtml(x.responsible || '—')}</td>
        <td class="text-danger">${fmt(x.amount)}</td>
        <td><div class="actions" style="justify-content:flex-end">
          <button class="btn btn-icon btn-secondary" onclick="openExpenseForm(${x.id})"><i class="fas fa-edit"></i></button>
          <button class="btn btn-icon btn-danger" onclick="deleteExpense(${x.id})"><i class="fas fa-trash"></i></button>
        </div></td>
      </tr>`).join('') : '<tr><td colspan="7"><div class="empty-state"><i class="fas fa-inbox"></i><div>Nenhuma despesa</div></div></td></tr>';
  };
  document.getElementById('expSearch').oninput = render;
  document.getElementById('expCat').onchange = render;
  render();
}

function openExpenseForm(id = null) {
  if (!requireAdmin()) return;
  const x = id ? DB.expenses.find(i => i.id === id) : { date: new Date().toISOString().substring(0,10), payment_method: 'pix' };
  openModal({
    title: id ? 'Editar Despesa' : 'Nova Despesa',
    body: `
      <div class="form-row cols-2">
        <div><label>Data *</label><input type="date" id="e_date" value="${x.date}" required></div>
        <div><label>Valor (R$) *</label><input type="number" step="0.01" id="e_amount" value="${x.amount || ''}" required></div>
      </div>
      <div class="form-row"><div><label>Descrição *</label><input id="e_description" value="${escapeHtml(x.description || '')}" required></div></div>
      <div class="form-row cols-2">
        <div><label>Categoria</label><select id="e_category">
          ${['Alimentação','Transporte','Material','Eventos','Manutenção','Compras','Outros'].map(c=>`<option ${x.category===c?'selected':''}>${c}</option>`).join('')}
        </select></div>
        <div><label>Forma de pagamento</label><select id="e_payment_method">
          <option value="dinheiro" ${x.payment_method==='dinheiro'?'selected':''}>Dinheiro</option>
          <option value="pix" ${x.payment_method==='pix'?'selected':''}>PIX</option>
          <option value="transferencia" ${x.payment_method==='transferencia'?'selected':''}>Transferência</option>
          <option value="cartao" ${x.payment_method==='cartao'?'selected':''}>Cartão</option>
          <option value="outro" ${x.payment_method==='outro'?'selected':''}>Outro</option>
        </select></div>
      </div>
      <div class="form-row"><div><label>Responsável</label><input id="e_responsible" value="${escapeHtml(x.responsible || '')}"></div></div>
      <div class="form-row"><div><label>Observação</label><textarea id="e_notes" rows="2">${escapeHtml(x.notes || '')}</textarea></div></div>
    `,
    footer: `<button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
             <button class="btn btn-danger" onclick="saveExpense(${id || 'null'})"><i class="fas fa-save"></i> Salvar</button>`
  });
}

function saveExpense(id) {
  if (!requireAdmin()) return;
  const data = {
    date: document.getElementById('e_date').value,
    amount: +document.getElementById('e_amount').value,
    description: document.getElementById('e_description').value.trim(),
    category: document.getElementById('e_category').value,
    payment_method: document.getElementById('e_payment_method').value,
    responsible: document.getElementById('e_responsible').value.trim(),
    notes: document.getElementById('e_notes').value.trim()
  };
  if (!data.description || !data.amount) { toast('Preencha descrição e valor', 'error'); return; }
  if (id) {
    Object.assign(DB.expenses.find(x => x.id === id), data);
    logAction('update', 'expense', id, `Despesa "${data.description}" atualizada`);
  } else {
    data.id = DB.nextIds.expense++;
    data.receipt = null;
    DB.expenses.push(data);
    logAction('create', 'expense', data.id, `Despesa "${data.description}" cadastrada`);
  }
  saveDB(DB);
  closeModal();
  toast('Despesa salva', 'success');
  render();
}

function deleteExpense(id) {
  if (!requireAdmin()) return;
  confirmDialog('Excluir esta despesa?', () => {
    const x = DB.expenses.find(i => i.id === id);
    DB.expenses = DB.expenses.filter(i => i.id !== id);
    logAction('delete', 'expense', id, `Despesa "${x.description}" excluída`);
    saveDB(DB);
    toast('Despesa excluída', 'success');
    render();
  });
}

function renderBirthdays(c) {
  const today = new Date();
  const cm = today.getMonth() + 1;
  const upcoming = DB.members.filter(m => m.birth_date && m.status === 'active')
    .map(m => ({ ...m, days: daysUntilBirthday(m.birth_date) }))
    .sort((a, b) => a.days - b.days);
  const monthBdays = upcoming.filter(m => new Date(m.birth_date + 'T00:00:00').getMonth() + 1 === cm);

  c.innerHTML = `
    <div class="stats-grid" style="grid-template-columns:repeat(auto-fill,minmax(200px,1fr))">
      <div class="stat-card"><div class="stat-icon purple"><i class="fas fa-birthday-cake"></i></div><div><div class="stat-label">Aniversariantes do Mês</div><div class="stat-value">${monthBdays.length}</div></div></div>
      <div class="stat-card"><div class="stat-icon success"><i class="fas fa-gift"></i></div><div><div class="stat-label">Próximo Aniversário</div><div class="stat-value" style="font-size:16px">${upcoming[0] ? (upcoming[0].days === 0 ? 'Hoje!' : `Em ${upcoming[0].days} dias`) : '—'}</div></div></div>
    </div>

    <div class="grid-2">
      <div class="card">
        <div class="card-header"><div class="card-title"><i class="fas fa-calendar-day"></i> Aniversariantes do Mês (${monthName(cm)})</div></div>
        <div class="bday-list">
          ${monthBdays.length ? monthBdays.sort((a,b)=>new Date(a.birth_date).getDate()-new Date(b.birth_date).getDate()).map(m => `
            <div class="bday-item ${m.days === 0 ? 'bday-today' : ''}">
              ${memberAvatarHtml(m)}
              <div class="bday-info">
                <div class="bday-name">${escapeHtml(m.full_name)}</div>
                <div class="bday-date">🎂 Dia ${new Date(m.birth_date + 'T00:00:00').getDate()} • ${m.days === 0 ? '<strong class="bday-today-label">Hoje!</strong> • ' : ''}Completará ${calcAge(m.birth_date) + 1} anos • ${escapeHtml(m.phone || '')}</div>
              </div>
              <button class="btn btn-whatsapp btn-sm" onclick="sendBirthdayWhatsapp(${m.id})"><i class="fab fa-whatsapp"></i> Felicitar</button>
            </div>`).join('') : '<div class="empty-state"><i class="fas fa-birthday-cake"></i><div>Nenhum aniversariante este mês</div></div>'}
        </div>
      </div>
      <div class="card">
        <div class="card-header"><div class="card-title"><i class="fas fa-clock"></i> Próximos Aniversariantes</div></div>
        <div class="bday-list">
          ${upcoming.slice(0, 10).map(m => `
            <div class="bday-item ${m.days === 0 ? 'bday-today' : ''}">
              ${memberAvatarHtml(m)}
              <div class="bday-info">
                <div class="bday-name">${escapeHtml(m.full_name)}</div>
                <div class="bday-date">🎂 ${fmtDateShort(m.birth_date)} • ${m.days === 0 ? '<strong class="bday-today-label">Hoje!</strong>' : m.days === 1 ? 'Amanhã' : `Em ${m.days} dias`}</div>
              </div>
              <button class="btn btn-whatsapp btn-sm" onclick="sendBirthdayWhatsapp(${m.id})"><i class="fab fa-whatsapp"></i></button>
            </div>`).join('')}
        </div>
      </div>
    </div>
  `;
}

function sendBirthdayWhatsapp(memberId) {
  if (!requireAdmin()) return;
  const m = DB.members.find(x => x.id === memberId);
  if (!m) return;
  const tpl = DB.message_templates.find(t => t.type === 'birthday' && t.active) || { message: 'Feliz aniversário, {NOME}! 🎉🎂' };
  let msg = tpl.message.replace(/{NOME}/g, m.full_name.split(' ')[0]);
  openModal({
    title: 'Enviar Felicitação pelo WhatsApp',
    body: `
      <div class="mb-3">Mensagem para <strong>${escapeHtml(m.full_name)}</strong>:</div>
      <textarea id="wa_msg" rows="10" style="font-family:inherit">${escapeHtml(msg)}</textarea>
      <div class="mt-3 text-muted" style="font-size:12px">
        <i class="fas fa-info-circle"></i> O WhatsApp será aberto com a mensagem preenchida. Revise e envie.
      </div>
    `,
    footer: `<button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
             <button class="btn btn-whatsapp" onclick="doSendWhatsapp(${memberId})"><i class="fab fa-whatsapp"></i> Abrir WhatsApp</button>`
  });
}

function doSendWhatsapp(memberId) {
  const m = DB.members.find(x => x.id === memberId);
  const msg = document.getElementById('wa_msg').value;
  let phone = (m.whatsapp || m.phone || '').replace(/\D/g, '');
  if (!phone) { toast('Membro sem telefone/WhatsApp', 'warning'); return; }
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
  logAction('whatsapp', 'members', memberId, `Felicitação enviada para ${m.full_name}`);
  saveDB(DB);
  closeModal();
  toast('WhatsApp aberto', 'success');
}

function sendPaymentReminder(memberId, month, year) {
  if (!requireAdmin()) return;
  const m = DB.members.find(x => x.id === memberId);
  const rec = DB.memberships.find(x => x.member_id === memberId && x.reference_month === month && x.reference_year === year);
  if (!m || !rec) return;
  const tpl = DB.message_templates.find(t => t.type === 'payment' && t.active) || { message: 'Olá {NOME}, sua mensalidade de {MES} no valor de R$ {VALOR} está pendente.' };
  let msg = tpl.message.replace(/{NOME}/g, m.full_name.split(' ')[0]).replace(/{MES}/g, monthName(month)).replace(/{VALOR}/g, rec.amount.toFixed(2).replace('.', ','));
  openModal({
    title: 'Enviar Lembrete de Mensalidade',
    body: `
      <div class="mb-3">Lembrete para <strong>${escapeHtml(m.full_name)}</strong> — ${monthName(month)}/${year} (${fmt(rec.amount)})</div>
      <textarea id="wa_msg" rows="10">${escapeHtml(msg)}</textarea>
    `,
    footer: `<button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
             <button class="btn btn-whatsapp" onclick="doSendPaymentWhatsapp(${memberId})"><i class="fab fa-whatsapp"></i> Abrir WhatsApp</button>`
  });
  window._pendingPayment = { memberId, month, year };
}
function doSendPaymentWhatsapp() {
  const { memberId } = window._pendingPayment;
  const m = DB.members.find(x => x.id === memberId);
  const msg = document.getElementById('wa_msg').value;
  let phone = (m.whatsapp || m.phone || '').replace(/\D/g, '');
  if (!phone) { toast('Membro sem telefone', 'warning'); return; }
  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  logAction('whatsapp', 'memberships', memberId, `Lembrete de mensalidade enviado para ${m.full_name}`);
  saveDB(DB);
  closeModal();
  toast('WhatsApp aberto', 'success');
}

function renderReports(c) {
  c.innerHTML = `
    <div class="card">
      <div class="card-header"><div class="card-title"><i class="fas fa-file-alt"></i> Relatórios Disponíveis</div></div>
      <div style="display:grid;gap:12px;grid-template-columns:repeat(auto-fill,minmax(250px,1fr))">
        ${[
          { id: 'members', name: 'Lista de Membros', icon: 'fa-users' },
          { id: 'memberships', name: 'Mensalidades', icon: 'fa-credit-card' },
          { id: 'defaulters', name: 'Inadimplentes', icon: 'fa-exclamation-triangle' },
          { id: 'income', name: 'Entradas', icon: 'fa-arrow-down' },
          { id: 'expenses', name: 'Despesas', icon: 'fa-arrow-up' },
          { id: 'cashflow', name: 'Fluxo de Caixa', icon: 'fa-wallet' },
          { id: 'birthdays', name: 'Aniversariantes', icon: 'fa-birthday-cake' }
        ].map(r => `
          <div class="stat-card" style="cursor:pointer" onclick="generateReport('${r.id}')">
            <div class="stat-icon primary"><i class="fas ${r.icon}"></i></div>
            <div><div class="stat-label">Relatório</div><div style="font-weight:600">${r.name}</div></div>
          </div>`).join('')}
      </div>
    </div>
    <div id="reportArea"></div>
  `;
}

function generateReport(type) {
  const area = document.getElementById('reportArea');
  let title = '', headers = [], rows = [];
  const today = new Date();

  if (type === 'members') {
    title = 'Lista de Membros';
    headers = ['Nome', 'CPF', 'Telefone', 'Função', 'Status', 'Entrada'];
    rows = DB.members.map(m => [m.full_name, m.cpf || '', m.phone || '', m.role || '', m.status === 'active' ? 'Ativo' : 'Inativo', fmtDate(m.entry_date)]);
  } else if (type === 'memberships') {
    title = `Mensalidades — ${monthName(today.getMonth()+1)}/${today.getFullYear()}`;
    headers = ['Membro', 'Vencimento', 'Valor', 'Pagamento', 'Status'];
    const cm = today.getMonth() + 1, cy = today.getFullYear();
    rows = DB.members.filter(m => m.status === 'active').map(m => {
      const r = DB.memberships.find(x => x.member_id === m.id && x.reference_month === cm && x.reference_year === cy);
      return [m.full_name, r ? fmtDate(r.due_date) : '—', r ? fmt(r.amount) : '—', r?.payment_date ? fmtDate(r.payment_date) : '—', r?.status === 'paid' ? 'Pago' : r ? 'Pendente' : 'Não gerada'];
    });
  } else if (type === 'defaulters') {
    title = 'Membros Inadimplentes';
    headers = ['Membro', 'Telefone', 'Mês Ref.', 'Valor', 'Vencimento', 'Dias atraso'];
    rows = [];
    DB.members.filter(m => m.status === 'active').forEach(m => {
      DB.memberships.filter(x => x.member_id === m.id && x.status === 'pending' && new Date(x.due_date + 'T00:00:00') < today).forEach(r => {
        const days = Math.floor((today - new Date(r.due_date + 'T00:00:00')) / 86400000);
        rows.push([m.full_name, m.phone || '', `${monthName(r.reference_month)}/${r.reference_year}`, fmt(r.amount), fmtDate(r.due_date), days]);
      });
    });
  } else if (type === 'income') {
    title = 'Relatório de Entradas';
    headers = ['Data', 'Descrição', 'Categoria', 'Valor'];
    rows = DB.incomes.map(x => [fmtDate(x.date), x.description, x.category, fmt(x.amount)]);
  } else if (type === 'expenses') {
    title = 'Relatório de Despesas';
    headers = ['Data', 'Descrição', 'Categoria', 'Valor'];
    rows = DB.expenses.map(x => [fmtDate(x.date), x.description, x.category, fmt(x.amount)]);
  } else if (type === 'cashflow') {
    title = 'Fluxo de Caixa';
    const ti = DB.incomes.reduce((s,x)=>s+x.amount,0);
    const tm = DB.memberships.filter(x=>x.status==='paid').reduce((s,x)=>s+x.amount,0);
    const te = DB.expenses.reduce((s,x)=>s+x.amount,0);
    headers = ['Descrição', 'Valor'];
    rows = [['Total de Entradas (avulsas)', fmt(ti)], ['Total de Mensalidades Recebidas', fmt(tm)], ['Total de Despesas', fmt(te)], ['SALDO ATUAL', fmt(ti + tm - te)]];
  } else if (type === 'birthdays') {
    title = 'Aniversariantes';
    headers = ['Nome', 'Data', 'Idade', 'Telefone'];
    rows = DB.members.filter(m=>m.birth_date).sort((a,b)=>new Date(a.birth_date).getMonth()-new Date(b.birth_date).getMonth()||new Date(a.birth_date).getDate()-new Date(b.birth_date).getDate()).map(m => [m.full_name, fmtDate(m.birth_date), calcAge(m.birth_date) + ' anos', m.phone || '']);
  }

  area.innerHTML = `
    <div class="card">
      <div class="card-header">
        <div class="card-title">${title}</div>
        <div style="display:flex;gap:6px">
          <button class="btn btn-secondary btn-sm" onclick="window.print()"><i class="fas fa-print"></i> Imprimir</button>
          <button class="btn btn-secondary btn-sm" onclick="exportCSV(\`${title}\`)"><i class="fas fa-file-csv"></i> CSV</button>
        </div>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr>${headers.map(h=>`<th>${h}</th>`).join('')}</tr></thead>
          <tbody>${rows.length ? rows.map(r=>`<tr>${r.map(c=>`<td>${escapeHtml(c)}</td>`).join('')}</tr>`).join('') : '<tr><td colspan="'+headers.length+'"><div class="empty-state">Sem dados</div></td></tr>'}</tbody>
        </table>
      </div>
    </div>
  `;
  window._lastReport = { title, headers, rows };
}

function exportCSV(title) {
  const { headers, rows } = window._lastReport || {};
  if (!headers) return;
  const csv = [headers.join(';'), ...rows.map(r => r.map(c => `"${(c||'').toString().replace(/"/g,'""')}"`).join(';'))].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${title.replace(/\s+/g,'_')}.csv`;
  a.click();
  toast('CSV exportado', 'success');
}

function renderMessages(c) {
  c.innerHTML = `
    <div class="card">
      <div class="card-header">
        <div class="card-title"><i class="fab fa-whatsapp"></i> Modelos de Mensagem</div>
        <button class="btn btn-primary btn-sm" onclick="openTemplateForm()"><i class="fas fa-plus"></i> Novo Modelo</button>
      </div>
      <div style="display:grid;gap:12px;grid-template-columns:repeat(auto-fill,minmax(280px,1fr))">
        ${DB.message_templates.map(t => `
          <div class="stat-card" style="flex-direction:column;align-items:stretch">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
              <strong>${escapeHtml(t.name)}</strong>
              <span class="badge ${t.active?'badge-success':'badge-gray'}">${t.active?'Ativo':'Inativo'}</span>
            </div>
            <div class="text-muted" style="font-size:12px;margin-bottom:8px">Tipo: ${t.type}</div>
            ${t.image ? '<div class="template-image-badge"><i class="fas fa-image"></i> Imagem anexada</div>' : ''}
            <div style="background:var(--surface-2);padding:10px;border-radius:8px;font-size:12px;white-space:pre-wrap;max-height:120px;overflow-y:auto">${escapeHtml(t.message || (t.image ? 'Modelo com imagem' : ''))}</div>
            <div style="display:flex;gap:6px;margin-top:10px">
              <button class="btn btn-secondary btn-sm" onclick="openTemplateForm(${t.id})"><i class="fas fa-edit"></i> Editar</button>
              <button class="btn btn-danger btn-sm" onclick="deleteTemplate(${t.id})"><i class="fas fa-trash"></i></button>
            </div>
          </div>`).join('')}
      </div>
    </div>

    <div class="card">
      <div class="card-header"><div class="card-title"><i class="fas fa-bullhorn"></i> Envio em Massa</div></div>
      <div class="form-row"><div><label>Modelo de mensagem</label>
        <select id="massTemplate">
          ${DB.message_templates.filter(t=>t.active).map(t=>`<option value="${t.id}">${escapeHtml(t.name)}</option>`).join('')}
        </select>
      </div></div>
      <div class="form-row"><div><label>Destinatários</label>
        <select id="massTarget">
          <option value="all">Todos os membros ativos</option>
          <option value="birthdays">Aniversariantes do mês</option>
          <option value="defaulters">Inadimplentes</option>
        </select>
      </div></div>
      <div class="form-row"><div><label>Banner de aviso (opcional)</label>
        <div class="mass-banner-upload">
          <label class="banner-file-label" for="massBannerInput"><i class="fas fa-image"></i> Carregar imagem do aviso</label>
          <input type="file" id="massBannerInput" accept="image/png,image/jpeg,image/webp" />
          <div id="massBannerPreview" class="mass-banner-preview hidden"></div>
        </div>
        <div class="mt-2 text-muted" style="font-size:12px"><i class="fas fa-info-circle"></i> Em celulares compatíveis, o banner será compartilhado diretamente pelo WhatsApp.</div>
      </div></div>
      <button class="btn btn-whatsapp" onclick="sendMassWhatsapp()"><i class="fab fa-whatsapp"></i> Abrir WhatsApp para cada destinatário</button>
      <div class="mt-3 text-muted" style="font-size:12px"><i class="fas fa-info-circle"></i> Com banner, o WhatsApp será aberto pelo compartilhamento nativo para anexar a imagem diretamente.</div>
    </div>
  `;
  const bannerInput = document.getElementById('massBannerInput');
  bannerInput.onchange = event => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      bannerInput.value = '';
      toast('Selecione uma imagem válida', 'warning');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      bannerInput.value = '';
      toast('A imagem deve ter no máximo 5 MB', 'warning');
      return;
    }
    const reader = new FileReader();
    reader.onload = event => {
      window._massBanner = { data: event.target.result, name: file.name };
      const preview = document.getElementById('massBannerPreview');
      preview.innerHTML = `<img src="${window._massBanner.data}" alt="Pré-visualização do banner" /><span>${escapeHtml(file.name)}</span>`;
      preview.classList.remove('hidden');
    };
    reader.readAsDataURL(file);
  };
}

function openTemplateForm(id = null) {
  if (!requireAdmin()) return;
  const t = id ? DB.message_templates.find(x => x.id === id) : { type: 'birthday', active: true, image: '' };
  window._templateImage = t.image || '';
  openModal({
    title: id ? 'Editar Modelo' : 'Novo Modelo',
    body: `
      <div class="form-row"><div><label>Nome *</label><input id="t_name" value="${escapeHtml(t.name || '')}"></div></div>
      <div class="form-row cols-2">
        <div><label>Tipo</label><select id="t_type">
          <option value="birthday" ${t.type==='birthday'?'selected':''}>Aniversário</option>
          <option value="payment" ${t.type==='payment'?'selected':''}>Cobrança</option>
          <option value="welcome" ${t.type==='welcome'?'selected':''}>Boas-vindas</option>
          <option value="notice" ${t.type==='notice'?'selected':''}>Aviso</option>
          <option value="other" ${t.type==='other'?'selected':''}>Outro</option>
        </select></div>
        <div><label>Status</label><select id="t_active"><option value="1" ${t.active?'selected':''}>Ativo</option><option value="0" ${!t.active?'selected':''}>Inativo</option></select></div>
      </div>
      <div class="form-row"><div><label>Mensagem</label>
        <textarea id="t_message" rows="8">${escapeHtml(t.message || '')}</textarea>
        <div class="text-muted mt-2" style="font-size:12px">Variáveis: <code>{NOME}</code>, <code>{MES}</code>, <code>{VALOR}</code></div>
      </div></div>
      <div class="form-row"><div><label>Imagem para enviar (opcional)</label>
        <div class="template-image-controls">
          <label class="banner-file-label" for="t_image_input"><i class="fas fa-upload"></i> Carregar imagem</label>
          <input type="file" id="t_image_input" accept="image/png,image/jpeg,image/webp" />
          <span class="text-muted" style="font-size:12px">Também é possível colar uma imagem no campo de mensagem.</span>
        </div>
        <div id="t_image_preview" class="template-image-preview ${t.image ? '' : 'hidden'}">${t.image ? `<img src="${t.image}" alt="Imagem do modelo" />` : ''}</div>
      </div></div>
    `,
    footer: `<button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
             <button class="btn btn-primary" onclick="saveTemplate(${id || 'null'})"><i class="fas fa-save"></i> Salvar</button>`
  });
  const imageInput = document.getElementById('t_image_input');
  const messageInput = document.getElementById('t_message');
  const preview = document.getElementById('t_image_preview');
  const readTemplateImage = file => {
    if (!file || !file.type.startsWith('image/')) {
      toast('Selecione uma imagem válida', 'warning');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast('A imagem deve ter no máximo 5 MB', 'warning');
      return;
    }
    const reader = new FileReader();
    reader.onload = event => {
      window._templateImage = event.target.result;
      preview.innerHTML = `<img src="${window._templateImage}" alt="Imagem do modelo" />`;
      preview.classList.remove('hidden');
    };
    reader.readAsDataURL(file);
  };
  imageInput.onchange = event => readTemplateImage(event.target.files?.[0]);
  messageInput.onpaste = event => {
    const image = Array.from(event.clipboardData?.items || []).find(item => item.type.startsWith('image/'));
    if (image) {
      event.preventDefault();
      readTemplateImage(image.getAsFile());
    }
  };
}

function saveTemplate(id) {
  if (!requireAdmin()) return;
  const data = {
    name: document.getElementById('t_name').value.trim(),
    type: document.getElementById('t_type').value,
    active: document.getElementById('t_active').value === '1',
    message: document.getElementById('t_message').value,
    image: window._templateImage || ''
  };
  if (!data.name) { toast('Nome obrigatório', 'error'); return; }
  if (!data.message.trim() && !data.image) { toast('Digite uma mensagem ou adicione uma imagem', 'error'); return; }
  if (id) Object.assign(DB.message_templates.find(x => x.id === id), data);
  else { data.id = DB.nextIds.template++; DB.message_templates.push(data); }
  saveDB(DB);
  closeModal();
  toast('Modelo salvo', 'success');
  render();
}

function deleteTemplate(id) {
  if (!requireAdmin()) return;
  confirmDialog('Excluir este modelo?', () => {
    DB.message_templates = DB.message_templates.filter(x => x.id !== id);
    saveDB(DB);
    toast('Modelo excluído', 'success');
    render();
  });
}

async function shareMassBanner(banner, message) {
  const response = await fetch(banner.data);
  const blob = await response.blob();
  const file = new File([blob], banner.name || 'banner-aviso.jpg', { type: blob.type || 'image/jpeg' });
  if (!navigator.share || !navigator.canShare || !navigator.canShare({ files: [file] })) return false;
  await navigator.share({ title: 'Aviso', text: message, files: [file] });
  return true;
}

async function sendMassWhatsapp() {
  if (!requireAdmin()) return;
  const tplId = +document.getElementById('massTemplate').value;
  const target = document.getElementById('massTarget').value;
  const tpl = DB.message_templates.find(x => x.id === tplId);
  if (!tpl) return;
  let list = [];
  if (target === 'all') list = DB.members.filter(m => m.status === 'active');
  else if (target === 'birthdays') {
    const cm = new Date().getMonth() + 1;
    list = DB.members.filter(m => m.status === 'active' && m.birth_date && new Date(m.birth_date + 'T00:00:00').getMonth() + 1 === cm);
  } else if (target === 'defaulters') {
    const ids = new Set(DB.memberships.filter(x => x.status === 'pending').map(x => x.member_id));
    list = DB.members.filter(m => ids.has(m.id));
  }
  if (!list.length) { toast('Nenhum destinatário', 'warning'); return; }
  if (!confirm(`Abrir WhatsApp para ${list.length} destinatário(s)?`)) return;
  const banner = window._massBanner || (tpl.image ? { data: tpl.image, name: `${tpl.name}.jpg` } : null);
  if (banner) {
    const firstMessage = (tpl.message || '').replace(/{NOME}/g, list[0].full_name.split(' ')[0]);
    try {
      const shared = await shareMassBanner(banner, firstMessage);
      if (shared) {
        logAction('mass_whatsapp', 'messages', tplId, `Banner compartilhado para ${list.length} membros`);
        saveDB(DB);
        toast('Banner enviado para o WhatsApp', 'success');
        return;
      }
    } catch (error) {
      if (error.name === 'AbortError') return;
    }
    toast('Seu navegador não permite envio direto. Abrindo o WhatsApp sem anexo.', 'warning');
  }
  list.forEach((m, i) => {
    setTimeout(() => {
      let phone = (m.whatsapp || m.phone || '').replace(/\D/g, '');
      if (!phone) return;
      const msg = (tpl.message || '').replace(/{NOME}/g, m.full_name.split(' ')[0]);
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
    }, i * 800);
  });
  logAction('mass_whatsapp', 'messages', tplId, `Mensagens em massa enviadas para ${list.length} membros`);
  saveDB(DB);
}

function renderUsers(c) {
  if (state.user.role !== 'admin') { c.innerHTML = '<div class="card"><div class="empty-state"><i class="fas fa-lock"></i><div>Acesso restrito a administradores</div></div></div>'; return; }
  c.innerHTML = `
    <div class="toolbar">
      <div style="flex:1"></div>
      <button class="btn btn-primary" onclick="openUserForm()"><i class="fas fa-user-plus"></i> Novo Usuário</button>
    </div>
    <div class="card" style="padding:0">
      <div class="table-wrap">
        <table>
          <thead><tr><th>Nome</th><th>E-mail</th><th>Perfil</th><th>Status</th><th>Criado em</th><th style="text-align:right">Ações</th></tr></thead>
          <tbody>
            ${DB.users.map(u => `
              <tr>
                <td><div class="member-cell"><div class="avatar-sm">${initials(u.name)}</div><div class="member-name">${escapeHtml(u.name)}</div></div></td>
                <td>${escapeHtml(u.email)}</td>
                <td><span class="badge ${u.role==='admin'?'badge-info':'badge-gray'}">${u.role==='admin'?'Administrador':'Usuário'}</span></td>
                <td><span class="badge ${u.status==='active'?'badge-success':'badge-gray'}">${u.status==='active'?'Ativo':'Inativo'}</span></td>
                <td>${fmtDate(u.created_at)}</td>
                <td><div class="actions" style="justify-content:flex-end">
                  <button class="btn btn-icon btn-secondary" onclick="openUserForm(${u.id})"><i class="fas fa-edit"></i></button>
                  ${u.id !== state.user.id ? `<button class="btn btn-icon btn-danger" onclick="deleteUser(${u.id})"><i class="fas fa-trash"></i></button>` : ''}
                </div></td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function openUserForm(id = null) {
  if (!requireAdmin()) return;
  const u = id ? DB.users.find(x => x.id === id) : { role: 'user', status: 'active' };
  openModal({
    title: id ? 'Editar Usuário' : 'Novo Usuário',
    body: `
      <div class="form-row"><div><label>Nome *</label><input id="u_name" value="${escapeHtml(u.name || '')}"></div></div>
      <div class="form-row"><div><label>E-mail *</label><input type="email" id="u_email" value="${escapeHtml(u.email || '')}"></div></div>
      <div class="form-row cols-2">
        <div><label>Senha ${id ? '(deixe em branco para manter)' : '*'}</label><input type="password" id="u_password"></div>
        <div><label>Perfil</label><select id="u_role"><option value="admin" ${u.role==='admin'?'selected':''}>Administrador</option><option value="user" ${u.role==='user'?'selected':''}>Usuário</option></select></div>
      </div>
      <div class="form-row"><div><label>Status</label><select id="u_status"><option value="active" ${u.status==='active'?'selected':''}>Ativo</option><option value="inactive" ${u.status==='inactive'?'selected':''}>Inativo</option></select></div></div>
    `,
    footer: `<button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
             <button class="btn btn-primary" onclick="saveUser(${id || 'null'})"><i class="fas fa-save"></i> Salvar</button>`
  });
}

function saveUser(id) {
  if (!requireAdmin()) return;
  const data = {
    name: document.getElementById('u_name').value.trim(),
    email: document.getElementById('u_email').value.trim(),
    password: document.getElementById('u_password').value,
    role: document.getElementById('u_role').value,
    status: document.getElementById('u_status').value
  };
  if (!data.name || !data.email) { toast('Preencha nome e e-mail', 'error'); return; }
  if (id) {
    const u = DB.users.find(x => x.id === id);
    Object.assign(u, data);
    if (!data.password) u.password = DB.users.find(x => x.id === id).password;
    logAction('update', 'users', id, `Usuário ${data.name} atualizado`);
  } else {
    if (!data.password) { toast('Senha obrigatória', 'error'); return; }
    data.id = DB.nextIds.user++;
    data.created_at = new Date().toISOString();
    DB.users.push(data);
    logAction('create', 'users', data.id, `Usuário ${data.name} cadastrado`);
  }
  saveDB(DB);
  closeModal();
  toast('Usuário salvo', 'success');
  render();
}

function deleteUser(id) {
  if (!requireAdmin()) return;
  confirmDialog('Excluir este usuário?', () => {
    DB.users = DB.users.filter(x => x.id !== id);
    saveDB(DB);
    toast('Usuário excluído', 'success');
    render();
  });
}

function renderAudit(c) {
  c.innerHTML = `
    <div class="card" style="padding:0">
      <div class="card-header" style="padding:20px 20px 0"><div class="card-title"><i class="fas fa-history"></i> Histórico de Auditoria</div></div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Data/Hora</th><th>Usuário</th><th>Módulo</th><th>Ação</th><th>Descrição</th></tr></thead>
          <tbody>
            ${DB.audit_logs.slice(0, 200).map(l => `
              <tr>
                <td>${new Date(l.created_at).toLocaleString('pt-BR')}</td>
                <td>${escapeHtml(l.user_name)}</td>
                <td><span class="badge badge-info">${escapeHtml(l.module)}</span></td>
                <td>${escapeHtml(l.action)}</td>
                <td>${escapeHtml(l.description)}</td>
              </tr>`).join('') || '<tr><td colspan="5"><div class="empty-state">Sem registros</div></td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderSettings(c) {
  const s = DB.settings;
  c.innerHTML = `
    <div class="tabs">
      <div class="tab active" data-tab="general">Geral</div>
      <div class="tab" data-tab="financial">Financeiro</div>
      <div class="tab" data-tab="appearance">Aparência</div>
      <div class="tab" data-tab="backup">Backup</div>
    </div>

    <div id="st-general">
      <div class="card">
        <div class="card-header"><div class="card-title">Dados do Grupo</div></div>
        <div class="form-row"><div><label>Nome do grupo</label><input id="s_group_name" value="${escapeHtml(s.group_name)}"></div></div>
        <div class="form-row"><div><label>Endereço</label><input id="s_address" value="${escapeHtml(s.address)}"></div></div>
        <div class="form-row cols-2">
          <div><label>Telefone</label><input id="s_phone" value="${escapeHtml(s.phone)}"></div>
          <div><label>E-mail</label><input id="s_email" value="${escapeHtml(s.email)}"></div>
        </div>
        <button class="btn btn-primary" onclick="saveSettings()"><i class="fas fa-save"></i> Salvar</button>
      </div>
    </div>

    <div id="st-financial" class="hidden">
      <div class="card">
        <div class="card-header"><div class="card-title">Padrões Financeiros</div></div>
        <div class="form-row cols-2">
          <div><label>Valor padrão da mensalidade (R$)</label><input type="number" step="0.01" id="s_amount" value="${s.default_membership_amount}"></div>
          <div><label>Dia padrão de vencimento</label><input type="number" id="s_due_day" value="${s.default_due_day}" min="1" max="31"></div>
        </div>
        <button class="btn btn-primary" onclick="saveSettings()"><i class="fas fa-save"></i> Salvar</button>
      </div>
    </div>

    <div id="st-appearance" class="hidden">
      <div class="card">
        <div class="card-header"><div class="card-title">Tema</div></div>
        <div style="display:flex;gap:10px">
          <button class="btn ${s.theme==='light'?'btn-primary':'btn-secondary'}" onclick="setTheme('light')"><i class="fas fa-sun"></i> Claro</button>
          <button class="btn ${s.theme==='dark'?'btn-primary':'btn-secondary'}" onclick="setTheme('dark')"><i class="fas fa-moon"></i> Escuro</button>
        </div>
      </div>
    </div>

    <div id="st-backup" class="hidden">
      <div class="card">
        <div class="card-header"><div class="card-title">Backup e Restauração</div></div>
        <div style="display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(200px,1fr))">
          <button class="btn btn-primary" onclick="exportBackup()"><i class="fas fa-download"></i> Exportar Backup (JSON)</button>
          <label class="btn btn-secondary" style="cursor:pointer"><i class="fas fa-upload"></i> Importar Backup<input type="file" accept=".json" style="display:none" onchange="importBackup(event)"></label>
          <button class="btn btn-danger" onclick="resetDemo()"><i class="fas fa-undo"></i> Restaurar Dados de Demo</button>
        </div>
        <div class="mt-4 text-muted" style="font-size:12px"><i class="fas fa-info-circle"></i> O backup contém todos os dados do sistema. Guarde-o em local seguro.</div>
      </div>
    </div>
  `;
  document.querySelectorAll('.tab').forEach(t => t.onclick = () => {
    document.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
    t.classList.add('active');
    ['general','financial','appearance','backup'].forEach(k => document.getElementById('st-' + k).classList.add('hidden'));
    document.getElementById('st-' + t.dataset.tab).classList.remove('hidden');
  });
}

function saveSettings() {
  if (!requireAdmin()) return;
  if (document.getElementById('s_group_name')) DB.settings.group_name = document.getElementById('s_group_name').value;
  if (document.getElementById('s_address')) DB.settings.address = document.getElementById('s_address').value;
  if (document.getElementById('s_phone')) DB.settings.phone = document.getElementById('s_phone').value;
  if (document.getElementById('s_email')) DB.settings.email = document.getElementById('s_email').value;
  if (document.getElementById('s_amount')) DB.settings.default_membership_amount = +document.getElementById('s_amount').value;
  if (document.getElementById('s_due_day')) DB.settings.default_due_day = +document.getElementById('s_due_day').value;
  saveDB(DB);
  document.getElementById('groupName').textContent = DB.settings.group_name;
  logAction('update', 'settings', 0, 'Configurações atualizadas');
  toast('Configurações salvas', 'success');
}

function setTheme(t) { DB.settings.theme = t; saveDB(DB); applyTheme(); render(); }

function exportBackup() {
  const blob = new Blob([JSON.stringify(DB, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `grupoapp_backup_${new Date().toISOString().substring(0,10)}.json`;
  a.click();
  logAction('backup', 'system', 0, 'Backup exportado');
  saveDB(DB);
  toast('Backup exportado', 'success');
}

function importBackup(e) {
  const f = e.target.files[0];
  if (!f) return;
  const r = new FileReader();
  r.onload = ev => {
    try {
      const data = JSON.parse(ev.target.result);
      if (!data.members || !data.users) throw new Error('Arquivo inválido');
      confirmDialog('Isso substituirá todos os dados atuais. Continuar?', () => {
        DB = data;
        saveDB(DB);
        toast('Backup restaurado', 'success');
        render();
      });
    } catch (err) { toast('Arquivo de backup inválido', 'error'); }
  };
  r.readAsText(f);
}

function resetDemo() {
  confirmDialog('Restaurar todos os dados de demonstração? Os dados atuais serão perdidos.', () => {
    DB = seedDatabase();
    saveDB(DB);
    toast('Dados de demonstração restaurados', 'success');
    render();
  });
}

async function init() {
  try {
    DB = await loadDB();
    applyTheme();
    if (state.user) enterApp();
  } catch (error) {
    console.error('Falha ao carregar o banco de dados:', error);
    const hint = document.querySelector('.login-hint');
    if (hint) hint.innerHTML = '<strong>Firebase não configurado.</strong> Preencha js/firebase-config.js e recarregue a página.';
    toast('Não foi possível carregar o banco de dados', 'error');
  }
}

init();
