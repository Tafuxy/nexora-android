const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const uid = () => crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
const todayISO = () => new Date().toISOString().slice(0, 10);
const clone = (obj) => JSON.parse(JSON.stringify(obj));

const icons = {
  home:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/></svg>',
  calendar:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/></svg>',
  wallet:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M4 6h14a2 2 0 0 1 2 2v11H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12"/><path d="M20 11h-5a2 2 0 0 0 0 4h5"/></svg>',
  car:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="m5 16 1-5 2-4h8l2 4 1 5"/><path d="M3 16h18v4H3zM6 20v2M18 20v2M7 16h.01M17 16h.01"/></svg>',
  user:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>',
  moon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z"/></svg>',
  sun:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>',
  plus:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>',
  receipt:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/></svg>',
  wrench:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M14.7 6.3a4 4 0 0 0-5-5L12 3.6 9.6 6 7.3 3.7a4 4 0 0 0 5 5L5 16a2.1 2.1 0 1 0 3 3l7.3-7.3a4 4 0 0 0 5-5L18 9l-2.4-2.4 2.3-2.3a4 4 0 0 0-3.2 2z"/></svg>',
  check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="m5 12 4 4L19 6"/></svg>',
  settings:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M12 3l1.2 2.7 2.9.4-2.1 2.1.5 2.9-2.5-1.4-2.5 1.4.5-2.9-2.1-2.1 2.9-.4L12 3Z"/><circle cx="12" cy="13" r="3"/></svg>'
};

const translations = {
  et: {
    pages: { home: 'Avaleht', planner: 'Plaanid', money: 'Raha', garage: 'Garaaž', profile: 'Seaded' },
    nav: { home: 'Avaleht', planner: 'Plaanid', money: 'Raha', garage: 'Garaaž', profile: 'Seaded' },
    dateLongOptions: { weekday: 'long', day: 'numeric', month: 'long' },
    dateShortOptions: { day: '2-digit', month: 'short' },
    emptyName: 'sõber',
    greetingMorning: 'hommikust',
    greetingDay: 'tere',
    greetingEvening: 'õhtust',
    homeWelcome: 'Tere tulemast tagasi',
    budgetAvailable: 'Selle kuu eelarvest vaba',
    budgetOver: 'Üle kuu eelarve',
    spentOf: 'kulutatud',
    ofBudget: 'eelarvest',
    usedPercent: 'kasutatud',
    noBudgetTitle: 'Sea enda Nexora üles',
    noBudgetText: 'Lisa eelarve, säästueesmärk ja esimene auto või ülesanne, et äpp hakkaks sulle päris ülevaadet näitama.',
    setupNow: 'Ava seaded',
    addTask: 'Lisa ülesanne',
    addExpense: 'Lisa kulu',
    carCost: 'Autokulu',
    addCar: 'Lisa auto',
    income: 'Tulu',
    garage: 'Auto',
    savings: 'Säästud',
    thisMonth: 'see kuu',
    carCosts: 'autokulud',
    upNext: 'Järgmisena',
    seeAll: 'Vaata kõiki',
    noUrgent: 'Praegu pole midagi kiiret.',
    smartInsights: 'Nutikad tähelepanekud',
    plannerTasks: 'Sinu ülesanded',
    openCount: 'aktiivset',
    noTasksYet: 'Ülesandeid pole veel.',
    monthlyCashflow: 'Kuu rahavoog',
    inOut: 'sisse · välja',
    budget: 'Eelarve',
    remaining: 'Järele jäänud',
    spent: 'Kulud',
    topCategories: 'Peamised kategooriad',
    noTransactions: 'Tehinguid pole veel.',
    recentTransactions: 'Viimased tehingud',
    yourVehicles: 'Sinu autod',
    noVehicles: 'Autosid pole veel lisatud.',
    noVehiclesHelp: 'Lisa esimene auto ja hakka jälgima hooldusi, kindlustust ja autokulusid.',
    setupVehicle: 'Lisa esimene auto',
    profileTitle: 'Sinu Nexora',
    profileSubtitle: 'Seaded, keel ja andmed',
    personalInfo: 'Isiklikud andmed',
    budgetAndGoals: 'Eelarve ja eesmärgid',
    appSettings: 'Rakenduse seaded',
    language: 'Keel',
    estonian: 'Eesti',
    english: 'English',
    appearance: 'Välimus',
    themeAuto: 'Tume / hele nupp üleval',
    exportData: 'Ekspordi andmed',
    resetData: 'Tühjenda kõik andmed',
    edit: 'Muuda',
    configure: 'Seadista',
    save: 'Salvesta',
    cancel: 'Tühista',
    close: 'Sulge',
    newTask: 'Uus ülesanne',
    task: 'Ülesanne',
    whatNeedsDoing: 'Mis on vaja ära teha?',
    date: 'Kuupäev',
    time: 'Kellaaeg',
    category: 'Kategooria',
    personal: 'Isiklik',
    work: 'Töö',
    other: 'Muu',
    newTransaction: 'Uus tehing',
    type: 'Tüüp',
    expense: 'Kulu',
    incomeType: 'Tulu',
    amount: 'Summa',
    note: 'Märkus',
    optionalNote: 'Valikuline märkus',
    addVehicle: 'Lisa auto',
    vehicle: 'Auto',
    plate: 'Reg nr',
    odometer: 'Läbisõit',
    nextServiceAt: 'Järgmine hooldus (km)',
    insuranceRenewal: 'Kindlustuse lõpp',
    inspection: 'Ülevaatus',
    addCostFor: 'Lisa kulu',
    updateFor: 'Uuenda',
    currentOdometer: 'Praegune läbisõit',
    serviceDue: 'Hooldus',
    notSet: 'määramata',
    dueNow: 'teha kohe',
    noPlate: 'Reg nr puudub',
    updateKm: 'Uuenda km',
    firstTask: 'Lisa esimene ülesanne',
    setProfile: 'Muuda profiili',
    name: 'Nimi',
    monthlyBudget: 'Kuu eelarve',
    savingsGoal: 'Säästueesmärk',
    savedCurrently: 'Praegu säästetud',
    data: 'Andmed',
    resetConfirm: 'Kas tühjendan kõik Nexora andmed? Seda ei saa tagasi võtta.',
    settingsSaved: 'Seaded salvestatud',
    budgetAlert: 'Eelarve hoiatus',
    budgetTrack: 'Eelarve kontrolli all',
    overBudgetBy: 'Oled sellel kuul eelarvest üle',
    availableThisMonth: 'Sellel kuul on veel vaba',
    carCostsDetected: 'Autokulud leitud',
    garageSpendingIs: 'Autodega seotud kulud on sellel kuul',
    todayAtAGlance: 'Tänane ülevaade',
    unfinishedTasksToday: 'Tänaseks on lõpetamata ülesandeid',
    noInsightsYet: 'Lisa andmeid ja Nexora hakkab sulle soovitusi näitama.',
    today: 'Täna',
    serviceTagPrefix: 'Hooldus',
    inspectionTagPrefix: 'Ülevaatus',
    insuranceTagPrefix: 'Kindlustus',
    firstOpenCard: 'Alusta puhtalt',
    firstOpenSub: 'See public-ready versioon tuleb ilma demoandmeteta. Lisa ainult oma päris andmed.',
    saveSettings: 'Salvesta seaded',
    systemReady: 'Public-ready',
    noDataYet: 'Andmeid pole veel',
    themeLabel: 'Välimus',
    themeModeHint: 'Kasuta üleval paremal tumeda/heleda teema nuppu.',
    categories: {
      Personal: 'Isiklik', Work: 'Töö', Garage: 'Garaaž', Money: 'Raha', Other: 'Muu',
      Food: 'Toit', Fuel: 'Kütus', Maintenance: 'Hooldus', Car: 'Auto', Insurance: 'Kindlustus', Shopping: 'Ostud', Bills: 'Arved', Income: 'Tulu'
    }
  },
  en: {
    pages: { home: 'Home', planner: 'Planner', money: 'Money', garage: 'Garage', profile: 'Settings' },
    nav: { home: 'Home', planner: 'Planner', money: 'Money', garage: 'Garage', profile: 'Settings' },
    dateLongOptions: { weekday: 'long', day: 'numeric', month: 'long' },
    dateShortOptions: { day: '2-digit', month: 'short' },
    emptyName: 'there',
    greetingMorning: 'morning',
    greetingDay: 'there',
    greetingEvening: 'evening',
    homeWelcome: 'Welcome back',
    budgetAvailable: 'Available in your monthly budget',
    budgetOver: 'Over your monthly budget',
    spentOf: 'spent',
    ofBudget: 'of budget',
    usedPercent: 'used',
    noBudgetTitle: 'Set up your Nexora',
    noBudgetText: 'Add your budget, savings goal and your first vehicle or task so the app can start showing real insights.',
    setupNow: 'Open settings',
    addTask: 'New task',
    addExpense: 'Add expense',
    carCost: 'Car cost',
    addCar: 'Add car',
    income: 'Income',
    garage: 'Garage',
    savings: 'Savings',
    thisMonth: 'this month',
    carCosts: 'car costs',
    upNext: 'Up next',
    seeAll: 'See all',
    noUrgent: 'Nothing urgent right now.',
    smartInsights: 'Smart insights',
    plannerTasks: 'Your tasks',
    openCount: 'open',
    noTasksYet: 'No tasks yet.',
    monthlyCashflow: 'Monthly cashflow',
    inOut: 'in · out',
    budget: 'Budget',
    remaining: 'Remaining',
    spent: 'Spent',
    topCategories: 'Top categories',
    noTransactions: 'No transactions yet.',
    recentTransactions: 'Recent transactions',
    yourVehicles: 'Your vehicles',
    noVehicles: 'No vehicles added yet.',
    noVehiclesHelp: 'Add your first vehicle and start tracking service, insurance and car costs.',
    setupVehicle: 'Add your first car',
    profileTitle: 'Your Nexora',
    profileSubtitle: 'Settings, language and data',
    personalInfo: 'Personal info',
    budgetAndGoals: 'Budget and goals',
    appSettings: 'App settings',
    language: 'Language',
    estonian: 'Estonian',
    english: 'English',
    appearance: 'Appearance',
    themeAuto: 'Use the dark/light toggle in the top bar',
    exportData: 'Export data',
    resetData: 'Clear all data',
    edit: 'Edit',
    configure: 'Configure',
    save: 'Save',
    cancel: 'Cancel',
    close: 'Close',
    newTask: 'New task',
    task: 'Task',
    whatNeedsDoing: 'What needs doing?',
    date: 'Date',
    time: 'Time',
    category: 'Category',
    personal: 'Personal',
    work: 'Work',
    other: 'Other',
    newTransaction: 'New transaction',
    type: 'Type',
    expense: 'Expense',
    incomeType: 'Income',
    amount: 'Amount',
    note: 'Note',
    optionalNote: 'Optional note',
    addVehicle: 'Add vehicle',
    vehicle: 'Vehicle',
    plate: 'Plate',
    odometer: 'Odometer',
    nextServiceAt: 'Next service at (km)',
    insuranceRenewal: 'Insurance renewal',
    inspection: 'Inspection',
    addCostFor: 'Add cost',
    updateFor: 'Update',
    currentOdometer: 'Current odometer',
    serviceDue: 'Service',
    notSet: 'not set',
    dueNow: 'due now',
    noPlate: 'No plate',
    updateKm: 'Update km',
    firstTask: 'Add your first task',
    setProfile: 'Edit profile',
    name: 'Name',
    monthlyBudget: 'Monthly budget',
    savingsGoal: 'Savings goal',
    savedCurrently: 'Currently saved',
    data: 'Data',
    resetConfirm: 'Clear all Nexora data? This cannot be undone.',
    settingsSaved: 'Settings saved',
    budgetAlert: 'Budget alert',
    budgetTrack: 'Budget on track',
    overBudgetBy: 'You are over budget this month by',
    availableThisMonth: 'Still available this month',
    carCostsDetected: 'Car costs detected',
    garageSpendingIs: 'Garage-related spending this month is',
    todayAtAGlance: 'Today at a glance',
    unfinishedTasksToday: 'unfinished tasks scheduled for today',
    noInsightsYet: 'Add some data and Nexora will start showing insights.',
    today: 'Today',
    serviceTagPrefix: 'Service',
    inspectionTagPrefix: 'Inspection',
    insuranceTagPrefix: 'Insurance',
    firstOpenCard: 'Start clean',
    firstOpenSub: 'This public-ready version opens without demo data. Add only your real information.',
    saveSettings: 'Save settings',
    systemReady: 'Public-ready',
    noDataYet: 'No data yet',
    themeLabel: 'Appearance',
    themeModeHint: 'Use the dark/light toggle in the top right.',
    categories: {
      Personal: 'Personal', Work: 'Work', Garage: 'Garage', Money: 'Money', Other: 'Other',
      Food: 'Food', Fuel: 'Fuel', Maintenance: 'Maintenance', Car: 'Car', Insurance: 'Insurance', Shopping: 'Shopping', Bills: 'Bills', Income: 'Income'
    }
  }
};

const cleanDefaults = {
  settings: { language: '' },
  profile: { name: '', monthlyBudget: 0, savingsGoal: 0, savingsCurrent: 0 },
  tasks: [],
  transactions: [],
  vehicles: [],
  meta: { firstOpen: true, appVersion: '1.0.0' }
};

const DEMO_TASKS = ['Review today’s priorities', 'Check upcoming car costs'];
const DEMO_NOTES = ['Fuel', 'Lunch', 'Income'];
const DEMO_VEHICLE = 'My car';

let state = loadState();
let currentView = 'home';

function esc(s = '') {
  return String(s).replace(/[&<>'"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]));
}

function deepMerge(base, incoming) {
  const out = clone(base);
  for (const [key, value] of Object.entries(incoming || {})) {
    if (value && typeof value === 'object' && !Array.isArray(value) && out[key] && typeof out[key] === 'object' && !Array.isArray(out[key])) {
      out[key] = deepMerge(out[key], value);
    } else {
      out[key] = value;
    }
  }
  return out;
}

function loadState() {
  try {
    const raw = JSON.parse(localStorage.getItem('nexora-state') || '{}');
    const merged = deepMerge(cleanDefaults, raw);
    return sanitizeState(merged);
  } catch {
    return clone(cleanDefaults);
  }
}

function sanitizeState(input) {
  const s = deepMerge(cleanDefaults, input || {});

  if (
    s.profile?.name === 'You' &&
    Array.isArray(s.tasks) && s.tasks.length <= 2 && s.tasks.every(t => DEMO_TASKS.includes(t.title)) &&
    Array.isArray(s.transactions) && s.transactions.length <= 3 && s.transactions.every(t => DEMO_NOTES.includes(t.note || t.category)) &&
    Array.isArray(s.vehicles) && s.vehicles.length <= 1 && (!s.vehicles[0] || s.vehicles[0].name === DEMO_VEHICLE)
  ) {
    s.profile = clone(cleanDefaults.profile);
    s.tasks = [];
    s.transactions = [];
    s.vehicles = [];
    s.meta.firstOpen = true;
  }

  s.profile.monthlyBudget = Number(s.profile.monthlyBudget || 0);
  s.profile.savingsGoal = Number(s.profile.savingsGoal || 0);
  s.profile.savingsCurrent = Number(s.profile.savingsCurrent || 0);
  s.tasks = Array.isArray(s.tasks) ? s.tasks : [];
  s.transactions = Array.isArray(s.transactions) ? s.transactions : [];
  s.vehicles = Array.isArray(s.vehicles) ? s.vehicles : [];
  s.meta = { ...(s.meta || {}), appVersion: '1.0.0', firstOpen: Boolean(s.meta?.firstOpen) };
  return s;
}

function saveState(renderAfter = true) {
  localStorage.setItem('nexora-state', JSON.stringify(state));
  if (renderAfter) render();
}

function locale() {
  const lang = state.settings.language || (navigator.language?.toLowerCase().startsWith('et') ? 'et' : 'en');
  return lang === 'et' ? 'et-EE' : 'en-GB';
}

function lang() {
  return state.settings.language || (navigator.language?.toLowerCase().startsWith('et') ? 'et' : 'en');
}

function t(key) {
  const bundle = translations[lang()] || translations.en;
  return key.split('.').reduce((obj, part) => obj?.[part], bundle) ?? key;
}

function categoryLabel(key) {
  return t(`categories.${key}`) || key;
}

function money(n) {
  return new Intl.NumberFormat(locale(), { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 }).format(Number(n || 0));
}

function fmtDate(dateStr) {
  if (!dateStr) return '';
  return new Intl.DateTimeFormat(locale(), t('dateShortOptions')).format(new Date(dateStr));
}

function setTodayLabel() {
  const d = new Date();
  $('#todayLabel').textContent = new Intl.DateTimeFormat(locale(), t('dateLongOptions')).format(d);
}

function greeting() {
  const h = new Date().getHours();
  if (h < 11) return t('greetingMorning');
  if (h < 18) return t('greetingDay');
  return t('greetingEvening');
}

function init() {
  document.documentElement.lang = lang();
  $$('.nav-icon').forEach(el => el.innerHTML = icons[el.dataset.icon]);
  applyNavLabels();
  setTodayLabel();

  $('#themeBtn').addEventListener('click', () => {
    document.documentElement.classList.toggle('light');
    localStorage.setItem('nexora-theme', document.documentElement.classList.contains('light') ? 'light' : 'dark');
    setThemeIcon();
  });

  if (localStorage.getItem('nexora-theme') === 'light') {
    document.documentElement.classList.add('light');
  }
  setThemeIcon();

  $$('.nav-item').forEach(btn => btn.addEventListener('click', () => {
    currentView = btn.dataset.view;
    $$('.nav-item').forEach(x => x.classList.toggle('active', x === btn));
    render();
  }));

  $('#modalBackdrop').addEventListener('click', e => { if (e.target.id === 'modalBackdrop') closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  render();
}

function applyNavLabels() {
  $$('.nav-item').forEach(btn => {
    const span = btn.querySelector('span:last-child');
    if (span) span.textContent = t(`nav.${btn.dataset.view}`);
  });
}

function setThemeIcon() {
  $('#themeBtn').innerHTML = document.documentElement.classList.contains('light') ? icons.moon : icons.sun;
}

function hasAnyData() {
  return Boolean(
    state.tasks.length || state.transactions.length || state.vehicles.length ||
    state.profile.monthlyBudget || state.profile.savingsGoal || state.profile.savingsCurrent || state.profile.name
  );
}

function render() {
  document.documentElement.lang = lang();
  applyNavLabels();
  setTodayLabel();
  $('#pageTitle').textContent = t(`pages.${currentView}`);
  $('#app').innerHTML = views[currentView]();
  bindView();
}

function monthTransactions() {
  const ym = todayISO().slice(0, 7);
  return state.transactions.filter(t => String(t.date || '').startsWith(ym));
}

function spentThisMonth() {
  return monthTransactions().filter(t => t.type === 'expense').reduce((a, t) => a + Number(t.amount || 0), 0);
}

function incomeThisMonth() {
  return monthTransactions().filter(t => t.type === 'income').reduce((a, t) => a + Number(t.amount || 0), 0);
}

function garageSpend() {
  return monthTransactions().filter(t => ['Fuel', 'Maintenance', 'Car', 'Insurance'].includes(t.category)).reduce((a, t) => a + Number(t.amount || 0), 0);
}

function upcomingTasks(limit = 4) {
  return state.tasks
    .filter(t => !t.done)
    .sort((a, b) => `${a.date || ''}${a.time || ''}`.localeCompare(`${b.date || ''}${b.time || ''}`))
    .slice(0, limit);
}

function categoryTotals() {
  const map = {};
  monthTransactions().filter(t => t.type === 'expense').forEach(t => map[t.category] = (map[t.category] || 0) + Number(t.amount || 0));
  return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5);
}

const views = {
  home() {
    const spend = spentThisMonth();
    const budget = Number(state.profile.monthlyBudget || 0);
    const left = budget - spend;
    const pct = budget ? Math.min(100, (spend / budget) * 100) : 0;
    const savingsPct = state.profile.savingsGoal ? Math.min(100, (state.profile.savingsCurrent / state.profile.savingsGoal) * 100) : 0;
    const firstVehicle = state.vehicles[0];
    const tasks = upcomingTasks();
    const name = state.profile.name || t('emptyName');

    const hero = budget
      ? `<section class="card hero">
          <div class="hero-kicker">${t('homeWelcome')} ${greeting()}, ${esc(name)}</div>
          <h2 class="${left < 0 ? 'money-neg' : ''}">${money(Math.abs(left))}</h2>
          <div class="hero-caption">${left >= 0 ? t('budgetAvailable') : t('budgetOver')}</div>
          <div class="progress" style="margin-top:17px"><span style="width:${pct}%"></span></div>
          <div class="hero-footer">
            <div class="tiny muted">${money(spend)} ${t('spentOf')}<br>${t('ofBudget')} ${money(budget)}</div>
            <div class="tiny right muted">${Math.round(Math.min(100, pct))}%<br>${t('usedPercent')}</div>
          </div>
        </section>`
      : `<section class="card hero">
          <div class="hero-kicker">${t('systemReady')}</div>
          <h2>${t('noBudgetTitle')}</h2>
          <div class="hero-caption">${t('noBudgetText')}</div>
          <div class="actions" style="margin-top:18px">
            <button class="primary" data-open-settings>${t('setupNow')}</button>
            <button class="secondary" data-add="task">${t('addTask')}</button>
          </div>
        </section>`;

    return `<div class="stack">
      ${hero}
      ${state.meta.firstOpen ? `<section class="card soft"><div class="insight"><b>${t('firstOpenCard')}</b><span class="small muted">${t('firstOpenSub')}</span></div></section>` : ''}
      <section class="quick-actions" aria-label="Quick actions">
        <button class="quick-action" data-add="task"><span class="quick-action-icon">${icons.plus}</span><span>${t('addTask')}</span></button>
        <button class="quick-action" data-add="transaction"><span class="quick-action-icon">${icons.receipt}</span><span>${t('addExpense')}</span></button>
        <button class="quick-action" ${firstVehicle ? `data-car-expense="${firstVehicle.id}"` : 'data-add="vehicle"'}><span class="quick-action-icon">${icons.wrench}</span><span>${firstVehicle ? t('carCost') : t('addCar')}</span></button>
      </section>
      <div class="grid-3">
        <section class="card kpi good-card"><div class="label">${t('income')}</div><div class="value money-pos">${money(incomeThisMonth())}</div><div class="delta muted">${t('thisMonth')}</div></section>
        <section class="card kpi"><div class="label">${t('garage')}</div><div class="value">${money(garageSpend())}</div><div class="delta muted">${t('carCosts')}</div></section>
        <section class="card kpi accent-card"><div class="label">${t('savings')}</div><div class="value">${Math.round(savingsPct)}%</div><div class="delta muted">${money(state.profile.savingsCurrent)}</div></section>
      </div>
      <div class="section-title"><h3>${t('upNext')}</h3><button class="ghost" data-go="planner">${t('seeAll')}</button></div>
      <section class="card"><div class="list">${tasks.length ? tasks.map(taskRow).join('') : `<div class="empty">${t('noUrgent')}</div>`}</div></section>
      <div class="section-title"><h3>${t('smartInsights')}</h3></div>
      <section class="card stack">${insights().map(x => `<div class="insight"><b>${esc(x.title)}</b><span class="small muted">${esc(x.text)}</span></div>`).join('')}</section>
    </div>`;
  },

  planner() {
    const open = state.tasks.filter(t => !t.done).length;
    return `<div class="stack">
      ${calendarStrip()}
      <div class="section-title"><h3>${t('plannerTasks')}</h3><span class="pill">${open} ${t('openCount')}</span></div>
      <section class="card"><div class="list">${state.tasks.length ? state.tasks.slice().sort((a, b) => `${a.date || ''}${a.time || ''}`.localeCompare(`${b.date || ''}${b.time || ''}`)).map(taskRow).join('') : `<div class="empty"><div class="empty-icon">✓</div>${t('noTasksYet')}</div>`}</div></section>
      <button class="fab" data-add="task" aria-label="${t('addTask')}">+</button>
    </div>`;
  },

  money() {
    const spend = spentThisMonth();
    const inc = incomeThisMonth();
    const net = inc - spend;
    const budget = Number(state.profile.monthlyBudget || 0);
    const cats = categoryTotals();
    const recent = state.transactions.slice().sort((a, b) => String(b.date || '').localeCompare(String(a.date || ''))).slice(0, 8);
    return `<div class="stack">
      <section class="card hero">
        <div class="hero-kicker">${t('monthlyCashflow')}</div>
        <h2 class="${net >= 0 ? 'money-pos' : 'money-neg'}">${money(net)}</h2>
        <div class="hero-caption">${money(inc)} ${t('inOut')} ${money(spend)}</div>
        <div class="progress" style="margin-top:17px"><span style="width:${budget ? Math.min(100, (spend / budget) * 100) : 0}%"></span></div>
        <div class="hero-footer"><div class="tiny muted">${t('budget')}<br>${money(budget)}</div><div class="tiny right muted">${t('remaining')}<br>${money(budget - spend)}</div></div>
      </section>
      <div class="grid-2">
        <section class="card kpi"><div class="label">${t('spent')}</div><div class="value money-neg">${money(spend)}</div><div class="delta muted">${t('thisMonth')}</div></section>
        <section class="card kpi good-card"><div class="label">${t('income')}</div><div class="value money-pos">${money(inc)}</div><div class="delta muted">${t('thisMonth')}</div></section>
      </div>
      <section class="card">
        <div class="section-title"><h3>${t('topCategories')}</h3><span class="pill">${cats.length}</span></div>
        ${cats.length ? `<div class="category-list">${cats.map(([name, total]) => {
          const pct = spend ? (total / spend) * 100 : 0;
          return `<div class="category-line"><div class="category-head"><span>${categoryLabel(name)}</span><strong>${money(total)}</strong></div><div class="category-track"><span style="width:${pct}%"></span></div></div>`;
        }).join('')}</div>` : `<div class="empty">${t('noTransactions')}</div>`}
      </section>
      <div class="section-title"><h3>${t('recentTransactions')}</h3><button class="ghost" data-add="transaction">${t('addExpense')}</button></div>
      <section class="card"><div class="list">${recent.length ? recent.map(txRow).join('') : `<div class="empty">${t('noTransactions')}</div>`}</div></section>
      <button class="fab" data-add="transaction" aria-label="${t('addExpense')}">+</button>
    </div>`;
  },

  garage() {
    return `<div class="stack">
      <div class="section-title"><h3>${t('yourVehicles')}</h3><button class="secondary compact-add" data-add="vehicle">${t('addVehicle')}</button></div>
      ${state.vehicles.length ? state.vehicles.map(vehicleCard).join('') : `<section class="card"><div class="empty"><div class="empty-icon">🚗</div><b>${t('noVehicles')}</b><div class="small muted" style="margin-top:8px">${t('noVehiclesHelp')}</div><div class="actions" style="margin-top:16px"><button class="primary" data-add="vehicle">${t('setupVehicle')}</button></div></div></section>`}
    </div>`;
  },

  profile() {
    const currentLangLabel = lang() === 'et' ? t('estonian') : t('english');
    const p = state.profile;
    const initials = (p.name || 'N').trim().slice(0, 1).toUpperCase();
    return `<div class="stack">
      <section class="card brand-card">
        <img class="brand-wordmark dark-logo" src="nexora-wordmark-dark.png" alt="Nexora" />
        <img class="brand-wordmark light-logo" src="nexora-wordmark-light.png" alt="Nexora" />
        <div class="brand-version">Nexora · 1.1.0</div>
      </section>
      <section class="card profile-hero">
        <div class="avatar">${esc(initials)}</div>
        <div>
          <div class="vehicle-name" style="font-size:22px">${esc(p.name || 'Nexora')}</div>
          <div class="muted small">${t('profileSubtitle')}</div>
        </div>
      </section>
      <section class="card">
        <div class="section-title"><h3>${t('personalInfo')}</h3><button class="ghost" data-edit-profile>${t('edit')}</button></div>
        <div class="statline"><span>${t('name')}</span><strong>${esc(p.name || '—')}</strong></div>
        <div class="statline"><span>${t('monthlyBudget')}</span><strong>${money(p.monthlyBudget)}</strong></div>
        <div class="statline"><span>${t('savingsGoal')}</span><strong>${money(p.savingsGoal)}</strong></div>
        <div class="statline"><span>${t('savedCurrently')}</span><strong>${money(p.savingsCurrent)}</strong></div>
      </section>
      <section class="card">
        <div class="section-title"><h3>${t('appSettings')}</h3><button class="ghost" data-open-settings>${t('configure')}</button></div>
        <div class="statline"><span>${t('language')}</span><strong>${currentLangLabel}</strong></div>
        <div class="statline"><span>${t('themeLabel')}</span><strong>${t('themeAuto')}</strong></div>
      </section>
      <section class="card">
        <div class="section-title"><h3>${t('data')}</h3></div>
        <div class="actions" style="margin-top:8px">
          <button class="secondary" data-export>${t('exportData')}</button>
          <button class="danger" data-reset>${t('resetData')}</button>
        </div>
      </section>
    </div>`;
  }
};

function calendarStrip() {
  const start = new Date();
  const days = [...Array(7)].map((_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const iso = d.toISOString().slice(0, 10);
    const active = iso === todayISO();
    const dayName = new Intl.DateTimeFormat(locale(), { weekday: 'short' }).format(d);
    return `<div class="day ${active ? 'active' : ''}">${esc(dayName)}<strong>${d.getDate()}</strong></div>`;
  }).join('');
  return `<section class="calendar-strip">${days}</section>`;
}

function taskRow(item) {
  return `<div class="row">
      <button class="task-check ${item.done ? 'checked' : ''}" data-toggle-task="${item.id}" aria-label="toggle">${icons.check}</button>
      <div class="row-main">
        <div class="row-title">${esc(item.title)}</div>
        <div class="row-sub">${item.date ? (item.date === todayISO() ? t('today') : fmtDate(item.date)) : ''}${item.time ? ` · ${esc(item.time)}` : ''}${item.category ? ` · ${esc(categoryLabel(item.category))}` : ''}</div>
      </div>
      <button class="delete-btn" data-delete-task="${item.id}" aria-label="delete">×</button>
    </div>`;
}

function txRow(item) {
  return `<div class="row">
      <span class="dot ${item.type === 'income' ? 'good' : 'bad'}"></span>
      <div class="row-main">
        <div class="row-title">${esc(item.note || categoryLabel(item.category || 'Other'))}</div>
        <div class="row-sub">${esc(categoryLabel(item.category || 'Other'))} · ${fmtDate(item.date)}</div>
      </div>
      <strong class="${item.type === 'income' ? 'money-pos' : 'money-neg'}">${item.type === 'income' ? '+' : '−'}${money(item.amount)}</strong>
      <button class="delete-btn" data-delete-tx="${item.id}" aria-label="delete">×</button>
    </div>`;
}

function vehicleCard(vehicle) {
  const serviceLeft = Number(vehicle.nextServiceKm || 0) - Number(vehicle.odometer || 0);
  const serviceClass = !vehicle.nextServiceKm ? '' : serviceLeft <= 0 ? 'bad' : serviceLeft <= 1500 ? 'warn' : 'good';
  const serviceText = !vehicle.nextServiceKm ? t('notSet') : serviceLeft > 0 ? `${serviceLeft.toLocaleString(locale())} km` : t('dueNow');
  return `<section class="card vehicle">
      <div class="vehicle-top">
        <div class="vehicle-ident">
          <div class="vehicle-icon">${icons.car}</div>
          <div class="row-main">
            <div class="vehicle-name">${esc(vehicle.name)}</div>
            <div class="muted small">${esc(vehicle.plate || t('noPlate'))} · ${Number(vehicle.odometer || 0).toLocaleString(locale())} km</div>
          </div>
        </div>
        <button class="delete-btn" data-delete-vehicle="${vehicle.id}" aria-label="delete">×</button>
      </div>
      <div class="vehicle-meta">
        <span class="tag ${serviceClass}">${t('serviceTagPrefix')} ${serviceText}</span>
        ${vehicle.inspectionDate ? `<span class="tag">${t('inspectionTagPrefix')} ${fmtDate(vehicle.inspectionDate)}</span>` : ''}
        ${vehicle.insuranceDate ? `<span class="tag">${t('insuranceTagPrefix')} ${fmtDate(vehicle.insuranceDate)}</span>` : ''}
      </div>
      <div class="actions">
        <button class="primary" data-car-expense="${vehicle.id}">${t('carCost')}</button>
        <button class="secondary" data-edit-vehicle="${vehicle.id}">${t('updateKm')}</button>
      </div>
    </section>`;
}

function insights() {
  const spend = spentThisMonth();
  const budget = Number(state.profile.monthlyBudget || 0);
  const gSpend = garageSpend();
  const todayOpen = state.tasks.filter(task => !task.done && task.date === todayISO()).length;
  const list = [];

  if (budget) {
    list.push({
      title: spend > budget ? t('budgetAlert') : t('budgetTrack'),
      text: spend > budget ? `${t('overBudgetBy')} ${money(spend - budget)}.` : `${t('availableThisMonth')}: ${money(Math.max(0, budget - spend))}.`
    });
  }
  if (gSpend > 0) {
    list.push({ title: t('carCostsDetected'), text: `${t('garageSpendingIs')} ${money(gSpend)}.` });
  }
  if (state.tasks.length) {
    list.push({ title: t('todayAtAGlance'), text: `${todayOpen} ${t('unfinishedTasksToday')}.` });
  }
  if (!list.length) {
    list.push({ title: t('noDataYet'), text: t('noInsightsYet') });
  }
  return list.slice(0, 3);
}

function bindView() {
  $$('[data-go]').forEach(btn => btn.onclick = () => $(`.nav-item[data-view="${btn.dataset.go}"]`)?.click());
  $$('[data-add]').forEach(btn => btn.onclick = () => openAdd(btn.dataset.add));
  $$('[data-toggle-task]').forEach(btn => btn.onclick = () => {
    const item = state.tasks.find(x => x.id === btn.dataset.toggleTask);
    if (item) {
      item.done = !item.done;
      state.meta.firstOpen = false;
      saveState();
    }
  });
  $$('[data-delete-task]').forEach(btn => btn.onclick = () => {
    state.tasks = state.tasks.filter(x => x.id !== btn.dataset.deleteTask);
    saveState();
  });
  $$('[data-delete-tx]').forEach(btn => btn.onclick = () => {
    state.transactions = state.transactions.filter(x => x.id !== btn.dataset.deleteTx);
    saveState();
  });
  $$('[data-delete-vehicle]').forEach(btn => btn.onclick = () => {
    state.vehicles = state.vehicles.filter(x => x.id !== btn.dataset.deleteVehicle);
    saveState();
  });
  $$('[data-car-expense]').forEach(btn => btn.onclick = () => openCarExpense(btn.dataset.carExpense));
  $$('[data-edit-vehicle]').forEach(btn => btn.onclick = () => openVehicleUpdate(btn.dataset.editVehicle));
  $('[data-edit-profile]')?.addEventListener('click', openProfile);
  $('[data-open-settings]')?.addEventListener('click', openSettings);
  $('[data-export]')?.addEventListener('click', exportData);
  $('[data-reset]')?.addEventListener('click', resetData);
}

function exportData() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'nexora-data.json';
  a.click();
  URL.revokeObjectURL(a.href);
}

function resetData() {
  if (!confirm(t('resetConfirm'))) return;
  localStorage.removeItem('nexora-state');
  state = clone(cleanDefaults);
  closeModal();
  saveState();
}

function showModal(html) {
  $('#modal').innerHTML = html;
  $('#modalBackdrop').classList.remove('hidden');
  $('[data-close]')?.addEventListener('click', closeModal);
}

function closeModal() {
  $('#modalBackdrop').classList.add('hidden');
}

function modalForm(title, body, submitLabel = null) {
  return `<h2>${esc(title)}</h2><form class="form" id="modalForm">${body}<div class="modal-actions"><button type="button" class="ghost" data-close>${t('cancel')}</button><button class="primary" type="submit">${esc(submitLabel || t('save'))}</button></div></form>`;
}

function openAdd(type) {
  if (type === 'task') {
    showModal(modalForm(t('newTask'), `
      <div class="field"><label>${t('task')}</label><input name="title" required placeholder="${t('whatNeedsDoing')}"></div>
      <div class="grid-2"><div class="field"><label>${t('date')}</label><input name="date" type="date" value="${todayISO()}" required></div><div class="field"><label>${t('time')}</label><input name="time" type="time"></div></div>
      <div class="field"><label>${t('category')}</label><select name="category"><option value="Personal">${t('personal')}</option><option value="Work">${t('work')}</option><option value="Garage">${categoryLabel('Garage')}</option><option value="Money">${categoryLabel('Money')}</option><option value="Other">${t('other')}</option></select></div>
    `));
    $('#modalForm').onsubmit = e => {
      e.preventDefault();
      const f = new FormData(e.target);
      state.tasks.push({ id: uid(), title: f.get('title'), date: f.get('date'), time: f.get('time'), category: f.get('category'), done: false });
      state.meta.firstOpen = false;
      closeModal();
      saveState();
    };
  }

  if (type === 'transaction') {
    showModal(modalForm(t('newTransaction'), `
      <div class="grid-2"><div class="field"><label>${t('type')}</label><select name="type"><option value="expense">${t('expense')}</option><option value="income">${t('incomeType')}</option></select></div><div class="field"><label>${t('amount')}</label><input name="amount" type="number" min="0" step="0.01" required placeholder="0.00"></div></div>
      <div class="field"><label>${t('category')}</label><select name="category"><option value="Food">${categoryLabel('Food')}</option><option value="Fuel">${categoryLabel('Fuel')}</option><option value="Maintenance">${categoryLabel('Maintenance')}</option><option value="Car">${categoryLabel('Car')}</option><option value="Insurance">${categoryLabel('Insurance')}</option><option value="Shopping">${categoryLabel('Shopping')}</option><option value="Bills">${categoryLabel('Bills')}</option><option value="Income">${categoryLabel('Income')}</option><option value="Other">${categoryLabel('Other')}</option></select></div>
      <div class="field"><label>${t('date')}</label><input name="date" type="date" value="${todayISO()}" required></div>
      <div class="field"><label>${t('note')}</label><input name="note" placeholder="${t('optionalNote')}"></div>
    `));
    $('#modalForm').onsubmit = e => {
      e.preventDefault();
      const f = new FormData(e.target);
      state.transactions.push({ id: uid(), type: f.get('type'), amount: Number(f.get('amount')), category: f.get('category'), date: f.get('date'), note: f.get('note') });
      state.meta.firstOpen = false;
      closeModal();
      saveState();
    };
  }

  if (type === 'vehicle') {
    showModal(modalForm(t('addVehicle'), `
      <div class="field"><label>${t('vehicle')}</label><input name="name" required placeholder="BMW 520d Touring"></div>
      <div class="grid-2"><div class="field"><label>${t('plate')}</label><input name="plate" placeholder="123 ABC"></div><div class="field"><label>${t('odometer')}</label><input name="odometer" type="number" min="0" value="0"></div></div>
      <div class="field"><label>${t('nextServiceAt')}</label><input name="nextServiceKm" type="number" min="0" value="0"></div>
      <div class="grid-2"><div class="field"><label>${t('insuranceRenewal')}</label><input name="insuranceDate" type="date"></div><div class="field"><label>${t('inspection')}</label><input name="inspectionDate" type="date"></div></div>
    `));
    $('#modalForm').onsubmit = e => {
      e.preventDefault();
      const f = new FormData(e.target);
      state.vehicles.push({
        id: uid(),
        name: f.get('name'),
        plate: f.get('plate'),
        odometer: Number(f.get('odometer')),
        nextServiceKm: Number(f.get('nextServiceKm')),
        insuranceDate: f.get('insuranceDate'),
        inspectionDate: f.get('inspectionDate')
      });
      state.meta.firstOpen = false;
      closeModal();
      saveState();
    };
  }
}

function openCarExpense(id) {
  const vehicle = state.vehicles.find(x => x.id === id);
  if (!vehicle) return;
  showModal(modalForm(`${t('addCostFor')} · ${vehicle.name}`, `
      <div class="grid-2"><div class="field"><label>${t('type')}</label><select name="category"><option value="Fuel">${categoryLabel('Fuel')}</option><option value="Maintenance">${categoryLabel('Maintenance')}</option><option value="Insurance">${categoryLabel('Insurance')}</option><option value="Car">${categoryLabel('Car')}</option></select></div><div class="field"><label>${t('amount')}</label><input name="amount" type="number" min="0" step="0.01" required></div></div>
      <div class="field"><label>${t('date')}</label><input name="date" type="date" value="${todayISO()}" required></div>
      <div class="field"><label>${t('note')}</label><input name="note" value="${esc(vehicle.name)}"></div>
    `, t('save')));
  $('#modalForm').onsubmit = e => {
    e.preventDefault();
    const f = new FormData(e.target);
    state.transactions.push({ id: uid(), type: 'expense', amount: Number(f.get('amount')), category: f.get('category'), date: f.get('date'), note: f.get('note') || vehicle.name });
    state.meta.firstOpen = false;
    closeModal();
    saveState();
  };
}

function openVehicleUpdate(id) {
  const vehicle = state.vehicles.find(x => x.id === id);
  if (!vehicle) return;
  showModal(modalForm(`${t('updateFor')} · ${vehicle.name}`, `
      <div class="field"><label>${t('currentOdometer')}</label><input name="odometer" type="number" min="0" value="${vehicle.odometer || 0}" required></div>
      <div class="field"><label>${t('nextServiceAt')}</label><input name="nextServiceKm" type="number" min="0" value="${vehicle.nextServiceKm || 0}"></div>
    `));
  $('#modalForm').onsubmit = e => {
    e.preventDefault();
    const f = new FormData(e.target);
    vehicle.odometer = Number(f.get('odometer'));
    vehicle.nextServiceKm = Number(f.get('nextServiceKm'));
    closeModal();
    saveState();
  };
}

function openProfile() {
  const p = state.profile;
  showModal(modalForm(t('setProfile'), `
    <div class="field"><label>${t('name')}</label><input name="name" value="${esc(p.name)}"></div>
    <div class="field"><label>${t('monthlyBudget')}</label><input name="monthlyBudget" type="number" min="0" step="0.01" value="${p.monthlyBudget || 0}"></div>
    <div class="grid-2"><div class="field"><label>${t('savingsGoal')}</label><input name="savingsGoal" type="number" min="0" step="0.01" value="${p.savingsGoal || 0}"></div><div class="field"><label>${t('savedCurrently')}</label><input name="savingsCurrent" type="number" min="0" step="0.01" value="${p.savingsCurrent || 0}"></div></div>
  `, t('save')));
  $('#modalForm').onsubmit = e => {
    e.preventDefault();
    const f = new FormData(e.target);
    state.profile = {
      ...state.profile,
      name: String(f.get('name') || '').trim(),
      monthlyBudget: Number(f.get('monthlyBudget') || 0),
      savingsGoal: Number(f.get('savingsGoal') || 0),
      savingsCurrent: Number(f.get('savingsCurrent') || 0)
    };
    state.meta.firstOpen = false;
    closeModal();
    saveState();
  };
}

function openSettings() {
  showModal(modalForm(t('appSettings'), `
    <div class="field"><label>${t('language')}</label><select name="language"><option value="et" ${lang() === 'et' ? 'selected' : ''}>${t('estonian')}</option><option value="en" ${lang() === 'en' ? 'selected' : ''}>${t('english')}</option></select></div>
    <div class="field"><label>${t('themeLabel')}</label><div class="card soft" style="padding:14px"><div class="small muted">${t('themeModeHint')}</div></div></div>
  `, t('saveSettings')));
  $('#modalForm').onsubmit = e => {
    e.preventDefault();
    const f = new FormData(e.target);
    state.settings.language = String(f.get('language') || 'et');
    closeModal();
    saveState();
  };
}

init();
