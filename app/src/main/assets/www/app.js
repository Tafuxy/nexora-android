const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];
const money = n => new Intl.NumberFormat('et-EE',{style:'currency',currency:'EUR',maximumFractionDigits:2}).format(Number(n||0));
const fmtDate = d => new Intl.DateTimeFormat('en-GB',{day:'2-digit',month:'short'}).format(new Date(d));
const uid = () => crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`;
const todayISO = () => new Date().toISOString().slice(0,10);

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
  check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="m5 12 4 4L19 6"/></svg>'
};

const defaults = {
  profile:{name:'You', monthlyBudget:1800, savingsGoal:10000, savingsCurrent:2500},
  tasks:[
    {id:uid(),title:'Review today’s priorities',date:todayISO(),time:'09:00',done:false,category:'Personal'},
    {id:uid(),title:'Check upcoming car costs',date:todayISO(),time:'18:00',done:false,category:'Garage'}
  ],
  transactions:[
    {id:uid(),type:'expense',amount:68.20,category:'Fuel',date:todayISO(),note:'Fuel'},
    {id:uid(),type:'expense',amount:17.90,category:'Food',date:todayISO(),note:'Lunch'},
    {id:uid(),type:'income',amount:1200,category:'Income',date:todayISO(),note:'Income'}
  ],
  vehicles:[
    {id:uid(),name:'My car',plate:'',odometer:120000,nextServiceKm:125000,insuranceDate:'',inspectionDate:'',fuelLitres:0,expenses:0}
  ]
};
let state = load(); let currentView='home';
function load(){try{return {...structuredClone(defaults),...JSON.parse(localStorage.getItem('nexora-state')||'{}')}}catch{return structuredClone(defaults)}}
function save(){localStorage.setItem('nexora-state',JSON.stringify(state));render()}
function esc(s=''){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}

function init(){
  $$('.nav-icon').forEach(el=>el.innerHTML=icons[el.dataset.icon]);
  $('#themeBtn').addEventListener('click',()=>{document.documentElement.classList.toggle('light');localStorage.setItem('nexora-theme',document.documentElement.classList.contains('light')?'light':'dark');setThemeIcon()});
  if(localStorage.getItem('nexora-theme')==='light') document.documentElement.classList.add('light'); setThemeIcon();
  $$('.nav-item').forEach(b=>b.addEventListener('click',()=>{currentView=b.dataset.view; $$('.nav-item').forEach(x=>x.classList.toggle('active',x===b)); render()}));
  $('#modalBackdrop').addEventListener('click',e=>{if(e.target.id==='modalBackdrop')closeModal()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()});
  const d=new Date(); $('#todayLabel').textContent=new Intl.DateTimeFormat('en-GB',{weekday:'long',day:'numeric',month:'long'}).format(d);
  if(location.protocol.startsWith('http') && 'serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(()=>{});
  render();
}
function setThemeIcon(){ $('#themeBtn').innerHTML=document.documentElement.classList.contains('light')?icons.moon:icons.sun }
function render(){ const titles={home:'Home',planner:'Planner',money:'Money',garage:'Garage',profile:'Profile'}; $('#pageTitle').textContent=titles[currentView]; $('#app').innerHTML=views[currentView](); bindView() }

function monthTransactions(){const ym=todayISO().slice(0,7);return state.transactions.filter(t=>t.date?.startsWith(ym))}
function spentThisMonth(){return monthTransactions().filter(t=>t.type==='expense').reduce((a,t)=>a+Number(t.amount),0)}
function incomeThisMonth(){return monthTransactions().filter(t=>t.type==='income').reduce((a,t)=>a+Number(t.amount),0)}
function upcomingTasks(){return state.tasks.filter(t=>!t.done).sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time)).slice(0,4)}
function garageSpend(){return monthTransactions().filter(t=>['Fuel','Maintenance','Car','Insurance'].includes(t.category)).reduce((a,t)=>a+Number(t.amount),0)}

const views={
 home(){
  const spend=spentThisMonth(), budget=Number(state.profile.monthlyBudget||0), left=budget-spend, pct=budget?Math.min(100,spend/budget*100):0;
  const tasks=upcomingTasks(); const savingsPct=state.profile.savingsGoal?Math.min(100,state.profile.savingsCurrent/state.profile.savingsGoal*100):0;
  const firstVehicle=state.vehicles[0];
  return `<div class="stack">
    <section class="card hero"><div class="hero-kicker">Good ${greeting()}, ${esc(state.profile.name||'there')}</div><h2 class="${left<0?'money-neg':''}">${money(left)}</h2><div class="hero-caption">${left>=0?'available in your monthly budget':'over your monthly budget'}</div><div class="progress" style="margin-top:17px"><span style="width:${pct}%"></span></div><div class="hero-footer"><div class="tiny muted">${money(spend)} spent<br>of ${money(budget)}</div><div class="tiny right muted">${Math.round(Math.min(100,pct))}% used</div></div></section>
    <section class="quick-actions" aria-label="Quick actions"><button class="quick-action" data-add="task"><span class="quick-action-icon">${icons.plus}</span><span>New task</span></button><button class="quick-action" data-add="transaction"><span class="quick-action-icon">${icons.receipt}</span><span>Add expense</span></button><button class="quick-action" ${firstVehicle?`data-car-expense="${firstVehicle.id}"`:'data-add="vehicle"'}><span class="quick-action-icon">${icons.wrench}</span><span>${firstVehicle?'Car cost':'Add car'}</span></button></section>
    <div class="grid-3"><section class="card kpi good-card"><div class="label">Income</div><div class="value money-pos">${money(incomeThisMonth())}</div><div class="delta muted">this month</div></section><section class="card kpi"><div class="label">Garage</div><div class="value">${money(garageSpend())}</div><div class="delta muted">car costs</div></section><section class="card kpi accent-card"><div class="label">Savings</div><div class="value">${Math.round(savingsPct)}%</div><div class="delta muted">${money(state.profile.savingsCurrent)}</div></section></div>
    <div class="section-title"><h3>Up next</h3><button class="ghost" data-go="planner">See all</button></div>
    <section class="card"><div class="list">${tasks.length?tasks.map(taskRow).join(''):'<div class="empty">Nothing urgent. Your day is clear.</div>'}</div></section>
    <div class="section-title"><h3>Smart insights</h3></div>
    <section class="card stack">${insights().map(x=>`<div class="insight"><b>${esc(x.title)}</b><span class="small muted">${esc(x.text)}</span></div>`).join('')}</section>
  </div>`
 },
 planner(){
  const open=state.tasks.filter(t=>!t.done).length;
  return `<div class="stack">${calendarStrip()}<div class="section-title"><h3>Your tasks</h3><span class="pill">${open} open</span></div><section class="card"><div class="list">${state.tasks.length?state.tasks.slice().sort((a,b)=>(a.date+(a.time||'')).localeCompare(b.date+(b.time||''))).map(taskRow).join(''):'<div class="empty"><div class="empty-icon">✓</div>No tasks yet.</div>'}</div></section><button class="fab" data-add="task" aria-label="Add task">+</button></div>`
 },
 money(){
  const spend=spentThisMonth(), inc=incomeThisMonth(), net=inc-spend, budget=Number(state.profile.monthlyBudget||0); const cats=categoryTotals();
  return `<div class="stack"><section class="card hero"><div class="hero-kicker">Monthly cashflow</div><h2 class="${net>=0?'money-pos':'money-neg'}">${money(net)}</h2><div class="hero-caption">${money(inc)} in · ${money(spend)} out</div><div class="progress" style="margin-top:17px"><span style="width:${budget?Math.min(100,spend/budget*100):0}%"></span></div><div class="hero-footer"><div class="tiny muted">Budget<br>${money(budget)}</div><div class="tiny right muted">Remaining<br>${money(budget-spend)}</div></div></section>
  <div class="grid-2"><section class="card kpi"><div class="label">Spent</div><div class="value money-neg">${money(spend)}</div><div class="delta muted">this month</div></section><section class="card kpi good-card"><div class="label">Income</div><div class="value money-pos">${money(inc)}</div><div class="delta muted">this month</div></section></div>
  <section class="card"><div class="section-title"><h3>Top categories</h3><span class="pill">${cats.length}</span></div><div class="category-list">${cats.length?cats.map(([c,v])=>`<div class="category-line"><div class="category-head"><span>${esc(c)}</span><strong>${money(v)}</strong></div><div class="category-track"><span style="width:${Math.max(4,Math.round(v/(spend||1)*100))}%"></span></div></div>`).join(''):'<div class="empty">No expense data yet.</div>'}</div></section>
  <div class="section-title"><h3>Recent transactions</h3></div><section class="card"><div class="list">${state.transactions.slice().sort((a,b)=>b.date.localeCompare(a.date)).slice(0,8).map(txRow).join('')||'<div class="empty">No transactions yet.</div>'}</div></section><button class="fab" data-add="transaction" aria-label="Add transaction">+</button></div>`
 },
 garage(){
  const due=state.vehicles.filter(v=>Number(v.nextServiceKm||0)>0 && Number(v.nextServiceKm)<=Number(v.odometer||0)).length;
  return `<div class="stack"><section class="card hero"><div class="hero-kicker">Garage overview</div><h2>${money(garageSpend())}</h2><div class="hero-caption">spent on your vehicles this month</div><div class="hero-footer"><div class="tiny muted">Vehicles<br>${state.vehicles.length}</div><div class="tiny right ${due?'bad':'muted'}">Service due<br>${due}</div></div></section><div class="section-title"><h3>Your vehicles</h3><button class="secondary compact-add" data-add="vehicle">+ Add vehicle</button></div>${state.vehicles.length?state.vehicles.map(vehicleCard).join(''):'<section class="card empty">No vehicles yet. Add your first car.</section>'}</div>`
 },
 profile(){
  return `<div class="stack"><section class="card profile-hero"><div class="avatar">${esc((state.profile.name||'Y').slice(0,1).toUpperCase())}</div><div class="row-main"><div class="vehicle-name">${esc(state.profile.name||'You')}</div><div class="muted small">Your Nexora workspace</div></div></section><section class="card stack"><div class="section-title"><h3>Personal targets</h3></div><div class="statline"><span class="muted">Monthly budget</span><strong>${money(state.profile.monthlyBudget)}</strong></div><div class="statline"><span class="muted">Savings goal</span><strong>${money(state.profile.savingsGoal)}</strong></div><div class="statline"><span class="muted">Saved</span><strong>${money(state.profile.savingsCurrent)}</strong></div><div class="progress"><span style="width:${state.profile.savingsGoal?Math.min(100,state.profile.savingsCurrent/state.profile.savingsGoal*100):0}%"></span></div><div class="actions"><button class="primary" data-edit-profile>Edit profile</button><button class="secondary" data-export>Export data</button></div></section><section class="card soft"><b>Privacy</b><p class="small muted">Your data currently stays on this device. Secure account sync is planned for the backend phase.</p></section><button class="danger" data-reset>Reset demo data</button></div>`
 }
};

function greeting(){const h=new Date().getHours();return h<12?'morning':h<18?'afternoon':'evening'}
function calendarStrip(){const now=new Date();let html='<section class="calendar-strip">';for(let i=0;i<7;i++){const d=new Date(now);d.setDate(now.getDate()+i);html+=`<div class="day ${i===0?'active':''}">${new Intl.DateTimeFormat('en',{weekday:'short'}).format(d)}<strong>${d.getDate()}</strong></div>`}return html+'</section>'}
function taskRow(t){return `<div class="row" data-task="${t.id}"><button class="task-check ${t.done?'checked':''}" data-toggle-task="${t.id}" aria-label="${t.done?'Mark incomplete':'Mark complete'}">${t.done?icons.check:''}</button><div class="row-main"><div class="row-title" style="${t.done?'text-decoration:line-through;opacity:.48':''}">${esc(t.title)}</div><div class="row-sub">${esc(t.date===todayISO()?'Today':fmtDate(t.date))}${t.time?' · '+esc(t.time):''} · ${esc(t.category||'General')}</div></div><button class="delete-btn" data-delete-task="${t.id}" aria-label="Delete task">×</button></div>`}
function txRow(t){return `<div class="row"><span class="dot ${t.type==='income'?'good':'bad'}"></span><div class="row-main"><div class="row-title">${esc(t.note||t.category)}</div><div class="row-sub">${esc(t.category)} · ${fmtDate(t.date)}</div></div><strong class="${t.type==='income'?'money-pos':'money-neg'}">${t.type==='income'?'+':'−'}${money(t.amount)}</strong><button class="delete-btn" data-delete-tx="${t.id}" aria-label="Delete transaction">×</button></div>`}
function vehicleCard(v){const serviceLeft=Number(v.nextServiceKm||0)-Number(v.odometer||0);const serviceClass=!v.nextServiceKm?'':serviceLeft<=0?'bad':serviceLeft<=1500?'warn':'good';return `<section class="card vehicle"><div class="vehicle-top"><div class="vehicle-ident"><div class="vehicle-icon">${icons.car}</div><div class="row-main"><div class="vehicle-name">${esc(v.name)}</div><div class="muted small">${esc(v.plate||'No plate')} · ${Number(v.odometer||0).toLocaleString('et-EE')} km</div></div></div><button class="delete-btn" data-delete-vehicle="${v.id}" aria-label="Delete vehicle">×</button></div><div class="vehicle-meta"><span class="tag ${serviceClass}">Service ${!v.nextServiceKm?'not set':serviceLeft>0?serviceLeft.toLocaleString('et-EE')+' km':'due now'}</span>${v.inspectionDate?`<span class="tag">Inspection ${fmtDate(v.inspectionDate)}</span>`:''}${v.insuranceDate?`<span class="tag">Insurance ${fmtDate(v.insuranceDate)}</span>`:''}</div><div class="actions"><button class="primary" data-car-expense="${v.id}">Add cost</button><button class="secondary" data-edit-vehicle="${v.id}">Update km</button></div></section>`}
function categoryTotals(){const m={};monthTransactions().filter(t=>t.type==='expense').forEach(t=>m[t.category]=(m[t.category]||0)+Number(t.amount));return Object.entries(m).sort((a,b)=>b[1]-a[1]).slice(0,5)}
function insights(){const spend=spentThisMonth(), budget=Number(state.profile.monthlyBudget||0), g=garageSpend(); const arr=[]; if(budget) arr.push({title:spend>budget?'Budget alert':'Budget on track',text:spend>budget?`You are ${money(spend-budget)} over budget this month.`:`You still have ${money(Math.max(0,budget-spend))} available this month.`}); if(g>0)arr.push({title:'Car costs detected',text:`Garage-related spending is ${money(g)} this month.`}); const open=state.tasks.filter(t=>!t.done&&t.date===todayISO()).length; arr.push({title:'Today at a glance',text:`You have ${open} unfinished task${open===1?'':'s'} scheduled for today.`}); return arr.slice(0,3)}

function bindView(){
 $$('[data-go]').forEach(b=>b.onclick=()=>{$(`.nav-item[data-view="${b.dataset.go}"]`).click()});
 $$('[data-add]').forEach(b=>b.onclick=()=>openAdd(b.dataset.add));
 $$('[data-toggle-task]').forEach(b=>b.onclick=()=>{const t=state.tasks.find(x=>x.id===b.dataset.toggleTask);if(t){t.done=!t.done;save()}});
 $$('[data-delete-task]').forEach(b=>b.onclick=()=>{state.tasks=state.tasks.filter(x=>x.id!==b.dataset.deleteTask);save()});
 $$('[data-delete-tx]').forEach(b=>b.onclick=()=>{state.transactions=state.transactions.filter(x=>x.id!==b.dataset.deleteTx);save()});
 $$('[data-delete-vehicle]').forEach(b=>b.onclick=()=>{state.vehicles=state.vehicles.filter(x=>x.id!==b.dataset.deleteVehicle);save()});
 $$('[data-car-expense]').forEach(b=>b.onclick=()=>openCarExpense(b.dataset.carExpense));
 $$('[data-edit-vehicle]').forEach(b=>b.onclick=()=>openVehicleUpdate(b.dataset.editVehicle));
 $('[data-edit-profile]')?.addEventListener('click',openProfile);
 $('[data-export]')?.addEventListener('click',()=>{const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='nexora-data.json';a.click();URL.revokeObjectURL(a.href)});
 $('[data-reset]')?.addEventListener('click',()=>{if(confirm('Reset Nexora to demo data?')){localStorage.removeItem('nexora-state');state=structuredClone(defaults);save()}})
}
function showModal(html){$('#modal').innerHTML=html;$('#modalBackdrop').classList.remove('hidden');$('[data-close]')?.addEventListener('click',closeModal)}
function closeModal(){$('#modalBackdrop').classList.add('hidden')}
function modalForm(title,body,submit='Save'){return `<h2>${title}</h2><form class="form" id="modalForm">${body}<div class="modal-actions"><button type="button" class="ghost" data-close>Cancel</button><button class="primary" type="submit">${submit}</button></div></form>`}
function openAdd(type){
 if(type==='task'){
  showModal(modalForm('New task',`<div class="field"><label>Task</label><input name="title" required placeholder="What needs doing?"></div><div class="grid-2"><div class="field"><label>Date</label><input name="date" type="date" value="${todayISO()}" required></div><div class="field"><label>Time</label><input name="time" type="time"></div></div><div class="field"><label>Category</label><select name="category"><option>Personal</option><option>Work</option><option>Garage</option><option>Money</option><option>Other</option></select></div>`));
  $('#modalForm').onsubmit=e=>{e.preventDefault();const f=new FormData(e.target);state.tasks.push({id:uid(),title:f.get('title'),date:f.get('date'),time:f.get('time'),category:f.get('category'),done:false});closeModal();save()}
 }
 if(type==='transaction'){
  showModal(modalForm('New transaction',`<div class="grid-2"><div class="field"><label>Type</label><select name="type"><option value="expense">Expense</option><option value="income">Income</option></select></div><div class="field"><label>Amount</label><input name="amount" type="number" min="0" step="0.01" required placeholder="0.00"></div></div><div class="field"><label>Category</label><select name="category"><option>Food</option><option>Fuel</option><option>Maintenance</option><option>Car</option><option>Insurance</option><option>Shopping</option><option>Bills</option><option>Income</option><option>Other</option></select></div><div class="field"><label>Date</label><input name="date" type="date" value="${todayISO()}" required></div><div class="field"><label>Note</label><input name="note" placeholder="Optional note"></div>`));
  $('#modalForm').onsubmit=e=>{e.preventDefault();const f=new FormData(e.target);state.transactions.push({id:uid(),type:f.get('type'),amount:Number(f.get('amount')),category:f.get('category'),date:f.get('date'),note:f.get('note')});closeModal();save()}
 }
 if(type==='vehicle'){
  showModal(modalForm('Add vehicle',`<div class="field"><label>Vehicle</label><input name="name" required placeholder="BMW 520d Touring"></div><div class="grid-2"><div class="field"><label>Plate</label><input name="plate" placeholder="123 ABC"></div><div class="field"><label>Odometer</label><input name="odometer" type="number" min="0" value="0"></div></div><div class="field"><label>Next service at (km)</label><input name="nextServiceKm" type="number" min="0" value="0"></div><div class="grid-2"><div class="field"><label>Insurance renewal</label><input name="insuranceDate" type="date"></div><div class="field"><label>Inspection</label><input name="inspectionDate" type="date"></div></div>`));
  $('#modalForm').onsubmit=e=>{e.preventDefault();const f=new FormData(e.target);state.vehicles.push({id:uid(),name:f.get('name'),plate:f.get('plate'),odometer:Number(f.get('odometer')),nextServiceKm:Number(f.get('nextServiceKm')),insuranceDate:f.get('insuranceDate'),inspectionDate:f.get('inspectionDate')});closeModal();save()}
 }
}
function openCarExpense(id){const v=state.vehicles.find(x=>x.id===id);if(!v)return;showModal(modalForm(`Add cost · ${esc(v.name)}`,`<div class="grid-2"><div class="field"><label>Type</label><select name="category"><option>Fuel</option><option>Maintenance</option><option>Insurance</option><option>Car</option></select></div><div class="field"><label>Amount</label><input name="amount" type="number" min="0" step="0.01" required></div></div><div class="field"><label>Date</label><input name="date" type="date" value="${todayISO()}" required></div><div class="field"><label>Note</label><input name="note" value="${esc(v.name)}"></div>`));$('#modalForm').onsubmit=e=>{e.preventDefault();const f=new FormData(e.target);state.transactions.push({id:uid(),type:'expense',amount:Number(f.get('amount')),category:f.get('category'),date:f.get('date'),note:f.get('note')||v.name});closeModal();save()}}
function openVehicleUpdate(id){const v=state.vehicles.find(x=>x.id===id);if(!v)return;showModal(modalForm(`Update · ${esc(v.name)}`,`<div class="field"><label>Current odometer</label><input name="odometer" type="number" min="0" value="${v.odometer||0}" required></div><div class="field"><label>Next service at</label><input name="nextServiceKm" type="number" min="0" value="${v.nextServiceKm||0}"></div>`));$('#modalForm').onsubmit=e=>{e.preventDefault();const f=new FormData(e.target);v.odometer=Number(f.get('odometer'));v.nextServiceKm=Number(f.get('nextServiceKm'));closeModal();save()}}
function openProfile(){const p=state.profile;showModal(modalForm('Edit profile',`<div class="field"><label>Name</label><input name="name" value="${esc(p.name)}"></div><div class="field"><label>Monthly budget</label><input name="monthlyBudget" type="number" min="0" step="0.01" value="${p.monthlyBudget||0}"></div><div class="grid-2"><div class="field"><label>Savings goal</label><input name="savingsGoal" type="number" min="0" step="0.01" value="${p.savingsGoal||0}"></div><div class="field"><label>Currently saved</label><input name="savingsCurrent" type="number" min="0" step="0.01" value="${p.savingsCurrent||0}"></div></div>`));$('#modalForm').onsubmit=e=>{e.preventDefault();const f=new FormData(e.target);state.profile={...p,name:f.get('name'),monthlyBudget:Number(f.get('monthlyBudget')),savingsGoal:Number(f.get('savingsGoal')),savingsCurrent:Number(f.get('savingsCurrent'))};closeModal();save()}}

init();
