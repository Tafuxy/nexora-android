const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const uid = () => crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
const localISODate = (d = new Date()) => { const y=d.getFullYear(); const m=String(d.getMonth()+1).padStart(2,'0'); const day=String(d.getDate()).padStart(2,'0'); return `${y}-${m}-${day}`; };
const todayISO = () => localISODate(new Date());
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
    pages: { home: 'Avaleht', planner: 'Plaanid', money: 'Raha', bills: 'Arved', garage: 'Garaaž', profile: 'Seaded' },
    nav: { home: 'Avaleht', planner: 'Plaanid', money: 'Raha', bills: 'Arved', garage: 'Garaaž', profile: 'Seaded' },
    dateLongOptions: { weekday: 'long', day: 'numeric', month: 'long' },
    dateShortOptions: { day: '2-digit', month: 'short' },
    emptyName: 'sõber',
    greetingMorning: 'hommikust',
    greetingDay: 'päevast',
    greetingEvening: 'õhtust',
    homeWelcome: 'Tere',
    budgetAvailable: 'Kuu kululimiidist vaba',
    budgetOver: 'Kuu kululimiit ületatud',
    spentOf: 'kulutatud',
    ofBudget: 'kululimiidist',
    usedPercent: 'kasutatud',
    noBudgetTitle: 'Sea enda Nexora üles',
    dayReadyTitle: 'Tänane päev',
    dayReadyClear: 'Kõik on rahulik. Lisa uus ülesanne või kulu siis, kui seda vajad.',
    dayReadyTasks: 'aktiivset ülesannet ootab sind',
    noBudgetText: 'Lisa kuu kululimiit, tulu ja muud vajalikud andmed, et näeksid kohe oma kuu rahalist seisu.',
    setupNow: 'Ava seaded',
    addTask: 'Lisa ülesanne',
    addExpense: 'Lisa kulu/tulu',
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
    budget: 'Kululimiit',
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
    budgetAndGoals: 'Kululimiit ja eesmärgid',
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
    monthlyBudget: 'Kuu kululimiit',
    savingsGoal: 'Säästueesmärk',
    savedCurrently: 'Praegu säästetud',
    data: 'Andmed',
    resetConfirm: 'Kas tühjendan kõik Nexora andmed? Seda ei saa tagasi võtta.',
    settingsSaved: 'Seaded salvestatud',
    budgetAlert: 'Kululimiidi hoiatus',
    budgetTrack: 'Kulud kontrolli all',
    overBudgetBy: 'Oled selle kuu kululimiidist üle',
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
    themeModeHint: 'Vali rakenduse välimus seadetes.',
    monthlyStatus: 'Selle kuu seis',
    availableMoney: 'Raha alles',
    limitRemaining: 'Kululimiiti alles',
    committedBills: 'Püsikulud kuus',
    expectedIncome: 'Kuutulu',
    actualIncome: 'Sisse tulnud',
    actualExpenses: 'Välja läinud',
    financialHealth: 'Finantsi ülevaade',
    onTrack: 'Oled praegu plaanis',
    needsAttention: 'Kulud vajavad tähelepanu',
    moneyHintPositive: 'Pärast selle kuu sisestatud tulusid ja kulusid on sul raha üle.',
    moneyHintNegative: 'Selle kuu kulud on sisestatud tuludest suuremad.',
    addIncome: 'Lisa tulu',
    salary: 'Palk',
    bonus: 'Boonus',
    otherIncome: 'Muu tulu',
    billsTitle: 'Igakuised arved',
    billsSubtitle: 'Hoia püsikulud ja maksetähtajad ühes kohas.',
    addBill: 'Lisa arve',
    billName: 'Arve nimi',
    billAmount: 'Summa kuus',
    dueDay: 'Maksetähtpäev',
    dueDayHint: 'Kuupäev 1–31',
    billCategory: 'Arve tüüp',
    paid: 'Makstud',
    markPaid: 'Märgi makstuks',
    undoPaid: 'Võta makse tagasi',
    dueOn: 'Tähtaeg',
    monthlyBillsTotal: 'Arveid kuus',
    paidThisMonth: 'Sel kuul makstud',
    unpaidThisMonth: 'Veel maksmata',
    nextBill: 'Järgmine arve',
    noBills: 'Igakuiseid arveid pole veel lisatud.',
    noBillsHelp: 'Lisa näiteks üür, telefon, internet, laen või muud püsikulud.',
    rent: 'Üür / laen',
    utilities: 'Kommunaalid',
    phoneInternet: 'Telefon / internet',
    subscription: 'Tellimus',
    loan: 'Laen / liising',
    statistics: 'Statistika',
    totalEarned: 'Kokku teenitud',
    totalSpent: 'Kokku kulutatud',
    totalBillsSpent: 'Kokku arvetele',
    totalCarSpent: 'Kokku autole',
    netAllTime: 'Kogu saldo',
    transactionsCount: 'Tehinguid',
    setSpendingLimit: 'Sea kululimiit',
    spendingLimitHelp: 'Kululimiit aitab näha, kui palju võid veel sel kuul kulutada.',
    incomeVsExpenses: 'Tulu vs kulud',
    plannedVsActual: 'Plaan ja tegelik seis',
    recurringBills: 'Püsikulud',
    billPaidTransaction: 'Arve makse',
    allTime: 'kogu aeg',
    categories: {
      Personal: 'Isiklik', Work: 'Töö', Garage: 'Garaaž', Money: 'Raha', Other: 'Muu',
      Food: 'Toit', Fuel: 'Kütus', Maintenance: 'Hooldus', Car: 'Auto', Insurance: 'Kindlustus', Shopping: 'Ostud', Bills: 'Arved', Salary: 'Palk', Income: 'Muu tulu', Bonus: 'Boonus', OtherIncome: 'Muu tulu', Rent: 'Üür / laen', Utilities: 'Kommunaalid', PhoneInternet: 'Telefon / internet', Subscription: 'Tellimus', Loan: 'Laen / liising'
    }
  },
  en: {
    pages: { home: 'Home', planner: 'Planner', money: 'Money', bills: 'Bills', garage: 'Garage', profile: 'Settings' },
    nav: { home: 'Home', planner: 'Planner', money: 'Money', bills: 'Bills', garage: 'Garage', profile: 'Settings' },
    dateLongOptions: { weekday: 'long', day: 'numeric', month: 'long' },
    dateShortOptions: { day: '2-digit', month: 'short' },
    emptyName: 'there',
    greetingMorning: 'morning',
    greetingDay: 'afternoon',
    greetingEvening: 'evening',
    homeWelcome: 'Good',
    budgetAvailable: 'Available in your monthly spending limit',
    budgetOver: 'Over your monthly spending limit',
    spentOf: 'spent',
    ofBudget: 'of spending limit',
    usedPercent: 'used',
    noBudgetTitle: 'Set up your Nexora',
    dayReadyTitle: 'Today',
    dayReadyClear: 'Everything is clear. Add a task or expense whenever you need it.',
    dayReadyTasks: 'open tasks are waiting for you',
    noBudgetText: 'Add a monthly spending limit and start logging income and expenses to get a clear money overview.',
    setupNow: 'Open settings',
    addTask: 'New task',
    addExpense: 'Add expense/income',
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
    budget: 'Spending limit',
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
    budgetAndGoals: 'Spending limit and goals',
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
    monthlyBudget: 'Monthly spending limit',
    savingsGoal: 'Savings goal',
    savedCurrently: 'Currently saved',
    data: 'Data',
    resetConfirm: 'Clear all Nexora data? This cannot be undone.',
    settingsSaved: 'Settings saved',
    budgetAlert: 'Spending limit alert',
    budgetTrack: 'Spending on track',
    overBudgetBy: 'You are over your spending limit this month by',
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
    systemReady: 'Your overview',
    noDataYet: 'No data yet',
    themeLabel: 'Appearance',
    themeModeHint: 'Choose the app appearance in settings.',
    monthlyStatus: 'This month',
    availableMoney: 'Money left',
    limitRemaining: 'Spending limit left',
    committedBills: 'Monthly fixed costs',
    expectedIncome: 'Monthly income',
    actualIncome: 'Income received',
    actualExpenses: 'Money spent',
    financialHealth: 'Financial overview',
    onTrack: 'You are on track',
    needsAttention: 'Spending needs attention',
    moneyHintPositive: 'You have money left after this month’s recorded income and expenses.',
    moneyHintNegative: 'This month’s expenses are higher than your recorded income.',
    addIncome: 'Add income',
    salary: 'Salary',
    bonus: 'Bonus',
    otherIncome: 'Other income',
    billsTitle: 'Monthly bills',
    billsSubtitle: 'Keep recurring costs and due dates in one place.',
    addBill: 'Add bill',
    billName: 'Bill name',
    billAmount: 'Monthly amount',
    dueDay: 'Due day',
    dueDayHint: 'Day 1–31',
    billCategory: 'Bill type',
    paid: 'Paid',
    markPaid: 'Mark paid',
    undoPaid: 'Undo payment',
    dueOn: 'Due',
    monthlyBillsTotal: 'Bills per month',
    paidThisMonth: 'Paid this month',
    unpaidThisMonth: 'Still unpaid',
    nextBill: 'Next bill',
    noBills: 'No monthly bills added yet.',
    noBillsHelp: 'Add rent, phone, internet, loans or other recurring costs.',
    rent: 'Rent / mortgage',
    utilities: 'Utilities',
    phoneInternet: 'Phone / internet',
    subscription: 'Subscription',
    loan: 'Loan / lease',
    statistics: 'Statistics',
    totalEarned: 'Total earned',
    totalSpent: 'Total spent',
    totalBillsSpent: 'Spent on bills',
    totalCarSpent: 'Spent on cars',
    netAllTime: 'All-time balance',
    transactionsCount: 'Transactions',
    setSpendingLimit: 'Set spending limit',
    spendingLimitHelp: 'Your spending limit shows how much you can still spend this month.',
    incomeVsExpenses: 'Income vs expenses',
    plannedVsActual: 'Plan vs actual',
    recurringBills: 'Fixed costs',
    billPaidTransaction: 'Bill payment',
    allTime: 'all time',
    categories: {
      Personal: 'Personal', Work: 'Work', Garage: 'Garage', Money: 'Money', Other: 'Other',
      Food: 'Food', Fuel: 'Fuel', Maintenance: 'Maintenance', Car: 'Car', Insurance: 'Insurance', Shopping: 'Shopping', Bills: 'Bills', Salary: 'Salary', Income: 'Other income', Bonus: 'Bonus', OtherIncome: 'Other income', Rent: 'Rent / mortgage', Utilities: 'Utilities', PhoneInternet: 'Phone / internet', Subscription: 'Subscription', Loan: 'Loan / lease'
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
    monthlyIncome: 'Kuutulu (soovi korral)', monthlyBudget: 'Kuu kululimiit', currentSavings: 'Praegu säästetud', savingsGoal: 'Säästueesmärk',
    setup3Title: 'Lisa oma auto',
    setup3Text: 'Nii saad jälgida hooldust, läbisõitu, kindlustust ja autokulusid.',
    vehicleName: 'Mark ja mudel', plate: 'Reg nr', odometer: 'Läbisõit', nextService: 'Järgmine hooldus (km)',
    insuranceDate: 'Kindlustuse lõpp', inspectionDate: 'Ülevaatus',
    setup4Title: 'Viimane samm',
    setup4Text: 'Vali, millele Nexora keskendub, ja kuidas äpp avamisel kaitstud on.',
    personal: 'Isiklikud ülesanded', work: 'Töö', money: 'Raha ja kululimiit', garage: 'Auto ja hooldus', bills: 'Arved ja tähtajad',
    biometric: 'Sõrmejälg või näotuvastus',
    biometricHint: 'Nexora kasutab avamisel automaatselt sõrmejälge või näotuvastust, kui see on sinu telefonis seadistatud.',
    requireAuth: 'Tuvastamine igal avamisel',
    requireAuthHint: 'Turvalisuse tõttu on äpilukk alati sees. Panga- ja finantsandmeid ei kuvata enne tuvastamist.',
    security: 'Turvalisus', localData: 'Sinu andmed',
    localDataHint: 'Nexora andmed salvestatakse praegu sellesse telefoni.',
    enable: 'Lülita sisse', disable: 'Lülita välja', on: 'Sees', off: 'Väljas', alwaysOn: 'Alati sees', securityRequired: 'Enne jätkamist seadista telefonis sõrmejälg, näotuvastus või ekraanilukk.',
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
    monthlyIncome: 'Monthly income (optional)', monthlyBudget: 'Monthly spending limit', currentSavings: 'Current savings', savingsGoal: 'Savings goal',
    setup3Title: 'Add your car',
    setup3Text: 'Track maintenance, mileage, insurance and real car costs.',
    vehicleName: 'Make and model', plate: 'Plate', odometer: 'Odometer', nextService: 'Next service (km)',
    insuranceDate: 'Insurance renewal', inspectionDate: 'Inspection',
    setup4Title: 'One last step',
    setup4Text: 'Choose what Nexora should focus on and how the app is protected when opened.',
    personal: 'Personal tasks', work: 'Work', money: 'Money and spending limit', garage: 'Car and maintenance', bills: 'Bills and deadlines',
    biometric: 'Fingerprint or face unlock',
    biometricHint: 'Nexora automatically uses fingerprint or face unlock when it is configured on your phone.',
    requireAuth: 'Authentication on every open',
    requireAuthHint: 'App lock is always on for security. Bank and financial data stays hidden until you authenticate.',
    security: 'Security', localData: 'Your data',
    localDataHint: 'Nexora data is currently stored on this phone.',
    enable: 'Enable', disable: 'Disable', on: 'On', off: 'Off', alwaysOn: 'Always on', securityRequired: 'Set up fingerprint, face unlock or a screen lock on your phone before continuing.',
    biometricUnavailable: 'Fingerprint or face unlock is not set up on this phone.',
    biometricCancelled: 'Biometric unlock was not changed.', setupDone: 'You’re all set'
  }
};


const financeCopy = {
  et: {
    overview: 'Ülevaade', bills: 'Arved', transactions: 'Tehingud',
    moneyStatus: 'Sinu rahaseis', leftAfterExpenses: 'Alles pärast kulusid',
    moneyPositive: 'Selle kuu tulud on kuludest suuremad.', moneyNegative: 'Selle kuu kulud on tuludest suuremad.',
    moneyEmpty: 'Lisa esimene tulu või kulu ja siia tekib selge kuu ülevaade.',
    limitUsed: 'Kululimiidist kasutatud', limitNotSet: 'Kululimiit pole määratud', setLimit: 'Määra kululimiit',
    totalIncome: 'Kuu tulud', totalExpenses: 'Kuu kulud', totalBills: 'Arved', freeMoney: 'Alles',
    recurringBills: 'Igakuised arved', monthlyBillsTotal: 'Arveid kuus', paidThisMonth: 'Makstud sel kuul', unpaidThisMonth: 'Tasumata',
    addBill: 'Lisa arve', noBills: 'Igakuiseid arveid pole veel.', noBillsHelp: 'Lisa näiteks üür, telefon, internet või muud püsivad kuumaksed.',
    billName: 'Arve nimetus', billNamePlaceholder: 'Näiteks internet', billAmount: 'Summa', dueDay: 'Maksetähtpäev', dueDayHint: 'Päev kuus (1–31)',
    markPaid: 'Märgi makstuks', paid: 'Makstud', undoPaid: 'Võta makse tagasi', due: 'Tähtaeg', everyMonth: 'iga kuu',
    salary: 'Palk', otherIncome: 'Muu tulu', expenseCategories: 'Kulu liik', incomeCategories: 'Tulu liik',
    financeStatistics: 'Finantsstatistika', earnedAllTime: 'Kokku teenitud', spentAllTime: 'Kokku kulutatud', billsAllTime: 'Kokku arvetele', garageAllTime: 'Kokku autole',
    spendingBreakdown: 'Kuhu raha läheb', spendingLimit: 'Kuu kululimiit',
    changeLimit: 'Muuda kululimiiti', limitLeft: 'limiidist alles',
    addIncomeExpense: 'Lisa kulu/tulu', transactionTypeHelp: 'Vali, kas raha tuli sisse või läks välja.'
  },
  en: {
    overview: 'Overview', bills: 'Bills', transactions: 'Transactions',
    moneyStatus: 'Your money status', leftAfterExpenses: 'Left after expenses',
    moneyPositive: 'Your income is higher than your spending this month.', moneyNegative: 'Your spending is higher than your income this month.',
    moneyEmpty: 'Add your first income or expense to get a clear monthly overview.',
    limitUsed: 'Spending limit used', limitNotSet: 'No spending limit set', setLimit: 'Set spending limit',
    totalIncome: 'Monthly income', totalExpenses: 'Monthly expenses', totalBills: 'Bills', freeMoney: 'Left',
    recurringBills: 'Monthly bills', monthlyBillsTotal: 'Bills per month', paidThisMonth: 'Paid this month', unpaidThisMonth: 'Unpaid',
    addBill: 'Add bill', noBills: 'No monthly bills yet.', noBillsHelp: 'Add rent, phone, internet or any other recurring monthly payment.',
    billName: 'Bill name', billNamePlaceholder: 'For example Internet', billAmount: 'Amount', dueDay: 'Due day', dueDayHint: 'Day of month (1–31)',
    markPaid: 'Mark paid', paid: 'Paid', undoPaid: 'Undo payment', due: 'Due', everyMonth: 'every month',
    salary: 'Salary', otherIncome: 'Other income', expenseCategories: 'Expense category', incomeCategories: 'Income category',
    financeStatistics: 'Financial statistics', earnedAllTime: 'Total earned', spentAllTime: 'Total spent', billsAllTime: 'Total on bills', garageAllTime: 'Total on cars',
    spendingBreakdown: 'Where your money goes', spendingLimit: 'Monthly spending limit',
    changeLimit: 'Change spending limit', limitLeft: 'left of limit',
    addIncomeExpense: 'Add expense/income', transactionTypeHelp: 'Choose whether money came in or went out.'
  }
};

const bankCopy = {
  et: {
    bankAccounts: 'Pangakontod', connectBank: 'Ühenda pank', chooseBank: 'Vali oma pank',
    bankConnectText: 'Ühenda pangakonto, et saldo, tulud ja kulud jõuaksid Nexorasse automaatselt.',
    bankConnected: 'Pank ühendatud', syncNow: 'Sünkroniseeri', lastSync: 'Viimane sünk',
    bankBalance: 'Kontode saldo', bankTransactions: 'Pangatehingud', disconnectBank: 'Eemalda pangaühendus',
    bankLoading: 'Laen pankasid…', bankSyncing: 'Sünkroniseerin…', bankAuthorizing: 'Ava pank ja kinnita ühendus.',
    bankError: 'Pangaühendusega tekkis probleem.', bankUnavailable: 'Pangaühendus pole selles buildis veel aktiveeritud.',
    noBankAccounts: 'Kontosid ei leitud.', bankPending: 'Ühendus ootab pangas kinnitamist.',
    syncedAutomatically: 'Tehingud lisatakse automaatselt sinu Raha ülevaatesse.',
    manualEntry: 'Lisa käsitsi', cashOnly: 'Kasuta käsitsi sisestust sularaha või puuduva tehingu jaoks.',
    bankPrivacy: 'Pangaandmeid näidatakse ainult pärast sõrmejälje, näotuvastuse või telefoni lukukoodi kinnitamist.',
    currentAccount: 'Arvelduskonto', savingsAccount: 'Säästukonto', bankAccount: 'Pangakonto', autoSync: 'Automaatne sünk',
    disconnectConfirm: 'Kas eemaldan pangaühenduse Nexorast? Imporditud tehingud jäävad alles.'
  },
  en: {
    bankAccounts: 'Bank accounts', connectBank: 'Connect bank', chooseBank: 'Choose your bank',
    bankConnectText: 'Connect your bank so balances, income and spending appear in Nexora automatically.',
    bankConnected: 'Bank connected', syncNow: 'Sync now', lastSync: 'Last sync',
    bankBalance: 'Account balance', bankTransactions: 'Bank transactions', disconnectBank: 'Disconnect bank',
    bankLoading: 'Loading banks…', bankSyncing: 'Syncing…', bankAuthorizing: 'Open your bank and approve the connection.',
    bankError: 'There was a problem with the bank connection.', bankUnavailable: 'Bank sync is not enabled in this build yet.',
    noBankAccounts: 'No bank accounts found.', bankPending: 'Waiting for bank approval.',
    syncedAutomatically: 'Transactions are added automatically to your Money overview.',
    manualEntry: 'Add manually', cashOnly: 'Use manual entry for cash or a missing transaction.',
    bankPrivacy: 'Bank data is shown only after fingerprint, face unlock or device passcode authentication.',
    currentAccount: 'Current account', savingsAccount: 'Savings account', bankAccount: 'Bank account', autoSync: 'Auto sync',
    disconnectConfirm: 'Disconnect the bank from Nexora? Imported transactions will remain.'
  }
};
function b(key) { return (bankCopy[lang()] || bankCopy.en)[key] ?? key; }

function f(key) { return (financeCopy[lang()] || financeCopy.en)[key] ?? key; }

function o(key) {
  const bundle = onboardingCopy[lang()] || onboardingCopy.en;
  return bundle[key] ?? key;
}

const cleanDefaults = {
  settings: { language: '', interests: [], requireAuth: true, biometricEnabled: false, notifications: { moneyReceived: true, moneySpent: true, bills: true, vehicles: true, budget: true, privacy: 'hideAmount' } },
  profile: { name: '', monthlyBudget: 0, monthlyIncome: 0, savingsGoal: 0, savingsCurrent: 0 },
  tasks: [],
  transactions: [],
  bills: [],
  vehicles: [],
  bank: { installId: '', handle: '', connected: false, institutionId: '', accounts: [], lastSync: '', syncStatus: '', syncWarning: '', lastTotalBalance: null },
  meta: { firstOpen: true, setupComplete: false, appVersion: '1.8.2' }
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
const BANK_API_URL = String(window.NEXORA_CONFIG?.bankApiUrl || '').trim().replace(/\/$/, '');
let bankBusy = false;
let bankLastAttempt = 0;
let bankAutoTimer = null;
const renderedMoneyValues = new Map();
const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)');

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
  s.profile.monthlyIncome = Number(s.profile.monthlyIncome || 0);
  s.profile.savingsGoal = Number(s.profile.savingsGoal || 0);
  s.profile.savingsCurrent = Number(s.profile.savingsCurrent || 0);
  s.tasks = Array.isArray(s.tasks) ? s.tasks : [];
  s.transactions = Array.isArray(s.transactions) ? s.transactions : [];
  s.bills = Array.isArray(s.bills) ? s.bills : [];
  s.vehicles = Array.isArray(s.vehicles) ? s.vehicles : [];
  s.settings.interests = Array.isArray(s.settings?.interests) ? s.settings.interests : [];
  s.settings.requireAuth = true;
  s.settings.biometricEnabled = Boolean(s.settings?.biometricEnabled);
  s.settings.notifications = deepMerge(cleanDefaults.settings.notifications, s.settings?.notifications || {});
  s.settings.notifications.moneyReceived = s.settings.notifications.moneyReceived !== false;
  s.settings.notifications.moneySpent = s.settings.notifications.moneySpent !== false;
  s.settings.notifications.bills = s.settings.notifications.bills !== false;
  s.settings.notifications.vehicles = s.settings.notifications.vehicles !== false;
  s.settings.notifications.budget = s.settings.notifications.budget !== false;
  if (!['full','hideAmount','generic'].includes(s.settings.notifications.privacy)) s.settings.notifications.privacy = 'hideAmount';
  s.bank = deepMerge(cleanDefaults.bank, s.bank || {});
  s.bank.accounts = Array.isArray(s.bank.accounts) ? s.bank.accounts : [];
  s.bank.installId = String(s.bank.installId || '');
  if (!s.bank.installId) s.bank.installId = `install-${uid()}`;
  s.meta = { ...(s.meta || {}), appVersion: '1.8.2', firstOpen: Boolean(s.meta?.firstOpen), setupComplete: Boolean(s.meta?.setupComplete) };
  return s;
}

function notificationConfigPayload() {
  const notifications = state.settings.notifications || cleanDefaults.settings.notifications;
  const knownBankKeys = state.transactions.filter(tx => tx.source === 'bank' && tx.bankKey).map(tx => tx.bankKey).slice(-1500);
  return {
    language: lang(),
    bankApiUrl: BANK_API_URL,
    bank: {
      installId: state.bank.installId || '',
      handle: state.bank.handle || '',
      connected: Boolean(state.bank.connected)
    },
    knownBankKeys,
    notifications: {
      moneyReceived: notifications.moneyReceived !== false,
      moneySpent: notifications.moneySpent !== false,
      bills: notifications.bills !== false,
      vehicles: notifications.vehicles !== false,
      budget: notifications.budget !== false,
      privacy: notifications.privacy || 'hideAmount'
    },
    bills: state.bills.filter(b => b.active !== false).map(bill => ({
      id: bill.id,
      name: bill.name,
      amount: Number(bill.amount || 0),
      dueDay: Number(bill.dueDay || 1),
      paidThisMonth: Boolean(billPaymentForMonth(bill))
    })),
    vehicles: state.vehicles.map(v => ({
      id: v.id,
      name: v.name,
      odometer: Number(v.odometer || 0),
      nextServiceKm: Number(v.nextServiceKm || 0),
      insuranceDate: v.insuranceDate || '',
      inspectionDate: v.inspectionDate || ''
    })),
    budget: {
      limit: Number(state.profile.monthlyBudget || 0),
      spent: Number(spentThisMonth() || 0)
    }
  };
}

function syncNativeNotificationConfig(requestPermission = false) {
  if (!state.meta.setupComplete) return;
  const payload = JSON.stringify(notificationConfigPayload());
  try { window.NexoraNative?.updateNotificationConfig?.(payload); } catch (_) {}
  if (requestPermission) {
    try { window.NexoraNative?.requestNotificationPermission?.(); } catch (_) {}
  }
}

function saveState(renderAfter = true) {
  localStorage.setItem('nexora-state', JSON.stringify(state));
  syncNativeNotificationConfig(false);
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
        <button type="button" class="choice ${themeValue==='system'?'active':''}" data-theme-choice="system"><b>${o('systemTheme')}</b><span>Auto</span></button>
        <button type="button" class="choice ${themeValue==='dark'?'active':''}" data-theme-choice="dark"><b>${o('darkTheme')}</b><span>●</span></button>
        <button type="button" class="choice ${themeValue==='light'?'active':''}" data-theme-choice="light"><b>${o('lightTheme')}</b><span>○</span></button>
      </div></div>
    </div>`;
  } else if (setupStep === 2) {
    body = `<div class="setup-card">
      <h2>${o('setup2Title')}</h2><p>${o('setup2Text')}</p>
      <div class="grid-2"><div class="field"><label>${o('monthlyIncome')}</label><input id="setupIncome" type="number" inputmode="decimal" min="0" step="0.01" value="${esc((setupDraft.monthlyIncome ?? state.profile.monthlyIncome) || '')}" placeholder="0"></div><div class="field"><label>${o('monthlyBudget')}</label><input id="setupBudget" type="number" inputmode="decimal" min="0" step="0.01" value="${esc((setupDraft.monthlyBudget ?? state.profile.monthlyBudget) || '')}" placeholder="0"></div></div>
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
      <div class="security-option security-fixed"><span class="security-lock">🔒</span><span><b>${o('requireAuth')}</b><span>${o('requireAuthHint')}</span></span><span class="pill">${o('alwaysOn')}</span></div>
      <div class="security-option security-fixed"><span class="security-lock">◉</span><span><b>${o('biometric')}</b><span>${o('biometricHint')}</span></span><span class="pill ${nativeState.biometricAvailable?'good':''}">${nativeState.biometricAvailable?o('on'):o('off')}</span></div>
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
    setupDraft.monthlyIncome = Number($('#setupIncome')?.value || 0);
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
    setupDraft.requireAuth = true;
    setupDraft.biometric = Boolean(nativeState.biometricAvailable);
  }
}

function finishSetup() {
  saveCurrentSetupStep();
  if (!(nativeState.deviceSecure || nativeState.biometricAvailable)) {
    gateError = o('securityRequired');
    renderGate();
    return;
  }
  state.settings.language = setupDraft.language || state.settings.language || lang();
  state.settings.interests = setupDraft.interests || [];
  state.settings.requireAuth = true;
  state.profile.name = setupDraft.name || state.profile.name || '';
  state.profile.monthlyIncome = Number(setupDraft.monthlyIncome || 0);
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

  try { window.NexoraNative?.setRequireAuth(true); } catch {}
  state.settings.biometricEnabled = Boolean(nativeState.biometricAvailable);
  if (nativeState.biometricAvailable) {
    try { window.NexoraNative?.enableBiometric(); } catch {}
  }

  setupDraft = {};
  saveState(false);
  syncNativeNotificationConfig(true);
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
    state.settings.requireAuth = true;
    if (state.meta.setupComplete && !nativeState.setupComplete) {
      try { window.NexoraNative?.setSetupComplete(true); } catch {}
    }
    saveState(false);
    renderGate();
    refreshBankAutoTimer();
    if (state.meta.setupComplete && !nativeState.authPending) {
      syncNativeNotificationConfig(false);
      if (!localStorage.getItem('nexora-notification-permission-v1')) {
        localStorage.setItem('nexora-notification-permission-v1', '1');
        setTimeout(() => syncNativeNotificationConfig(true), 450);
      }
      if (state.bank.handle && bankApiConfigured()) setTimeout(() => requestAutoSync(8000), 250);
    }
  },
  onBankReturn(handle) {
    if (typeof handle === 'string' && handle.length > 20) {
      state.bank.handle = handle;
      state.bank.syncStatus = 'AUTHORIZED';
      saveState(false);
    }
    bankLastAttempt = Date.now();
    syncBank(true);
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

  $('#settingsBtn').innerHTML = icons.settings;
  $('#settingsBtn').addEventListener('click', () => {
    currentView = 'profile';
    $$('.nav-item').forEach(x => x.classList.remove('active'));
    render();
  });

  const savedTheme = localStorage.getItem('nexora-theme');
  if (savedTheme === 'light' || (!savedTheme && window.matchMedia?.('(prefers-color-scheme: light)').matches)) {
    document.documentElement.classList.add('light');
  }
  $$('.nav-item').forEach(btn => btn.addEventListener('click', () => {
    currentView = btn.dataset.view;
    $$('.nav-item').forEach(x => x.classList.toggle('active', x === btn));
    render();
    refreshBankAutoTimer();
    // Bank data is app-level state, not Money-view state. Refresh from any tab.
    setTimeout(() => requestAutoSync(15000), 120);
  }));

  $('#modalBackdrop').addEventListener('click', e => { if (e.target.id === 'modalBackdrop') closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  render();
  renderGate();
  refreshBankAutoTimer();
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) setTimeout(() => requestAutoSync(10000), 250);
  });
}

function applyNavLabels() {
  $$('.nav-item').forEach(btn => {
    const span = btn.querySelector('span:last-child');
    if (span) span.textContent = t(`nav.${btn.dataset.view}`);
  });
}

function hasAnyData() {
  return Boolean(
    state.tasks.length || state.transactions.length || state.bills.length || state.vehicles.length ||
    state.profile.monthlyBudget || state.profile.monthlyIncome || state.profile.savingsGoal || state.profile.savingsCurrent || state.profile.name
  );
}

function render() {
  document.documentElement.lang = lang();
  applyNavLabels();
  setTodayLabel();
  $('#pageTitle').textContent = t(`pages.${currentView}`);
  $('#app').innerHTML = (views[currentView] || views.home)();
  bindView();
  animateMoneyChanges();
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



function currentMonthKey() { return todayISO().slice(0, 7); }
function monthlyBillsTotal() { return state.bills.filter(b => b.active !== false).reduce((sum, bill) => sum + Number(bill.amount || 0), 0); }
function billPaidThisMonth(bill) { return Boolean(billPaymentForMonth(bill)); }
function paidBillsThisMonth() { return state.bills.filter(billPaidThisMonth).reduce((sum, bill) => sum + Number(bill.amount || 0), 0); }
function unpaidBillsThisMonth() { return Math.max(0, monthlyBillsTotal() - paidBillsThisMonth()); }
function lifetimeIncome() { return state.transactions.filter(tx => tx.type === 'income').reduce((sum, tx) => sum + Number(tx.amount || 0), 0); }
function lifetimeSpend() { return state.transactions.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + Number(tx.amount || 0), 0); }
function lifetimeBills() { return state.transactions.filter(tx => tx.type === 'expense' && (tx.category === 'Bills' || tx.billId)).reduce((sum, tx) => sum + Number(tx.amount || 0), 0); }
function lifetimeGarage() { return state.transactions.filter(tx => tx.type === 'expense' && ['Fuel','Maintenance','Car','Insurance'].includes(tx.category)).reduce((sum, tx) => sum + Number(tx.amount || 0), 0); }
function dueDayLabel(day) { return `${f('due')} ${Math.max(1, Math.min(31, Number(day || 1)))}.`; }

function billPaymentForMonth(bill, month = currentMonthKey()) {
  return state.transactions.find(tx => tx.billId === bill.id && (tx.billMonth === month || String(tx.date || '').startsWith(month)));
}
function nextBillDue() {
  const today = new Date();
  const currentDay = today.getDate();
  const unpaid = state.bills.filter(b => b.active !== false && !billPaymentForMonth(b)).sort((a,b) => Number(a.dueDay||31)-Number(b.dueDay||31));
  return unpaid.find(b => Number(b.dueDay || 31) >= currentDay) || unpaid[0] || null;
}
function allTimeStats() {
  const income = lifetimeIncome(), spent = lifetimeSpend(), bills = lifetimeBills(), car = lifetimeGarage();
  return { income, spent, bills, car, net: income - spent, count: state.transactions.length };
}
function financeStatus() {
  const inc = incomeThisMonth(), spend = spentThisMonth();
  const limit = Number(state.profile.monthlyBudget || 0);
  const expectedIncome = Number(state.profile.monthlyIncome || 0);
  return {
    inc, spend, limit, expectedIncome,
    cashLeft: inc - spend,
    limitLeft: limit ? limit - spend : null,
    plannedAfterBills: expectedIncome ? expectedIncome - monthlyBillsTotal() : null
  };
}


function bankApiConfigured() {
  return /^https:\/\//i.test(BANK_API_URL);
}

function totalBankBalance() {
  return (state.bank.accounts || []).reduce((sum, account) => sum + (Number.isFinite(Number(account.balance)) ? Number(account.balance) : 0), 0);
}

function bankAccountTypeLabel(account) {
  const code = String(account?.account_type || '').trim().toUpperCase();
  const raw = String(account?.name || '').trim();
  const upper = raw.toUpperCase().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
  if (['CACC','CURRENT','CHECKING','CURRENT ACCOUNT','CHECKING ACCOUNT'].includes(code) || ['CURRENT','CHECKING','CURRENT ACCOUNT','CHECKING ACCOUNT'].includes(upper)) return b('currentAccount');
  if (['SVGS','SAVINGS','SAVINGS ACCOUNT','DEPOSIT'].includes(code) || ['SAVINGS','SAVINGS ACCOUNT','DEPOSIT'].includes(upper)) return b('savingsAccount');
  return b('bankAccount');
}

function bankAccountDisplayName(account) {
  // Exact nickname/description from the bank wins. Preserve its original casing.
  const explicit = String(account?.display_name || '').trim();
  if (explicit) return explicit;
  const raw = String(account?.name || '').trim();
  const upper = raw.toUpperCase().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
  const generic = ['BANK ACCOUNT','CURRENT','CHECKING','CURRENT ACCOUNT','CHECKING ACCOUNT','SAVINGS','SAVINGS ACCOUNT','DEPOSIT','CACC','SVGS'];
  if (raw && !generic.includes(upper)) return raw;
  return bankAccountTypeLabel(account);
}

function bankAccountMeta(account) {
  const iban = String(account?.iban || '');
  const tail = iban ? `•••• ${iban.slice(-4)}` : '';
  return [bankAccountTypeLabel(account), tail].filter(Boolean).join(' · ');
}

function animateMoneyChanges() {
  const nodes = $$('[data-money-key][data-money-value]');
  if (!nodes.length) return;
  const reduce = Boolean(prefersReducedMotion?.matches);
  for (const el of nodes) {
    const key = String(el.dataset.moneyKey || '');
    const next = Number(el.dataset.moneyValue);
    if (!key || !Number.isFinite(next)) continue;
    const previous = renderedMoneyValues.get(key);
    renderedMoneyValues.set(key, next);
    if (previous == null || !Number.isFinite(previous) || Math.abs(next - previous) < 0.005 || reduce) {
      el.textContent = money(next);
      continue;
    }
    tweenMoneyElement(el, previous, next);
  }
}

function tweenMoneyElement(el, from, to) {
  const delta = to - from;
  const duration = Math.min(1050, 620 + Math.min(330, Math.abs(delta) * 4));
  const started = performance.now();
  el.classList.remove('money-tween-up', 'money-tween-down');
  void el.offsetWidth;
  el.classList.add(delta >= 0 ? 'money-tween-up' : 'money-tween-down');
  const surface = el.closest('.bank-account-row, .finance-hero, .kpi, .plan-cell');
  if (surface) {
    surface.classList.remove('money-surface-up', 'money-surface-down');
    void surface.offsetWidth;
    surface.classList.add(delta >= 0 ? 'money-surface-up' : 'money-surface-down');
    setTimeout(() => surface.classList.remove('money-surface-up', 'money-surface-down'), 900);
  }
  const frame = now => {
    const p = Math.min(1, (now - started) / duration);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = money(from + delta * eased);
    if (p < 1) requestAnimationFrame(frame);
    else {
      el.textContent = money(to);
      setTimeout(() => el.classList.remove('money-tween-up', 'money-tween-down'), 180);
    }
  };
  requestAnimationFrame(frame);
}

function shouldAutoSync(minAgeMs = 30000) {
  if (!state.meta.setupComplete || nativeState.authPending || bankBusy || !state.bank.handle || !bankApiConfigured()) return false;
  const now = Date.now();
  if (now - bankLastAttempt < 8000) return false;
  const last = state.bank.lastSync ? new Date(state.bank.lastSync).getTime() : 0;
  return !last || now - last >= minAgeMs;
}

function requestAutoSync(minAgeMs = 30000) {
  if (!shouldAutoSync(minAgeMs)) return;
  bankLastAttempt = Date.now();
  syncBank(false);
}

function refreshBankAutoTimer() {
  if (bankAutoTimer) clearInterval(bankAutoTimer);
  bankAutoTimer = null;
  if (state.bank.handle && bankApiConfigured() && !nativeState.authPending) {
    bankAutoTimer = setInterval(() => {
      if (!document.hidden) requestAutoSync(45000);
    }, 60000);
  }
}

function bankCardMarkup() {
  if (!bankApiConfigured()) {
    return `<section class="card bank-card">
      <div class="bank-card-head"><div><div class="label">${b('bankAccounts')}</div><h3>${b('connectBank')}</h3></div><span class="bank-shield">🔒</span></div>
      <p class="small muted">${b('bankConnectText')}</p>
      <div class="bank-privacy"><span>◉</span><span>${b('bankPrivacy')}</span></div>
      <div class="actions"><button class="primary" disabled>${b('connectBank')}</button><button class="secondary" data-add="transaction">${b('manualEntry')}</button></div>
    </section>`;
  }

  if (!state.bank.handle) {
    return `<section class="card bank-card">
      <div class="bank-card-head"><div><div class="label">${b('bankAccounts')}</div><h3>${b('connectBank')}</h3></div><span class="bank-shield">🔒</span></div>
      <p class="small muted">${b('bankConnectText')}</p>
      <div class="bank-privacy"><span>◉</span><span>${b('bankPrivacy')}</span></div>
      <div class="actions"><button class="primary" data-connect-bank>${b('connectBank')}</button><button class="secondary" data-add="transaction">${b('manualEntry')}</button></div>
    </section>`;
  }

  const accounts = state.bank.accounts || [];
  return `<section class="card bank-card ${state.bank.connected ? 'bank-connected' : ''}">
    <div class="bank-card-head"><div><div class="label">${b('bankConnected')}</div><h3 ${accounts.length ? `data-money-key="bank-total" data-money-value="${Number(totalBankBalance())}"` : ''}>${accounts.length ? money(totalBankBalance()) : b('bankPending')}</h3></div><span class="bank-shield">✓</span></div>
    ${accounts.length ? `<div class="bank-accounts">${accounts.map(a => `<div class="bank-account-row"><div class="bank-account-copy"><strong class="bank-account-name">${esc(bankAccountDisplayName(a))}</strong><span class="bank-account-meta">${esc(bankAccountMeta(a))}</span></div><strong class="bank-account-balance" ${a.balance == null ? '' : `data-money-key="bank-account-${esc(a.id)}" data-money-value="${Number(a.balance)}"`}>${a.balance == null ? '—' : money(a.balance)}</strong></div>`).join('')}</div>` : `<p class="small muted">${b('bankPending')}</p>`}
    ${state.bank.syncWarning ? `<div class="bank-connect-error"><strong>${lang()==='et'?'Tehingute sünk vajab tähelepanu':'Transaction sync needs attention'}</strong><span>${esc(state.bank.syncWarning)}</span></div>` : ''}
    <div class="bank-meta"><span>${b('lastSync')}: ${state.bank.lastSync ? new Intl.DateTimeFormat(locale(), {day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}).format(new Date(state.bank.lastSync)) : '—'}</span><span>${b('syncedAutomatically')}</span></div>
    <div class="actions"><button class="primary" data-sync-bank ${bankBusy?'disabled':''}>${bankBusy ? b('bankSyncing') : b('syncNow')}</button><button class="secondary" data-disconnect-bank>${b('disconnectBank')}</button></div>
  </section>`;
}

async function apiJson(path, options = {}) {
  if (!bankApiConfigured()) throw new Error(b('bankUnavailable'));
  const response = await fetch(`${BANK_API_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || b('bankError'));
  return data;
}

async function openBankPicker() {
  if (!bankApiConfigured()) return;
  showModal(`<h2>${b('chooseBank')}</h2><div class="bank-picker-state"><div class="spinner"></div><span>${b('bankLoading')}</span></div><div class="modal-actions"><button type="button" class="ghost" data-close>${t('cancel')}</button></div>`);
  $('[data-close]')?.addEventListener('click', closeModal);
  try {
    const data = await apiJson('/api/banks?country=EE');
    const banks = Array.isArray(data.banks) ? data.banks : [];
    $('#modal').innerHTML = `<h2>${b('chooseBank')}</h2><div class="bank-picker">${banks.length ? banks.map(bank => `<button class="bank-choice" data-bank-id="${esc(bank.id)}"><span class="bank-choice-name">${esc(bank.name)}</span><span>›</span></button>`).join('') : `<div class="empty">${b('noBankAccounts')}</div>`}</div><div class="modal-actions"><button type="button" class="ghost" data-close>${t('cancel')}</button></div>`;
    $('[data-close]')?.addEventListener('click', closeModal);
    $$('[data-bank-id]').forEach(btn => btn.addEventListener('click', () => connectBank(btn.dataset.bankId)));
  } catch (error) {
    $('#modal').innerHTML = `<h2>${b('chooseBank')}</h2><div class="empty">${esc(error.message || b('bankError'))}</div><div class="modal-actions"><button type="button" class="primary" data-close>${t('close')}</button></div>`;
    $('[data-close]')?.addEventListener('click', closeModal);
  }
}

function openExternalUrl(url) {
  const target = String(url || '').trim();
  if (!/^https:\/\//i.test(target)) return false;
  try {
    if (window.NexoraNative && typeof window.NexoraNative.openExternal === 'function') {
      const result = window.NexoraNative.openExternal(target);
      if (result !== false) return true;
    }
  } catch (_) {}
  try {
    window.location.assign(target);
    return true;
  } catch (_) {
    return false;
  }
}

async function connectBank(institutionId) {
  if (bankBusy) return;
  bankBusy = true;

  const selectedButton = document.querySelector(`[data-bank-id="${CSS.escape(String(institutionId))}"]`);
  const originalHtml = selectedButton?.innerHTML || '';
  if (selectedButton) {
    selectedButton.disabled = true;
    selectedButton.innerHTML = `<span class="bank-choice-name">${esc(selectedButton.querySelector('.bank-choice-name')?.textContent || institutionId)}</span><span class="spinner mini"></span>`;
  }

  try {
    const data = await apiJson('/api/connect', {
      method: 'POST',
      body: JSON.stringify({ institution_id: institutionId, install_id: state.bank.installId, language: lang().toUpperCase() })
    });

    const authorizationUrl = String(data.authorization_url || '').trim();
    if (!authorizationUrl) throw new Error('Panga autentimise linki ei saadud. Proovi uuesti.');

    state.bank.handle = data.bank_handle || '';
    state.bank.institutionId = institutionId;
    state.bank.syncStatus = data.requisition_status || '';
    saveState(false);

    if (!openExternalUrl(authorizationUrl)) {
      throw new Error('Panga sisselogimist ei õnnestunud avada. Kontrolli, et telefonis oleks veebibrauser lubatud.');
    }

    closeModal();
  } catch (error) {
    const message = error?.message || b('bankError');
    gateError = message;
    $('#modal').innerHTML = `<h2>${b('chooseBank')}</h2><div class="bank-connect-error"><strong>Ühendamine ebaõnnestus</strong><span>${esc(message)}</span></div><div class="modal-actions"><button type="button" class="secondary" data-bank-retry>Proovi uuesti</button><button type="button" class="ghost" data-close>${t('close')}</button></div>`;
    $('[data-close]')?.addEventListener('click', closeModal);
    $('[data-bank-retry]')?.addEventListener('click', openBankPicker);
  } finally {
    if (selectedButton && document.body.contains(selectedButton)) {
      selectedButton.disabled = false;
      selectedButton.innerHTML = originalHtml;
    }
    bankBusy = false;
  }
}

function mergeBankTransactions(incoming) {
  const byKey = new Map(state.transactions.filter(tx => tx.bankKey).map(tx => [tx.bankKey, tx]));
  const newlyAdded = [];
  for (const raw of incoming || []) {
    if (!raw.bank_key) continue;
    const existing = byKey.get(raw.bank_key);
    const next = {
      id: existing?.id || uid(),
      type: raw.type === 'income' ? 'income' : 'expense',
      amount: Number(raw.amount || 0),
      category: raw.category || existing?.category || 'Other',
      date: raw.date || todayISO(),
      note: raw.merchant || raw.note || existing?.note || '',
      bankKey: raw.bank_key,
      bankAccountId: raw.account_id || '',
      source: 'bank',
      pending: Boolean(raw.pending)
    };
    if (existing) Object.assign(existing, next); else { state.transactions.push(next); newlyAdded.push(next); }
  }
  reconcileProvisionalBankDeltas(newlyAdded);
  return newlyAdded;
}

function reconcileProvisionalBankDeltas(realTransactions) {
  if (!Array.isArray(realTransactions) || !realTransactions.length) return;
  const provisionals = state.transactions.filter(tx => tx.source === 'bank-provisional');
  if (!provisionals.length) return;
  const removeIds = new Set();
  for (const real of realTransactions) {
    const match = provisionals.find(p => {
      if (removeIds.has(p.id) || p.type !== real.type) return false;
      if (Math.abs(Number(p.amount || 0) - Number(real.amount || 0)) > 0.009) return false;
      const pd = new Date(`${p.date}T12:00:00`), rd = new Date(`${real.date}T12:00:00`);
      return Math.abs(pd - rd) <= 2 * 86400000;
    });
    if (match) removeIds.add(match.id);
  }
  if (removeIds.size) state.transactions = state.transactions.filter(tx => !removeIds.has(tx.id));
}

function totalBankBalance(accounts = state.bank.accounts) {
  return (accounts || []).reduce((sum, acc) => sum + (Number.isFinite(Number(acc.balance)) ? Number(acc.balance) : 0), 0);
}

function addProvisionalBalanceDelta(oldTotal, newTotal, newRealTransactions, syncedAt) {
  if (!Number.isFinite(oldTotal) || !Number.isFinite(newTotal)) return;
  const balanceDelta = Math.round((newTotal - oldTotal) * 100) / 100;
  if (Math.abs(balanceDelta) < 0.01) return;

  const realNet = (newRealTransactions || []).reduce((sum, tx) => sum + (tx.type === 'income' ? Number(tx.amount || 0) : -Number(tx.amount || 0)), 0);
  const residual = Math.round((balanceDelta - realNet) * 100) / 100;
  if (Math.abs(residual) < 0.01) return;

  const stamp = String(syncedAt || Date.now()).replace(/[^0-9A-Za-z]/g, '').slice(0, 32);
  const bankKey = `balance-delta:${stamp}:${residual}`;
  if (state.transactions.some(tx => tx.bankKey === bankKey)) return;
  state.transactions.push({
    id: uid(),
    type: residual > 0 ? 'income' : 'expense',
    amount: Math.abs(residual),
    category: residual > 0 ? 'Income' : 'Other',
    date: todayISO(),
    note: lang() === 'et' ? 'Panga saldo muutus · tehingu detail ootel' : 'Bank balance changed · transaction details pending',
    bankKey,
    bankAccountId: '',
    source: 'bank-provisional',
    pending: true
  });
}

function detectSalaryFromBank() {
  if (Number(state.profile.monthlyIncome || 0) > 0) return;
  const salary = state.transactions
    .filter(tx => tx.source === 'bank' && tx.type === 'income' && tx.category === 'Salary')
    .sort((a,b) => String(b.date || '').localeCompare(String(a.date || '')))[0];
  if (salary) state.profile.monthlyIncome = Number(salary.amount || 0);
}

async function syncBank(renderDuring = true) {
  if (!state.bank.handle || bankBusy || !bankApiConfigured()) return;
  bankBusy = true;
  if (renderDuring) render();
  try {
    const data = await apiJson('/api/sync', {
      method: 'POST',
      body: JSON.stringify({ install_id: state.bank.installId, bank_handle: state.bank.handle })
    });
    state.bank.connected = Boolean(data.connected);
    state.bank.syncStatus = data.status || '';
    const previousTotal = state.bank.lastTotalBalance !== null && state.bank.lastTotalBalance !== '' && Number.isFinite(Number(state.bank.lastTotalBalance)) ? Number(state.bank.lastTotalBalance) : (state.bank.lastSync ? totalBankBalance(state.bank.accounts) : NaN);
    const nextAccounts = Array.isArray(data.accounts) ? data.accounts : [];
    state.bank.accounts = nextAccounts;
    state.bank.institutionId = data.institution_id || state.bank.institutionId || '';
    state.bank.lastSync = data.synced_at || state.bank.lastSync || '';
    state.bank.syncWarning = Array.isArray(data.warnings) && data.warnings.length ? String(data.warnings[0]) : '';
    const newRealTransactions = mergeBankTransactions(data.transactions || []);
    const nextTotal = totalBankBalance(nextAccounts);
    addProvisionalBalanceDelta(previousTotal, nextTotal, newRealTransactions, data.synced_at || '');
    state.bank.lastTotalBalance = nextTotal;
    detectSalaryFromBank();
    saveState(false);
    syncNativeNotificationConfig(false);
  } catch (error) {
    state.bank.syncStatus = 'error';
    gateError = error.message || b('bankError');
    saveState(false);
  } finally {
    bankBusy = false;
    render();
  }
}

async function disconnectBank() {
  if (!state.bank.handle) return;
  if (!confirm(b('disconnectConfirm'))) return;
  bankBusy = true;
  try {
    if (bankApiConfigured()) {
      await apiJson('/api/disconnect', {
        method: 'POST',
        body: JSON.stringify({ install_id: state.bank.installId, bank_handle: state.bank.handle })
      });
    }
  } catch {}
  state.bank.handle = '';
  state.bank.connected = false;
  state.bank.institutionId = '';
  state.bank.accounts = [];
  state.bank.lastSync = '';
  state.bank.syncStatus = '';
  state.bank.syncWarning = '';
  bankBusy = false;
  saveState();
}

function homeQuickActions(firstVehicle) {
  const interests = state.settings.interests || [];
  const priority = [];
  if (interests.includes('money')) priority.push('money');
  if (interests.includes('bills')) priority.push('bills');
  if (interests.includes('garage')) priority.push('garage');
  if (interests.includes('personal') || interests.includes('work')) priority.push('task');
  for (const fallback of ['task','money','bills','garage']) if (!priority.includes(fallback)) priority.push(fallback);

  return priority.slice(0,3).map(type => {
    if (type === 'task') return `<button class="quick-action" data-add="task"><span class="quick-action-icon">${icons.plus}</span><span>${t('addTask')}</span></button>`;
    if (type === 'money') return `<button class="quick-action" data-add="transaction"><span class="quick-action-icon">${icons.receipt}</span><span>${f('addIncomeExpense')}</span></button>`;
    if (type === 'bills') return `<button class="quick-action" data-go="bills"><span class="quick-action-icon">${icons.receipt}</span><span>${t('billsTitle')}</span></button>`;
    return `<button class="quick-action" ${firstVehicle ? `data-car-expense="${firstVehicle.id}"` : 'data-add="vehicle"'}><span class="quick-action-icon">${icons.wrench}</span><span>${firstVehicle ? t('carCost') : t('addCar')}</span></button>`;
  }).join('');
}


function notificationText(key) {
  const et = {
    title: 'Teavitused', configure: 'Seadista', status: 'Taustal aktiivne',
    moneyReceived: 'Raha laekumine', moneySpent: 'Raha väljaminek', bills: 'Arvete tähtajad',
    vehicles: 'Auto hooldus ja tähtajad', budget: 'Kululimiidi hoiatused', privacy: 'Lukuekraani privaatsus',
    full: 'Näita summat ja detaile', hideAmount: 'Peida summa', generic: 'Ainult üldine teavitus',
    hint: 'Nexora annab märku raha liikumisest ning lähenevatest arvetest ja auto tähtaegadest.',
    save: 'Salvesta', permission: 'Luba teavitused', background: 'Pangasünki kontrollitakse taustal automaatselt.', test: 'Saada testteavitus', testSent: 'Testteavitus saadetud', testError: 'Testteavitust ei saanud saata'
  };
  const en = {
    title: 'Notifications', configure: 'Configure', status: 'Background active',
    moneyReceived: 'Money received', moneySpent: 'Money spent', bills: 'Bill due dates',
    vehicles: 'Vehicle service and deadlines', budget: 'Spending limit warnings', privacy: 'Lock screen privacy',
    full: 'Show amount and details', hideAmount: 'Hide amount', generic: 'Generic notification only',
    hint: 'Nexora can alert you about bank activity, upcoming bills and vehicle deadlines.',
    save: 'Save', permission: 'Allow notifications', background: 'Bank activity is checked automatically in the background.', test: 'Send test notification', testSent: 'Test notification sent', testError: 'Could not send test notification'
  };
  return (lang() === 'et' ? et : en)[key] || key;
}

function openNotificationSettings() {
  const n = state.settings.notifications || cleanDefaults.settings.notifications;
  showModal(modalForm(notificationText('title'), `
    <div class="card soft" style="padding:14px"><div class="small muted">${notificationText('hint')}</div></div>
    <label class="toggle-row"><div><div class="row-title">${notificationText('moneyReceived')}</div></div><input type="checkbox" name="moneyReceived" ${n.moneyReceived!==false?'checked':''}></label>
    <label class="toggle-row"><div><div class="row-title">${notificationText('moneySpent')}</div></div><input type="checkbox" name="moneySpent" ${n.moneySpent!==false?'checked':''}></label>
    <label class="toggle-row"><div><div class="row-title">${notificationText('bills')}</div></div><input type="checkbox" name="bills" ${n.bills!==false?'checked':''}></label>
    <label class="toggle-row"><div><div class="row-title">${notificationText('vehicles')}</div></div><input type="checkbox" name="vehicles" ${n.vehicles!==false?'checked':''}></label>
    <label class="toggle-row"><div><div class="row-title">${notificationText('budget')}</div></div><input type="checkbox" name="budget" ${n.budget!==false?'checked':''}></label>
    <div class="field"><label>${notificationText('privacy')}</label><select name="privacy">
      <option value="full" ${n.privacy==='full'?'selected':''}>${notificationText('full')}</option>
      <option value="hideAmount" ${n.privacy==='hideAmount'?'selected':''}>${notificationText('hideAmount')}</option>
      <option value="generic" ${n.privacy==='generic'?'selected':''}>${notificationText('generic')}</option>
    </select></div>
    <div class="small muted">${notificationText('background')}</div>
    <button type="button" class="secondary" data-test-push>${notificationText('test')}</button>
  `, notificationText('save')));
  $('[data-test-push]')?.addEventListener('click', async () => {
    const btn = $('[data-test-push]');
    if (btn) btn.disabled = true;
    try {
      await apiJson('/api/push/test', { method: 'POST', body: JSON.stringify({ install_id: state.bank.installId }) });
      alert(notificationText('testSent'));
    } catch (error) {
      alert(`${notificationText('testError')}: ${error.message || 'Unknown error'}`);
    } finally {
      if (btn) btn.disabled = false;
    }
  });
  $('#modalForm').onsubmit = e => {
    e.preventDefault();
    const f = new FormData(e.target);
    state.settings.notifications = {
      moneyReceived: f.get('moneyReceived') === 'on',
      moneySpent: f.get('moneySpent') === 'on',
      bills: f.get('bills') === 'on',
      vehicles: f.get('vehicles') === 'on',
      budget: f.get('budget') === 'on',
      privacy: String(f.get('privacy') || 'hideAmount')
    };
    closeModal();
    saveState();
    syncNativeNotificationConfig(true);
  };
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
            <div class="actions" style="margin-top:18px"><button class="primary" data-add="task">${t('addTask')}</button><button class="secondary" data-add="transaction">${f('addIncomeExpense')}</button></div>
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
        <section class="card kpi good-card"><div class="label">${f('totalIncome')}</div><div class="value money-pos" data-money-key="home-income" data-money-value="${Number(incomeThisMonth())}">${money(incomeThisMonth())}</div><div class="delta muted">${t('thisMonth')}</div></section>
        <section class="card kpi"><div class="label">${f('totalExpenses')}</div><div class="value money-neg" data-money-key="home-spend" data-money-value="${Number(spentThisMonth())}">${money(spentThisMonth())}</div><div class="delta muted">${t('thisMonth')}</div></section>
        <section class="card kpi accent-card"><div class="label">${f('freeMoney')}</div><div class="value ${incomeThisMonth()-spentThisMonth()>=0?'money-pos':'money-neg'}" data-money-key="home-free" data-money-value="${Number(incomeThisMonth()-spentThisMonth())}">${money(incomeThisMonth()-spentThisMonth())}</div><div class="delta muted">${t('thisMonth')}</div></section>
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
    const f = financeStatus();
    const cats = categoryTotals();
    const recent = state.transactions.slice().sort((a, b) => String(b.date || '').localeCompare(String(a.date || ''))).slice(0, 8);
    const limitPct = f.limit ? Math.min(100, (f.spend / f.limit) * 100) : 0;
    const statusBad = f.cashLeft < 0 || (f.limit && f.limitLeft < 0);
    const next = nextBillDue();

    return `<div class="stack">
      ${bankCardMarkup()}
      <section class="card finance-hero ${statusBad ? 'finance-danger' : ''}">
        <div class="hero-kicker">${t('monthlyStatus')}</div>
        <div class="finance-balance-label">${t('availableMoney')}</div>
        <div class="finance-balance ${f.cashLeft < 0 ? 'money-neg' : 'money-pos'}" data-money-key="money-cash-left" data-money-value="${Number(f.cashLeft)}">${money(f.cashLeft)}</div>
        <div class="finance-status-line"><span class="dot ${statusBad ? 'bad' : 'good'}"></span><span>${statusBad ? t('needsAttention') : t('onTrack')}</span></div>
        <div class="finance-flow">
          <div><span>${t('actualIncome')}</span><strong class="money-pos" data-money-key="money-income" data-money-value="${Number(f.inc)}">${money(f.inc)}</strong></div>
          <div><span>${t('actualExpenses')}</span><strong data-money-key="money-spend" data-money-value="${Number(f.spend)}">${money(f.spend)}</strong></div>
        </div>
      </section>

      <section class="card">
        <div class="section-title"><h3>${t('plannedVsActual')}</h3><button class="ghost" data-edit-profile>${t('edit')}</button></div>
        <div class="finance-plan-grid">
          <div class="plan-cell"><span>${t('expectedIncome')}</span><strong data-money-key="plan-income" data-money-value="${Number(f.expectedIncome)}">${money(f.expectedIncome)}</strong></div>
          <div class="plan-cell"><span>${t('budget')}</span><strong data-money-key="plan-limit" data-money-value="${Number(f.limit)}">${money(f.limit)}</strong></div>
          <div class="plan-cell"><span>${t('committedBills')}</span><strong data-money-key="plan-bills" data-money-value="${Number(monthlyBillsTotal())}">${money(monthlyBillsTotal())}</strong></div>
          <div class="plan-cell"><span>${t('limitRemaining')}</span><strong class="${f.limitLeft !== null && f.limitLeft < 0 ? 'money-neg' : ''}" ${f.limitLeft === null ? '' : `data-money-key="plan-limit-left" data-money-value="${Number(f.limitLeft)}"`}>${f.limitLeft === null ? '—' : money(f.limitLeft)}</strong></div>
        </div>
        ${f.limit ? `<div class="progress" style="margin-top:15px"><span style="width:${limitPct}%"></span></div>` : `<div class="small muted" style="margin-top:14px">${t('spendingLimitHelp')}</div>`}
      </section>

      <section class="money-shortcuts">
        <button class="shortcut-card" data-add="transaction"><span class="shortcut-icon">${icons.receipt}</span><span><b>${t('addExpense')}</b><small>${t('actualIncome')} / ${t('actualExpenses')}</small></span></button>
        <button class="shortcut-card" data-go="bills"><span class="shortcut-icon">${icons.receipt}</span><span><b>${t('billsTitle')}</b><small>${money(unpaidBillsThisMonth())} ${t('unpaidThisMonth').toLowerCase()}</small></span></button>
      </section>

      <section class="card">
        <div class="section-title"><h3>${t('topCategories')}</h3><span class="pill">${cats.length}</span></div>
        ${cats.length ? `<div class="category-list">${cats.map(([name, total]) => {
          const pct = f.spend ? (total / f.spend) * 100 : 0;
          return `<div class="category-line"><div class="category-head"><span>${categoryLabel(name)}</span><strong>${money(total)}</strong></div><div class="category-track"><span style="width:${pct}%"></span></div></div>`;
        }).join('')}</div>` : `<div class="empty">${t('noTransactions')}</div>`}
      </section>

      ${next ? `<section class="card soft"><div class="section-title"><h3>${t('nextBill')}</h3><button class="ghost" data-go="bills">${t('seeAll')}</button></div><div class="bill-mini"><div><b>${esc(next.name)}</b><span>${t('dueOn')} ${Number(next.dueDay || 1)}.</span></div><strong>${money(next.amount)}</strong></div></section>` : ''}

      <div class="section-title"><h3>${t('recentTransactions')}</h3></div>
      <section class="card"><div class="list">${recent.length ? recent.map(txRow).join('') : `<div class="empty">${t('noTransactions')}</div>`}</div></section>
      <button class="fab" data-add="transaction" aria-label="${t('addExpense')}">+</button>
    </div>`;
  },

  bills() {
    const total = monthlyBillsTotal();
    const paid = paidBillsThisMonth();
    const unpaid = unpaidBillsThisMonth();
    const next = nextBillDue();
    const bills = state.bills.slice().sort((a,b)=>Number(a.dueDay||31)-Number(b.dueDay||31));
    return `<div class="stack">
      <section class="card hero bills-hero">
        <div class="hero-kicker">${t('billsTitle')}</div>
        <h2>${money(total)}</h2>
        <div class="hero-caption">${t('billsSubtitle')}</div>
        <div class="bill-summary-grid">
          <div><span>${t('paidThisMonth')}</span><strong class="money-pos">${money(paid)}</strong></div>
          <div><span>${t('unpaidThisMonth')}</span><strong>${money(unpaid)}</strong></div>
        </div>
      </section>
      ${next ? `<section class="card soft next-bill-card"><span class="pill">${t('nextBill')}</span><div class="bill-next-row"><div><b>${esc(next.name)}</b><span>${t('dueOn')} ${Number(next.dueDay || 1)}.</span></div><strong>${money(next.amount)}</strong></div></section>` : ''}
      <div class="section-title"><h3>${t('recurringBills')}</h3><button class="secondary compact-add" data-add="bill">${t('addBill')}</button></div>
      ${bills.length ? bills.map(billCard).join('') : `<section class="card"><div class="empty"><div class="empty-icon">🧾</div><b>${t('noBills')}</b><div class="small muted" style="margin-top:8px">${t('noBillsHelp')}</div><div class="actions" style="margin-top:16px"><button class="primary" data-add="bill">${t('addBill')}</button></div></div></section>`}
      <button class="fab" data-add="bill" aria-label="${t('addBill')}">+</button>
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
    const biometricOn = Boolean(nativeState.biometricAvailable);
    const requireAuth = true;
    const stats = allTimeStats();
    const savedTheme = localStorage.getItem('nexora-theme') || 'system';
    const themeLabel = savedTheme === 'dark' ? o('darkTheme') : savedTheme === 'light' ? o('lightTheme') : o('systemTheme');
    return `<div class="stack">
      <section class="card brand-card">
        <img class="brand-wordmark dark-logo" src="nexora-wordmark-dark.png" alt="Nexora" />
        <img class="brand-wordmark light-logo" src="nexora-wordmark-light.png" alt="Nexora" />
        <div class="brand-version">Nexora · 1.8.2</div>
      </section>
      <section class="card">
        <div class="section-title"><h3>${t('statistics')}</h3></div>
        <div class="stats-grid" style="margin-top:12px">
          <div class="stats-cell"><span>${t('totalEarned')}</span><strong class="money-pos">${money(stats.income)}</strong></div>
          <div class="stats-cell"><span>${t('totalSpent')}</span><strong>${money(stats.spent)}</strong></div>
          <div class="stats-cell"><span>${t('totalBillsSpent')}</span><strong>${money(stats.bills)}</strong></div>
          <div class="stats-cell"><span>${t('totalCarSpent')}</span><strong>${money(stats.car)}</strong></div>
        </div>
        <div class="statline stats-total"><span>${t('netAllTime')}</span><strong class="${stats.net < 0 ? 'money-neg' : 'money-pos'}">${money(stats.net)}</strong></div>
        <div class="statline"><span>${t('transactionsCount')}</span><strong>${stats.count}</strong></div>
      </section>
      <section class="card">
        <div class="section-title"><h3>${t('personalInfo')}</h3><button class="ghost" data-edit-profile>${t('edit')}</button></div>
        <div class="statline"><span>${t('name')}</span><strong>${esc(p.name || '—')}</strong></div>
        <div class="statline"><span>${t('expectedIncome')}</span><strong>${money(p.monthlyIncome)}</strong></div>
        <div class="statline"><span>${t('monthlyBudget')}</span><strong>${money(p.monthlyBudget)}</strong></div>
        <div class="statline"><span>${t('savingsGoal')}</span><strong>${money(p.savingsGoal)}</strong></div>
        <div class="statline"><span>${t('savedCurrently')}</span><strong>${money(p.savingsCurrent)}</strong></div>
      </section>
      <section class="card">
        <div class="section-title"><h3>${t('appSettings')}</h3><button class="ghost" data-open-settings>${t('configure')}</button></div>
        <div class="statline"><span>${t('language')}</span><strong>${currentLangLabel}</strong></div>
        <div class="statline"><span>${t('themeLabel')}</span><strong>${themeLabel}</strong></div>
      </section>
      <section class="card">
        <div class="section-title"><h3>${notificationText('title')}</h3><button class="ghost" data-open-notifications>${notificationText('configure')}</button></div>
        <div class="statline"><span>${notificationText('moneyReceived')} / ${notificationText('moneySpent')}</span><strong>${(state.settings.notifications?.moneyReceived!==false || state.settings.notifications?.moneySpent!==false) ? 'ON' : 'OFF'}</strong></div>
        <div class="statline"><span>${notificationText('bills')} / ${notificationText('vehicles')}</span><strong>${(state.settings.notifications?.bills!==false || state.settings.notifications?.vehicles!==false) ? 'ON' : 'OFF'}</strong></div>
      </section>
      <section class="card">
        <div class="section-title"><h3>${o('security')}</h3><span class="pill good">${o('alwaysOn')}</span></div>
        <div class="toggle-row"><div><div class="row-title">${o('requireAuth')}</div><div class="row-sub">${o('requireAuthHint')}</div></div><span class="security-status">🔒</span></div>
        <div class="toggle-row"><div><div class="row-title">${o('biometric')}</div><div class="row-sub">${o('biometricHint')}</div></div><span class="pill ${biometricOn?'good':''}">${biometricOn?o('on'):o('off')}</span></div>
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
  return `<div class="row transaction-row">
      <span class="dot ${item.type === 'income' ? 'good' : 'bad'}"></span>
      <div class="row-main">
        <div class="row-title">${esc(item.note || categoryLabel(item.category || 'Other'))}</div>
        <div class="row-sub">${esc(categoryLabel(item.category || 'Other'))} · ${fmtDate(item.date)}</div>
      </div>
      <strong class="transaction-amount ${item.type === 'income' ? 'money-pos' : 'money-neg'}">${item.type === 'income' ? '+' : '−'}${money(item.amount)}</strong>
      <button class="delete-btn transaction-delete" data-delete-tx="${item.id}" aria-label="delete">×</button>
    </div>`;
}

function billCard(bill) {
  const payment = billPaymentForMonth(bill);
  const dueDay = Math.max(1, Math.min(31, Number(bill.dueDay || 1)));
  return `<section class="card bill-card ${payment ? 'bill-paid' : ''}">
    <div class="bill-card-top">
      <div class="bill-icon">${icons.receipt}</div>
      <div class="row-main"><div class="row-title">${esc(bill.name)}</div><div class="row-sub">${esc(categoryLabel(bill.category || 'Bills'))} · ${t('dueOn')} ${dueDay}.</div></div>
      <strong>${money(bill.amount)}</strong>
    </div>
    <div class="bill-actions">
      <button class="${payment ? 'secondary' : 'primary'}" data-toggle-bill-paid="${bill.id}">${payment ? t('undoPaid') : t('markPaid')}</button>
      <button class="ghost" data-edit-bill="${bill.id}">${t('edit')}</button>
      <button class="delete-btn" data-delete-bill="${bill.id}" aria-label="delete">×</button>
    </div>
  </section>`;
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
  $$('[data-toggle-bill-paid]').forEach(btn => btn.onclick = () => toggleBillPaid(btn.dataset.toggleBillPaid));
  $$('[data-edit-bill]').forEach(btn => btn.onclick = () => openBill(btn.dataset.editBill));
  $$('[data-delete-bill]').forEach(btn => btn.onclick = () => {
    const id = btn.dataset.deleteBill;
    state.bills = state.bills.filter(x => x.id !== id);
    state.transactions = state.transactions.filter(x => x.billId !== id);
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
  $('[data-open-notifications]')?.addEventListener('click', openNotificationSettings);
  $('[data-export]')?.addEventListener('click', exportData);
  $('[data-reset]')?.addEventListener('click', resetData);
  $('[data-connect-bank]')?.addEventListener('click', openBankPicker);
  $('[data-sync-bank]')?.addEventListener('click', () => syncBank(true));
  $('[data-disconnect-bank]')?.addEventListener('click', disconnectBank);
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

function transactionCategoryOptions(type = 'expense', selected = '') {
  const expense = ['Food','Fuel','Maintenance','Car','Insurance','Shopping','Bills','Other'];
  const income = ['Salary','Bonus','OtherIncome','Income'];
  return (type === 'income' ? income : expense).map(key => `<option value="${key}" ${selected===key?'selected':''}>${esc(categoryLabel(key))}</option>`).join('');
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
      <div class="grid-2"><div class="field"><label>${t('type')}</label><select name="type" id="txType"><option value="expense">${t('expense')}</option><option value="income">${t('incomeType')}</option></select></div><div class="field"><label>${t('amount')}</label><input name="amount" type="number" min="0" step="0.01" required placeholder="0.00"></div></div>
      <div class="field"><label>${t('category')}</label><select name="category" id="txCategory">${transactionCategoryOptions('expense')}</select></div>
      <div class="field"><label>${t('date')}</label><input name="date" type="date" value="${todayISO()}" required></div>
      <div class="field"><label>${t('note')}</label><input name="note" placeholder="${t('optionalNote')}"></div>
    `));
    $('#txType').addEventListener('change', e => { $('#txCategory').innerHTML = transactionCategoryOptions(e.target.value); });
    $('#modalForm').onsubmit = e => {
      e.preventDefault();
      const f = new FormData(e.target);
      state.transactions.push({ id: uid(), type: f.get('type'), amount: Number(f.get('amount')), category: f.get('category'), date: f.get('date'), note: f.get('note') });
      state.meta.firstOpen = false;
      closeModal();
      saveState();
    };
  }

  if (type === 'bill') {
    openBill();
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

function openBill(id = '') {
  const existing = id ? state.bills.find(x => x.id === id) : null;
  const title = existing ? `${t('edit')} · ${existing.name}` : t('addBill');
  showModal(modalForm(title, `
    <div class="field"><label>${t('billName')}</label><input name="name" required value="${esc(existing?.name || '')}" placeholder="Telia, rent, electricity..."></div>
    <div class="grid-2"><div class="field"><label>${t('billAmount')}</label><input name="amount" type="number" min="0" step="0.01" required value="${existing?.amount || ''}" placeholder="0.00"></div><div class="field"><label>${t('dueDay')}</label><input name="dueDay" type="number" min="1" max="31" required value="${existing?.dueDay || ''}" placeholder="15"></div></div>
    <div class="field"><label>${t('billCategory')}</label><select name="category">
      ${['Rent','Utilities','PhoneInternet','Subscription','Loan','Insurance','Bills','Other'].map(key => `<option value="${key}" ${existing?.category===key?'selected':''}>${esc(categoryLabel(key))}</option>`).join('')}
    </select></div>
  `, t('save')));
  $('#modalForm').onsubmit = e => {
    e.preventDefault();
    const f = new FormData(e.target);
    const value = {
      id: existing?.id || uid(),
      name: String(f.get('name') || '').trim(),
      amount: Number(f.get('amount') || 0),
      dueDay: Math.max(1, Math.min(31, Number(f.get('dueDay') || 1))),
      category: String(f.get('category') || 'Bills'),
      active: true
    };
    if (existing) Object.assign(existing, value); else state.bills.push(value);
    state.meta.firstOpen = false;
    closeModal();
    saveState();
  };
}

function toggleBillPaid(id) {
  const bill = state.bills.find(x => x.id === id);
  if (!bill) return;
  const payment = billPaymentForMonth(bill);
  if (payment) {
    state.transactions = state.transactions.filter(tx => tx.id !== payment.id);
  } else {
    const d = new Date();
    const day = Math.min(d.getDate(), new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate());
    const date = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    state.transactions.push({
      id: uid(), type: 'expense', amount: Number(bill.amount || 0), category: 'Bills', date,
      note: bill.name, billId: bill.id, billMonth: currentMonthKey(), billCategory: bill.category || 'Bills'
    });
  }
  state.meta.firstOpen = false;
  saveState();
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
    <div class="grid-2"><div class="field"><label>${o('monthlyIncome')}</label><input name="monthlyIncome" type="number" min="0" step="0.01" value="${p.monthlyIncome || 0}"></div><div class="field"><label>${t('monthlyBudget')}</label><input name="monthlyBudget" type="number" min="0" step="0.01" value="${p.monthlyBudget || 0}"></div></div>
    <div class="grid-2"><div class="field"><label>${t('savingsGoal')}</label><input name="savingsGoal" type="number" min="0" step="0.01" value="${p.savingsGoal || 0}"></div><div class="field"><label>${t('savedCurrently')}</label><input name="savingsCurrent" type="number" min="0" step="0.01" value="${p.savingsCurrent || 0}"></div></div>
  `, t('save')));
  $('#modalForm').onsubmit = e => {
    e.preventDefault();
    const f = new FormData(e.target);
    state.profile = {
      ...state.profile,
      name: String(f.get('name') || '').trim(),
      monthlyIncome: Number(f.get('monthlyIncome') || 0),
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
    closeModal();
    saveState();
  };
}

init();
