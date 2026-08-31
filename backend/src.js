const GC_BASE = 'https://bankaccountdata.gocardless.com/api/v2';
let cachedAccess = null;
let cachedAccessExp = 0;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === 'OPTIONS') return cors(new Response(null, { status: 204 }));

    try {
      if (url.pathname === '/health') {
        return json({ ok: true, provider: 'gocardless-bank-account-data', configured: configured(env) });
      }
      if (url.pathname === '/bank/callback') {
        return bankCallback(url);
      }
      if (url.pathname === '/api/banks' && request.method === 'GET') {
        requireConfigured(env);
        const country = (url.searchParams.get('country') || 'EE').toUpperCase();
        const banks = await gc(env, `/institutions/?country=${encodeURIComponent(country)}`);
        return json({ banks: (Array.isArray(banks) ? banks : []).map(b => ({
          id: b.id,
          name: b.name,
          bic: b.bic || '',
          logo: b.logo || '',
          countries: b.countries || [],
          transaction_days: Number(b.transaction_total_days || 0),
          max_access_days: Number(b.max_access_valid_for_days || 90)
        })) });
      }
      if (url.pathname === '/api/connect' && request.method === 'POST') {
        requireConfigured(env);
        const body = await readJson(request);
        const institutionId = String(body.institution_id || '').trim();
        const installId = validateInstall(body.install_id);
        const language = String(body.language || 'ET').toUpperCase().slice(0, 2);
        if (!institutionId) throw httpError(400, 'institution_id is required');

        const origin = `${url.protocol}//${url.host}`;
        const reference = crypto.randomUUID();
        const requisition = await gc(env, '/requisitions/', {
          method: 'POST',
          body: {
            redirect: `${origin}/bank/callback`,
            institution_id: institutionId,
            reference,
            user_language: language === 'ET' ? 'ET' : 'EN',
            account_selection: true,
            redirect_immediate: true
          }
        });
        const handle = await signHandle(env, {
          rid: requisition.id,
          install: installId,
          ref: reference,
          institution_id: institutionId,
          exp: Math.floor(Date.now() / 1000) + 100 * 24 * 3600
        });
        return json({
          authorization_url: requisition.link,
          bank_handle: handle,
          requisition_status: requisition.status,
          expires_in_days: 90
        });
      }
      if (url.pathname === '/api/sync' && request.method === 'POST') {
        requireConfigured(env);
        const body = await readJson(request);
        const installId = validateInstall(body.install_id);
        const payload = await verifyHandle(env, String(body.bank_handle || ''));
        if (payload.install !== installId) throw httpError(403, 'Connection does not belong to this installation');

        const requisition = await gc(env, `/requisitions/${encodeURIComponent(payload.rid)}/`);
        if (requisition.status !== 'LN') {
          return json({ connected: false, status: requisition.status, accounts: [], transactions: [] });
        }

        const accounts = [];
        const transactions = [];
        for (const accountId of requisition.accounts || []) {
          const [meta, details, balances, tx] = await Promise.all([
            safeGc(env, `/accounts/${encodeURIComponent(accountId)}/`),
            safeGc(env, `/accounts/${encodeURIComponent(accountId)}/details/`),
            safeGc(env, `/accounts/${encodeURIComponent(accountId)}/balances/`),
            safeGc(env, `/accounts/${encodeURIComponent(accountId)}/transactions/`)
          ]);
          const detail = details?.account || {};
          const balanceList = balances?.balances || [];
          const selectedBalance = pickBalance(balanceList);
          accounts.push({
            id: accountId,
            iban: detail.iban || meta?.iban || '',
            name: detail.name || meta?.name || detail.product || 'Bank account',
            owner_name: detail.ownerName || meta?.owner_name || '',
            currency: selectedBalance?.currency || detail.currency || 'EUR',
            balance: numberOrNull(selectedBalance?.amount),
            institution_id: requisition.institution_id || payload.institution_id || ''
          });

          const booked = tx?.transactions?.booked || [];
          const pending = tx?.transactions?.pending || [];
          for (const raw of [...booked.map(x => ({ ...x, pending: false })), ...pending.map(x => ({ ...x, pending: true }))]) {
            const normalized = normalizeTransaction(raw, accountId);
            if (normalized) transactions.push(normalized);
          }
        }

        transactions.sort((a, b) => String(b.date).localeCompare(String(a.date)));
        return json({
          connected: true,
          status: requisition.status,
          institution_id: requisition.institution_id || payload.institution_id || '',
          accounts,
          transactions,
          synced_at: new Date().toISOString()
        });
      }
      if (url.pathname === '/api/disconnect' && request.method === 'POST') {
        requireConfigured(env);
        const body = await readJson(request);
        const installId = validateInstall(body.install_id);
        const payload = await verifyHandle(env, String(body.bank_handle || ''));
        if (payload.install !== installId) throw httpError(403, 'Connection does not belong to this installation');
        await gc(env, `/requisitions/${encodeURIComponent(payload.rid)}/`, { method: 'DELETE' });
        return json({ ok: true });
      }
      return json({ error: 'Not found' }, 404);
    } catch (err) {
      const status = Number(err?.status || 500);
      return json({ error: err?.message || 'Unexpected error', details: err?.details || undefined }, status);
    }
  }
};

function configured(env) {
  return Boolean(env.GOCARDLESS_SECRET_ID && env.GOCARDLESS_SECRET_KEY && env.NEXORA_SESSION_SECRET);
}
function requireConfigured(env) {
  if (!configured(env)) throw httpError(503, 'Bank sync backend is not configured');
}
function validateInstall(value) {
  const s = String(value || '').trim();
  if (!/^[A-Za-z0-9._:-]{12,128}$/.test(s)) throw httpError(400, 'Invalid installation id');
  return s;
}
function httpError(status, message, details) {
  const e = new Error(message); e.status = status; e.details = details; return e;
}
async function readJson(request) {
  try { return await request.json(); } catch { throw httpError(400, 'Invalid JSON'); }
}

async function gc(env, path, options = {}) {
  const token = await getAccessToken(env);
  const headers = new Headers(options.headers || {});
  headers.set('Authorization', `Bearer ${token}`);
  headers.set('Accept', 'application/json');
  if (options.body !== undefined) headers.set('Content-Type', 'application/json');
  const response = await fetch(`${GC_BASE}${path}`, {
    method: options.method || 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined
  });
  const text = await response.text();
  let data = null;
  try { data = text ? JSON.parse(text) : {}; } catch { data = { detail: text }; }
  if (!response.ok) {
    throw httpError(response.status, data?.detail || data?.summary || `GoCardless error ${response.status}`, data);
  }
  return data;
}
async function safeGc(env, path) {
  try { return await gc(env, path); } catch { return null; }
}
async function getAccessToken(env) {
  const now = Date.now();
  if (cachedAccess && cachedAccessExp - 60_000 > now) return cachedAccess;
  const response = await fetch(`${GC_BASE}/token/new/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ secret_id: env.GOCARDLESS_SECRET_ID, secret_key: env.GOCARDLESS_SECRET_KEY })
  });
  const data = await response.json();
  if (!response.ok || !data.access) throw httpError(response.status || 502, data?.detail || 'Unable to authenticate bank API', data);
  cachedAccess = data.access;
  cachedAccessExp = now + Number(data.access_expires || 86400) * 1000;
  return cachedAccess;
}

function pickBalance(list) {
  if (!Array.isArray(list) || !list.length) return null;
  const priorities = ['interimAvailable', 'closingBooked', 'expected', 'interimBooked', 'openingBooked'];
  const found = priorities.map(type => list.find(x => x.balanceType === type)).find(Boolean) || list[0];
  const amt = found?.balanceAmount || {};
  return { amount: amt.amount, currency: amt.currency || 'EUR', type: found?.balanceType || '' };
}
function numberOrNull(v) {
  const n = Number(v); return Number.isFinite(n) ? n : null;
}
function normalizeTransaction(raw, accountId) {
  const amount = Number(raw?.transactionAmount?.amount);
  if (!Number.isFinite(amount)) return null;
  const date = raw.bookingDate || raw.valueDate || raw.bookingDateTime?.slice?.(0, 10) || new Date().toISOString().slice(0, 10);
  const merchant = raw.creditorName || raw.debtorName || raw.remittanceInformationUnstructured || raw.additionalInformation || raw.remittanceInformationStructured || 'Bank transaction';
  const noteParts = [raw.remittanceInformationUnstructured, raw.additionalInformation, raw.bankTransactionCode].filter(Boolean);
  const normalizedName = cleanMerchant(merchant);
  return {
    bank_key: `${accountId}:${raw.transactionId || raw.internalTransactionId || `${date}:${amount}:${normalizedName}`}`,
    account_id: accountId,
    amount: Math.abs(amount),
    signed_amount: amount,
    currency: raw.transactionAmount?.currency || 'EUR',
    type: amount >= 0 ? 'income' : 'expense',
    date,
    merchant: normalizedName,
    note: noteParts.join(' · ').slice(0, 240),
    pending: Boolean(raw.pending),
    category: classify(normalizedName, noteParts.join(' '), amount)
  };
}
function cleanMerchant(value) {
  return String(value || '').replace(/\s+/g, ' ').replace(/^CARD PAYMENT\s*/i, '').trim().slice(0, 100) || 'Bank transaction';
}
function classify(name, note, signedAmount) {
  const text = `${name} ${note}`.toLowerCase();
  if (signedAmount > 0) {
    if (/salary|palk|wage|payroll|töötasu|tootasu/.test(text)) return 'Salary';
    return 'Income';
  }
  if (/rimi|selver|maxima|prisma|coop.*kauplus|lidl|grocery|food/.test(text)) return 'Food';
  if (/circle k|alexela|olerex|terminal oil|neste|fuel|tankla/.test(text)) return 'Fuel';
  if (/telia|elisa|tele2|internet|mobile|telefon/.test(text)) return 'PhoneInternet';
  if (/elektrum|enefit|elekter|electric|water|vesi|gaas|utilities/.test(text)) return 'Utilities';
  if (/spotify|netflix|youtube|apple\.com\/bill|google.*storage|subscription/.test(text)) return 'Subscription';
  if (/insurance|kindlustus|if kindlustus|ergo|pzu|compensa/.test(text)) return 'Insurance';
  if (/rent|üür|uur|mortgage|home loan|kodulaen/.test(text)) return 'Rent';
  if (/loan|liising|lease|credit|laen/.test(text)) return 'Loan';
  if (/bolt|uber|taxi|parking|parkimine/.test(text)) return 'Car';
  if (/auto|car service|rehv|tire|remont|repair|automaailm|fixus/.test(text)) return 'Maintenance';
  if (/amazon|temu|aliexpress|zalando|shopping/.test(text)) return 'Shopping';
  return 'Other';
}

async function signHandle(env, payload) {
  const body = base64url(new TextEncoder().encode(JSON.stringify(payload)));
  const key = await hmacKey(env);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body));
  return `${body}.${base64url(new Uint8Array(sig))}`;
}
async function verifyHandle(env, handle) {
  const [body, sig] = handle.split('.');
  if (!body || !sig) throw httpError(401, 'Invalid bank connection');
  const key = await hmacKey(env);
  const ok = await crypto.subtle.verify('HMAC', key, base64urlDecode(sig), new TextEncoder().encode(body));
  if (!ok) throw httpError(401, 'Invalid bank connection');
  let payload;
  try { payload = JSON.parse(new TextDecoder().decode(base64urlDecode(body))); } catch { throw httpError(401, 'Invalid bank connection'); }
  if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) throw httpError(401, 'Bank connection has expired');
  return payload;
}
async function hmacKey(env) {
  return crypto.subtle.importKey('raw', new TextEncoder().encode(env.NEXORA_SESSION_SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}
function base64url(bytes) {
  let binary = ''; for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}
function base64urlDecode(value) {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - value.length % 4) % 4);
  const binary = atob(padded); const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
  return out;
}

function bankCallback() {
  const html = `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><meta charset="utf-8"><title>Nexora</title><style>html,body{height:100%;margin:0;font-family:system-ui,-apple-system,sans-serif;background:#090b0f;color:#f7f8fb}body{display:grid;place-items:center}.c{max-width:420px;padding:32px;text-align:center}.m{width:72px;height:72px;border-radius:22px;margin:0 auto 20px;background:linear-gradient(135deg,#6656ed,#4e78e8);display:grid;place-items:center;font-size:32px;font-weight:800}h1{font-size:27px;margin:0 0 10px}p{color:#9ba5b5;line-height:1.5}a{display:block;background:#6656ed;color:white;text-decoration:none;padding:15px 20px;border-radius:14px;font-weight:750;margin-top:22px}</style></head><body><div class="c"><div class="m">N</div><h1>Bank connected</h1><p>You can return to Nexora. Your accounts and transactions will sync automatically.</p><a href="nexora://bank-connected">Return to Nexora</a></div><script>setTimeout(()=>{location.href='nexora://bank-connected'},500)</script></body></html>`;
  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } });
}
function json(value, status = 200) {
  return cors(new Response(JSON.stringify(value), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } }));
}
function cors(response) {
  const h = new Headers(response.headers);
  h.set('Access-Control-Allow-Origin', '*');
  h.set('Access-Control-Allow-Headers', 'Content-Type');
  h.set('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers: h });
}
