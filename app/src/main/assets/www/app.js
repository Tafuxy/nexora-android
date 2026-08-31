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
  settings:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21h-4v-.09A1.7 1.7 0 0 0 8.6 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H3v-4h.09A1.7 1.7 0 0 0 4.6 8.6a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.1V3h4v.09A1.7 1.7 0 0 0 15.4 4.6a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 9c.15.35.38.68.7.94.3.25.7.39 1.1.4H21v4h-.09a1.7 1.7 0 0 0-1.51.66Z"/></svg>'
};

const translations = {
  et: {
    pages: { home: 'Avaleht', planner: 'Plaanid', money: 'Raha', garage: 'Garaaž', profile: 'Seaded' },
    nav: { home: 'Avaleht', planner: 'Plaanid', money: 'Raha', garage: 'Garaaž', profile: 'Seaded' },
    dateLongOptions: { weekday: 'long', day: 'numeric', month: 'long' },
    dateShortOptions: { day: '2-digit', month: 'short' },
    emptyName: 'sõber',
    greetingMorning: 'hommikust',
    greetingDay: 'päevast',
    greetingEvening: 'õhtust',
    homeWelcome: 'Tere',
    budgetAvailable: 'Selle kuu eelarvest vaba',
    budgetOver: 'Üle kuu eelarve',
    spentOf: 'kulutatud',
    ofBudget: 'eelarvest',
    usedPercent: 'kasutatud',
    noBudgetTitle: 'Sea enda Nexora üles',
    dayReadyTitle: 'Tänane päev',
    dayReadyClear: 'Kõik on rahulik. Lisa uus ülesanne või kulu siis, kui seda vajad.',
    dayReadyTasks: 'aktiivset ülesannet ootab sind',
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
    smartInsights: 'Ülevaade',
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
    firstOpenCard: 'Alusta enda moodi',
    firstOpenSub: 'Lisa oma päris andmed ja Nexora kohandub sinu päeva, raha ja auto järgi.',
    saveSettings: 'Salvesta seaded',
    systemReady: 'Sinu ülevaade',
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
    greetingDay: 'afternoon',
    greetingEvening: 'evening',
    homeWelcome: 'Good',
    budgetAvailable: 'Available in your monthly budget',
    budgetOver: 'Over your monthly budget',
    spentOf: 'spent',
    ofBudget: 'of budget',
    usedPercent: 'used',
    noBudgetTitle: 'Set up your Nexora',
    dayReadyTitle: 'Today',
    dayReadyClear: 'Everything is clear. Add a task or expense whenever you need it.',
    dayReadyTasks: 'open tasks are waiting for you',
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
    smartInsights: 'Overview',
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
    firstOpenCard: 'Make it yours',
    firstOpenSub: 'Add your real information and Nexora will adapt around your day, money and car.',
    saveSettings: 'Save settings',
    systemReady: 'Sinu ülevaade',
    noDataYet: 'No data yet',
    themeLabel: 'Appearance',
    themeModeHint: 'Use the dark/light toggle in the top right.',
    categories: {
      Personal: 'Personal', Work: 'Work', Garage: 'Garage', Money: 'Money', Other: 'Other',
      Food: 'Food', Fuel: 'Fuel', Maintenance: 'Maintenance', Car: 'Car', Insurance: 'Insurance', Shopping: 'Shopping', Bills: 'Bills', Income: 'Income'
    }
  }
};


const onboardingCopy = {
  et: {
    step: 'Samm', of: '/', back: 'Tagasi', next: 'Edasi', finish: 'Ava Nexora', skip: 'Jäta praegu vahele',
    setup1Title: 'Pane Nexora enda järgi paika',
    setup1Text: 'Alustame põhilisest. Neid seadeid saad hiljem alati muuta.',
    name: 'Sinu nimi', namePlaceholder: 'Kuidas Nexora sind kutsub?',
    language: 'Keel', estonian: 'Eesti', english: 'English', appearance: 'Välimus',
    systemTheme: 'Seadme järgi', darkTheme: 'Tume', lightTheme: 'Hele',
    setup2Title: 'Sinu raha ülevaade',
    setup2Text: 'Lisa ainult see, mida soovid jälgida. Kõik väljad on valikulised.',
    monthlyBudget: 'Kuu eelarve', currentSavings: 'Praegu säästetud', savingsGoal: 'Säästueesmärk',
    setup3Title: 'Lisa oma auto',
    setup3Text: 'Nii saad jälgida hooldust, läbisõitu, kindlustust ja autokulusid.',
    vehicleName: 'Mark ja mudel', plate: 'Reg nr', odometer: 'Läbisõit', nextService: 'Järgmine hooldus (km)',
    insuranceDate: 'Kindlustuse lõpp', inspectionDate: 'Ülevaatus',
    setup4Title: 'Viimane samm',
    setup4Text: 'Vali, millele Nexora keskendub, ja kuidas äpp avamisel kaitstud on.',
    personal: 'Isiklikud ülesanded', work: 'Töö', money: 'Raha ja eelarve', garage: 'Auto ja hooldus', bills: 'Arved ja tähtajad',
    biometric: 'Kasuta sõrmejälge või näotuvastust',
    biometricHint: 'Järgmisel avamisel saad Nexora kiiresti telefoni biomeetriaga avada.',
    requireAuth: 'Lukusta Nexora avamisel',
    requireAuthHint: 'Nexora küsib avamisel sõrmejälge, näotuvastust või telefoni ekraanilukku.',
    security: 'Turvalisus', localData: 'Sinu andmed',
    localDataHint: 'Nexora andmed salvestatakse praegu sellesse telefoni.',
    enable: 'Lülita sisse', disable: 'Lülita välja', on: 'Sees', off: 'Väljas',
    biometricUnavailable: 'Selles telefonis pole sõrmejälge või näotuvastust seadistatud.',
    biometricCancelled: 'Biomeetrilist avamist ei muudetud.', setupDone: 'Kõik on valmis'
  },
  en: {
    step: 'Step', of: '/', back: 'Back', next: 'Next', finish: 'Open Nexora', skip: 'Skip for now',
    setup1Title: 'Make Nexora yours',
    setup1Text: 'Start with the basics. You can change these settings later.',
    name: 'Your name', namePlaceholder: 'What should Nexora call you?',
    language: 'Language', estonian: 'Estonian', english: 'English', appearance: 'Appearance',
    systemTheme: 'Follow device', darkTheme: 'Dark', lightTheme: 'Light',
    setup2Title: 'Your money overview',
    setup2Text: 'Add only what you want to track. Every field is optional.',
    monthlyBudget: 'Monthly budget', currentSavings: 'Current savings', savingsGoal: 'Savings goal',
    setup3Title: 'Add your car',
    setup3Text: 'Track maintenance, mileage, insurance and real car costs.',
    vehicleName: 'Make and model', plate: 'Plate', odometer: 'Odometer', nextService: 'Next service (km)',
    insuranceDate: 'Insurance renewal', inspectionDate: 'Inspection',
    setup4Title: 'One last step',
    setup4Text: 'Choose what Nexora should focus on and how the app is protected when opened.',
    personal: 'Personal tasks', work: 'Work', money: 'Money and budget', garage: 'Car and maintenance', bills: 'Bills and deadlines',
    biometric: 'Use fingerprint or face unlock',
    biometricHint: 'Unlock Nexora quickly with your phone biometrics next time.',
    requireAuth: 'Lock Nexora on open',
    requireAuthHint: 'Nexora asks for fingerprint, face unlock or your phone screen lock when opened.',
    security: 'Security', localData: 'Your data',
    localDataHint: 'Nexora data is currently stored on this phone.',
    enable: 'Enable', disable: 'Disable', on: 'On', off: 'Off',
    biometricUnavailable: 'Fingerprint or face unlock is not set up on this phone.',
    biometricCancelled: 'Biometric unlock was not changed.', setupDone: 'You’re all set'
  }
};

function o(key) {
  const bundle = onboardingCopy[lang()] || onboardingCopy.en;
  return bundle[key] ?? key;
}

const cleanDefaults = {
  settings: { language: '', interests: [], requireAuth: true, biometricEnabled: false },
  profile: { name: '', monthlyBudget: 0, savingsGoal: 0, savingsCurrent: 0 },
  tasks: [],
  transactions: [],
  vehicles: [],
  meta: { firstOpen: true, setupComplete: false, appVersion: '1.3.0' }
};

const DEMO_TASKS = ['Review today’s priorities', 'Check upcoming car costs'];
const DEMO_NOTES = ['Fuel', 'Lunch', 'Income'];
const DEMO_VEHICLE = 'My car';

let state = loadState();
let currentView = 'home';
let nativeState = { authPending: false, biometricAvailable: false, biometricEnabled: false, requireAuth: true, setupComplete: false, deviceSecure: false };
let setupStep = 1;
let gateError = '';
let setupDraft = {};

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
  s.settings.interests = Array.isArray(s.settings?.interests) ? s.settings.interests : [];
  s.settings.requireAuth = s.settings?.requireAuth !== false;
  s.settings.biometricEnabled = Boolean(s.settings?.biometricEnabled);
  s.meta = { ...(s.meta || {}), appVersion: '1.3.0', firstOpen: Boolean(s.meta?.firstOpen), setupComplete: Boolean(s.meta?.setupComplete) };
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


function gateNeeded() {
  return !state.meta.setupComplete ? 'setup' : '';
}

function renderGate() {
  const gate = $('#gate');
  const mode = gateNeeded();
  if (!mode) {
    document.body.classList.remove('gated');
    gate.classList.add('hidden');
    gate.innerHTML = '';
    return;
  }

  document.body.classList.add('gated');
  gate.classList.remove('hidden');
  gate.innerHTML = setupMarkup();
  bindGate();
}

function setupMarkup() {
  const progress = Math.max(1, Math.min(4, setupStep)) * 25;
  const langValue = setupDraft.language || state.settings.language || lang();
  const themeValue = setupDraft.theme || localStorage.getItem('nexora-theme') || 'system';
  const interests = setupDraft.interests || state.settings.interests || [];
  const hasInterest = key => interests.includes(key);

  let body = '';
  if (setupStep === 1) {
    body = `<div class="setup-card">
      <h2>${o('setup1Title')}</h2><p>${o('setup1Text')}</p>
      <div class="field"><label>${o('name')}</label><input id="setupName" value="${esc(setupDraft.name ?? state.profile.name ?? '')}" placeholder="${o('namePlaceholder')}"></div>
      <div class="field"><label>${o('language')}</label><select id="setupLanguage"><option value="et" ${langValue==='et'?'selected':''}>${o('estonian')}</option><option value="en" ${langValue==='en'?'selected':''}>${o('english')}</option></select></div>
      <div class="field"><label>${o('appearance')}</label><div class="choice-grid">
        <button type="button" class="choice ${themeValue==='system'?'active':''}" data-theme-choice="system"><b>${o('systemTheme')}</b><span>Android</span></button>
        <button type="button" class="choice ${themeValue==='dark'?'active':''}" data-theme-choice="dark"><b>${o('darkTheme')}</b><span>●</span></button>
        <button type="button" class="choice ${themeValue==='light'?'active':''}" data-theme-choice="light"><b>${o('lightTheme')}</b><span>○</span></button>
      </div></div>
    </div>`;
  } else if (setupStep === 2) {
    body = `<div class="setup-card">
      <h2>${o('setup2Title')}</h2><p>${o('setup2Text')}</p>
      <div class="field"><label>${o('monthlyBudget')}</label><input id="setupBudget" type="number" inputmode="decimal" min="0" step="0.01" value="${esc((setupDraft.monthlyBudget ?? state.profile.monthlyBudget) || '')}" placeholder="0"></div>
      <div class="grid-2"><div class="field"><label>${o('currentSavings')}</label><input id="setupSavingsCurrent" type="number" inputmode="decimal" min="0" step="0.01" value="${esc((setupDraft.savingsCurrent ?? state.profile.savingsCurrent) || '')}" placeholder="0"></div><div class="field"><label>${o('savingsGoal')}</label><input id="setupSavingsGoal" type="number" inputmode="decimal" min="0" step="0.01" value="${esc((setupDraft.savingsGoal ?? state.profile.savingsGoal) || '')}" placeholder="0"></div></div>
    </div>`;
  } else if (setupStep === 3) {
    const existing = state.vehicles[0] || {};
    body = `<div class="setup-card">
      <h2>${o('setup3Title')}</h2><p>${o('setup3Text')}</p>
      <div class="field"><label>${o('vehicleName')}</label><input id="setupVehicleName" value="${esc(setupDraft.vehicleName ?? existing.name ?? '')}" placeholder="BMW 520d Touring"></div>
      <div class="grid-2"><div class="field"><label>${o('plate')}</label><input id="setupPlate" value="${esc(setupDraft.plate ?? existing.plate ?? '')}" placeholder="123 ABC"></div><div class="field"><label>${o('odometer')}</label><input id="setupOdometer" type="number" inputmode="numeric" min="0" value="${esc(setupDraft.odometer ?? existing.odometer ?? '')}" placeholder="0"></div></div>
      <div class="field"><label>${o('nextService')}</label><input id="setupService" type="number" inputmode="numeric" min="0" value="${esc(setupDraft.nextServiceKm ?? existing.nextServiceKm ?? '')}" placeholder="0"></div>
      <div class="grid-2"><div class="field"><label>${o('insuranceDate')}</label><input id="setupInsurance" type="date" value="${esc(setupDraft.insuranceDate ?? existing.insuranceDate ?? '')}"></div><div class="field"><label>${o('inspectionDate')}</label><input id="setupInspection" type="date" value="${esc(setupDraft.inspectionDate ?? existing.inspectionDate ?? '')}"></div></div>
      <button class="setup-skip" type="button" data-skip-car>${o('skip')}</button>
    </div>`;
  } else {
    body = `<div class="setup-card">
      <h2>${o('setup4Title')}</h2><p>${o('setup4Text')}</p>
      <div class="interest-grid">
        <button type="button" class="interest ${hasInterest('personal')?'active':''}" data-interest="personal">${o('personal')}</button>
        <button type="button" class="interest ${hasInterest('work')?'active':''}" data-interest="work">${o('work')}</button>
        <button type="button" class="interest ${hasInterest('money')?'active':''}" data-interest="money">${o('money')}</button>
        <button type="button" class="interest ${hasInterest('garage')?'active':''}" data-interest="garage">${o('garage')}</button>
        <button type="button" class="interest ${hasInterest('bills')?'active':''}" data-interest="bills">${o('bills')}</button>
      </div>
      <label class="security-option"><input type="checkbox" id="setupRequireAuth" ${state.settings.requireAuth!==false?'checked':''}><span><b>${o('requireAuth')}</b><span>${o('requireAuthHint')}</span></span></label>
      ${nativeState.biometricAvailable ? `<label class="security-option"><input type="checkbox" id="setupBiometric" ${state.settings.biometricEnabled?'checked':''}><span><b>${o('biometric')}</b><span>${o('biometricHint')}</span></span></label>` : ''}
    </div>`;
  }

  return `<div class="gate-shell setup-shell">
    <div class="setup-head"><img class="gate-logo" src="nexora-mark.png" alt="Nexora"><div class="row-main"><div class="setup-step-label">${o('step')} ${setupStep} ${o('of')} 4</div><div class="setup-progress"><span style="width:${progress}%"></span></div></div></div>
    ${body}
    <div class="setup-actions ${setupStep===1?'single':''}">
      ${setupStep>1?`<button class="secondary" type="button" data-setup-back>${o('back')}</button>`:''}
      <button class="primary" type="button" data-setup-next>${setupStep===4?o('finish'):o('next')}</button>
    </div>
  </div>`;
}

function saveCurrentSetupStep() {
  if (setupStep === 1) {
    setupDraft.name = String($('#setupName')?.value || '').trim();
    setupDraft.language = $('#setupLanguage')?.value || lang();
  } else if (setupStep === 2) {
    setupDraft.monthlyBudget = Number($('#setupBudget')?.value || 0);
    setupDraft.savingsCurrent = Number($('#setupSavingsCurrent')?.value || 0);
    setupDraft.savingsGoal = Number($('#setupSavingsGoal')?.value || 0);
  } else if (setupStep === 3) {
    setupDraft.vehicleName = String($('#setupVehicleName')?.value || '').trim();
    setupDraft.plate = String($('#setupPlate')?.value || '').trim();
    setupDraft.odometer = Number($('#setupOdometer')?.value || 0);
    setupDraft.nextServiceKm = Number($('#setupService')?.value || 0);
    setupDraft.insuranceDate = String($('#setupInsurance')?.value || '');
    setupDraft.inspectionDate = String($('#setupInspection')?.value || '');
  } else {
    setupDraft.requireAuth = $('#setupRequireAuth')?.checked !== false;
    setupDraft.biometric = Boolean($('#setupBiometric')?.checked);
  }
}

function finishSetup() {
  saveCurrentSetupStep();
  state.settings.language = setupDraft.language || state.settings.language || lang();
  state.settings.interests = setupDraft.interests || [];
  state.settings.requireAuth = setupDraft.requireAuth !== false;
  state.profile.name = setupDraft.name || state.profile.name || '';
  state.profile.monthlyBudget = Number(setupDraft.monthlyBudget || 0);
  state.profile.savingsCurrent = Number(setupDraft.savingsCurrent || 0);
  state.profile.savingsGoal = Number(setupDraft.savingsGoal || 0);

  if (setupDraft.vehicleName) {
    const vehicle = {
      id: state.vehicles[0]?.id || uid(),
      name: setupDraft.vehicleName,
      plate: setupDraft.plate || '',
      odometer: Number(setupDraft.odometer || 0),
      nextServiceKm: Number(setupDraft.nextServiceKm || 0),
      insuranceDate: setupDraft.insuranceDate || state.vehicles[0]?.insuranceDate || '',
      inspectionDate: setupDraft.inspectionDate || state.vehicles[0]?.inspectionDate || ''
    };
    if (state.vehicles.length) state.vehicles[0] = {...state.vehicles[0], ...vehicle}; else state.vehicles.push(vehicle);
  }

  state.meta.setupComplete = true;
  state.meta.firstOpen = false;
  try { window.NexoraNative?.setSetupComplete(true); } catch {}
  if (setupDraft.theme === 'dark' || setupDraft.theme === 'light') {
    localStorage.setItem('nexora-theme', setupDraft.theme);
    document.documentElement.classList.toggle('light', setupDraft.theme === 'light');
  } else if (setupDraft.theme === 'system') {
    localStorage.removeItem('nexora-theme');
    document.documentElement.classList.toggle('light', window.matchMedia?.('(prefers-color-scheme: light)').matches || false);
  }

  try { window.NexoraNative?.setRequireAuth(state.settings.requireAuth); } catch {}
  if (setupDraft.biometric && nativeState.biometricAvailable) {
    try { window.NexoraNative?.enableBiometric(); } catch {}
  } else if (!setupDraft.biometric) {
    state.settings.biometricEnabled = false;
    try { window.NexoraNative?.disableBiometric(); } catch {}
  }

  setupDraft = {};
  saveState(false);
  render();
}

function bindGate() {
  $$('[data-theme-choice]').forEach(btn => btn.addEventListener('click', () => {
    setupDraft.theme = btn.dataset.themeChoice;
    renderGate();
  }));
  $$('[data-interest]').forEach(btn => btn.addEventListener('click', () => {
    const current = new Set(setupDraft.interests || state.settings.interests || []);
    current.has(btn.dataset.interest) ? current.delete(btn.dataset.interest) : current.add(btn.dataset.interest);
    setupDraft.interests = [...current];
    renderGate();
  }));
  $('[data-skip-car]')?.addEventListener('click', () => {
    setupDraft.vehicleName = '';
    setupStep = 4;
    renderGate();
  });
  $('[data-setup-back]')?.addEventListener('click', () => {
    saveCurrentSetupStep();
    setupStep = Math.max(1, setupStep - 1);
    renderGate();
  });
  $('[data-setup-next]')?.addEventListener('click', () => {
    saveCurrentSetupStep();
    if (setupStep === 1) {
      state.settings.language = setupDraft.language || lang();
      saveState(false);
    }
    if (setupStep < 4) {
      setupStep += 1;
      renderGate();
    } else {
      finishSetup();
    }
  });
}

window.NexoraApp = {
  onNativeState(next) {
    nativeState = {...nativeState, ...(next || {})};
    state.settings.biometricEnabled = Boolean(nativeState.biometricEnabled);
    state.settings.requireAuth = nativeState.requireAuth !== false;
    if (state.meta.setupComplete && !nativeState.setupComplete) {
      try { window.NexoraNative?.setSetupComplete(true); } catch {}
    }
    saveState(false);
    renderGate();
  },
  onBiometricResult(result) {
    state.settings.biometricEnabled = Boolean(result?.enabled);
    nativeState.biometricEnabled = Boolean(result?.enabled);
    if (result?.enabled) {
      state.settings.requireAuth = true;
      nativeState.requireAuth = true;
      try { window.NexoraNative?.setRequireAuth(true); } catch {}
    }
    saveState(false);
    if (result?.status === 'unavailable') gateError = o('biometricUnavailable');
    render();
  }
};

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

  const savedTheme = localStorage.getItem('nexora-theme');
  if (savedTheme === 'light' || (!savedTheme && window.window.matchMedia?.('(prefers-color-scheme: light)').matches)) {
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
  renderGate();
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
  renderGate();
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


function homeQuickActions(firstVehicle) {
  const interests = state.settings.interests || [];
  const priority = [];
  if (interests.includes('money') || interests.includes('bills')) priority.push('money');
  if (interests.includes('garage')) priority.push('garage');
  if (interests.includes('personal') || interests.includes('work')) priority.push('task');
  for (const fallback of ['task','money','garage']) if (!priority.includes(fallback)) priority.push(fallback);

  return priority.slice(0,3).map(type => {
    if (type === 'task') return `<button class="quick-action" data-add="task"><span class="quick-action-icon">${icons.plus}</span><span>${t('addTask')}</span></button>`;
    if (type === 'money') return `<button class="quick-action" data-add="transaction"><span class="quick-action-icon">${icons.receipt}</span><span>${t('addExpense')}</span></button>`;
    return `<button class="quick-action" ${firstVehicle ? `data-car-expense="${firstVehicle.id}"` : 'data-add="vehicle"'}><span class="quick-action-icon">${icons.wrench}</span><span>${firstVehicle ? t('carCost') : t('addCar')}</span></button>`;
  }).join('');
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
      : state.meta.setupComplete
        ? `<section class="card hero">
            <div class="hero-kicker">${t('homeWelcome')} ${greeting()}, ${esc(name)}</div>
            <h2>${t('dayReadyTitle')}</h2>
            <div class="hero-caption">${tasks.length ? `${tasks.length} ${t('dayReadyTasks')}.` : t('dayReadyClear')}</div>
            <div class="actions" style="margin-top:18px"><button class="primary" data-add="task">${t('addTask')}</button><button class="secondary" data-add="transaction">${t('addExpense')}</button></div>
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
      <section class="quick-actions" aria-label="Quick actions">${homeQuickActions(firstVehicle)}</section>
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
    const biometricOn = Boolean(state.settings.biometricEnabled && nativeState.biometricEnabled);
    const requireAuth = state.settings.requireAuth !== false;
    return `<div class="stack">
      <section class="card brand-card">
        <img class="brand-wordmark dark-logo" src="nexora-wordmark-dark.png" alt="Nexora" />
        <img class="brand-wordmark light-logo" src="nexora-wordmark-light.png" alt="Nexora" />
        <div class="brand-version">Nexora · 1.3.0</div>
      </section>
      <section class="card">
        <div class="section-title"><h3>${o('localData')}</h3></div>
        <div class="settings-account" style="margin-top:12px"><div class="account-photo-fallback">${esc((p.name || 'N').slice(0,1).toUpperCase())}</div><div class="row-main"><div class="row-title">${esc(p.name || 'Nexora')}</div><div class="account-email">${o('localDataHint')}</div></div></div>
      </section>
      <section class="card">
        <div class="section-title"><h3>${o('security')}</h3></div>
        <div class="toggle-row"><div><div class="row-title">${o('biometric')}</div><div class="row-sub">${o('biometricHint')}</div></div><button class="switch ${biometricOn?'on':''}" data-toggle-biometric aria-label="${o('biometric')}"></button></div>
        <div class="toggle-row"><div><div class="row-title">${o('requireAuth')}</div><div class="row-sub">${o('requireAuthHint')}</div></div><button class="switch ${requireAuth?'on':''}" data-toggle-auth aria-label="${o('requireAuth')}"></button></div>
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
  $('[data-toggle-biometric]')?.addEventListener('click', () => {
    if (!nativeState.biometricAvailable) {
      gateError = o('biometricUnavailable');
      return;
    }
    try {
      if (state.settings.biometricEnabled) window.NexoraNative?.disableBiometric();
      else window.NexoraNative?.enableBiometric();
    } catch {}
  });
  $('[data-toggle-auth]')?.addEventListener('click', () => {
    state.settings.requireAuth = !state.settings.requireAuth;
    nativeState.requireAuth = state.settings.requireAuth;
    try { window.NexoraNative?.setRequireAuth(state.settings.requireAuth); } catch {}
    saveState();
  });
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
  const language = state.settings.language;
  state = clone(cleanDefaults);
  state.settings.language = language;
  try {
    window.NexoraNative?.setSetupComplete(false);
    window.NexoraNative?.disableBiometric();
    window.NexoraNative?.setRequireAuth(true);
  } catch {}
  setupStep = 1;
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
      <div class="field"><label>${t('vehicle')}</label><input name="name" value="${esc(vehicle.name || '')}" required></div>
      <div class="grid-2"><div class="field"><label>${t('plate')}</label><input name="plate" value="${esc(vehicle.plate || '')}"></div><div class="field"><label>${t('currentOdometer')}</label><input name="odometer" type="number" min="0" value="${vehicle.odometer || 0}" required></div></div>
      <div class="field"><label>${t('nextServiceAt')}</label><input name="nextServiceKm" type="number" min="0" value="${vehicle.nextServiceKm || 0}"></div>
      <div class="grid-2"><div class="field"><label>${t('insuranceRenewal')}</label><input name="insuranceDate" type="date" value="${esc(vehicle.insuranceDate || '')}"></div><div class="field"><label>${t('inspection')}</label><input name="inspectionDate" type="date" value="${esc(vehicle.inspectionDate || '')}"></div></div>
    `));
  $('#modalForm').onsubmit = e => {
    e.preventDefault();
    const f = new FormData(e.target);
    vehicle.name = String(f.get('name') || '').trim();
    vehicle.plate = String(f.get('plate') || '').trim();
    vehicle.odometer = Number(f.get('odometer') || 0);
    vehicle.nextServiceKm = Number(f.get('nextServiceKm') || 0);
    vehicle.insuranceDate = String(f.get('insuranceDate') || '');
    vehicle.inspectionDate = String(f.get('inspectionDate') || '');
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
  const savedTheme = localStorage.getItem('nexora-theme') || 'system';
  showModal(modalForm(t('appSettings'), `
    <div class="field"><label>${t('language')}</label><select name="language"><option value="et" ${lang() === 'et' ? 'selected' : ''}>${t('estonian')}</option><option value="en" ${lang() === 'en' ? 'selected' : ''}>${t('english')}</option></select></div>
    <div class="field"><label>${t('themeLabel')}</label><select name="theme"><option value="system" ${savedTheme==='system'?'selected':''}>${o('systemTheme')}</option><option value="dark" ${savedTheme==='dark'?'selected':''}>${o('darkTheme')}</option><option value="light" ${savedTheme==='light'?'selected':''}>${o('lightTheme')}</option></select></div>
  `, t('saveSettings')));
  $('#modalForm').onsubmit = e => {
    e.preventDefault();
    const f = new FormData(e.target);
    state.settings.language = String(f.get('language') || 'et');
    const theme = String(f.get('theme') || 'system');
    if (theme === 'system') {
      localStorage.removeItem('nexora-theme');
      document.documentElement.classList.toggle('light', window.matchMedia?.('(prefers-color-scheme: light)').matches || false);
    } else {
      localStorage.setItem('nexora-theme', theme);
      document.documentElement.classList.toggle('light', theme === 'light');
    }
    setThemeIcon();
    closeModal();
    saveState();
  };
}

init();
