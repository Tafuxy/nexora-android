const EB_BASE = 'https://api.enablebanking.com';
let cachedPrivateKey = null;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === 'OPTIONS') return cors(new Response(null, { status: 204 }));

    try {
      if (url.pathname === '/health') {
        return json({
          ok: true,
          provider: 'enable-banking',
          configured: configured(env),
          mode: 'linked-accounts-compatible'
        });
      }

      if (url.pathname === '/privacy' && request.method === 'GET') {
        return legalPage('Privacy Policy', `
          <p>Nexora helps you manage personal finances, recurring bills and vehicle information.</p>
          <h2>Bank information</h2>
          <p>When you connect a bank, account information is accessed through Enable Banking with your explicit bank authorization. Nexora does not receive or store your online banking password.</p>
          <p>The mobile app may periodically synchronize connected account balances and transactions in the background so it can keep your overview current and notify you about new account activity. Bank access can be disconnected from Nexora at any time.</p>
          <h2>Device data</h2>
          <p>Your Nexora data is primarily stored on your device. Biometric templates are handled only by Android or iOS and are never available to Nexora.</p>
          <h2>Notifications</h2>
          <p>If you allow notifications, Nexora may alert you about incoming or outgoing money, bill due dates, spending limits, vehicle service, insurance and inspection dates. Notification detail level can be changed in Nexora settings.</p>
          <h2>Contact</h2>
          <p>For data protection questions, contact the email address registered for the Nexora Enable Banking application.</p>
        `);
      }

      if (url.pathname === '/terms' && request.method === 'GET') {
        return legalPage('Terms of Service', `
          <p>Nexora is a personal finance, planning and vehicle-management application.</p>
          <h2>Your responsibility</h2>
          <p>You remain responsible for checking payments, balances, due dates and other financial information with the original provider. Synchronization can be delayed by banks, device background restrictions or network availability.</p>
          <h2>Bank connections</h2>
          <p>Bank connections are provided through Enable Banking and remain subject to your bank's authorization and applicable account-information-service rules.</p>
          <h2>Availability</h2>
          <p>Nexora may change or temporarily interrupt features for security, maintenance or provider compatibility.</p>
        `);
      }

      if (url.pathname === '/bank/callback' && request.method === 'GET') {
        return await bankCallback(url, env);
      }

      if (url.pathname === '/api/banks' && request.method === 'GET') {
        requireConfigured(env);
        const country = (url.searchParams.get('country') || 'EE').toUpperCase();
        const data = await eb(env, `/aspsps?country=${encodeURIComponent(country)}&psu_type=personal&service=AIS`);
        const banks = (data?.aspsps || [])
          .filter(bank => (bank.psu_types || []).includes('personal'))
          .map(bank => ({
            id: bank.name,
            name: bank.name,
            bic: bank.bic || '',
            logo: bank.logo || bank.group?.logo || '',
            countries: [bank.country || country],
            max_access_days: Math.max(1, Math.floor(Number(bank.maximum_consent_validity || 0) / 86400)),
            beta: Boolean(bank.beta)
          }))
          .sort((a, b) => a.name.localeCompare(b.name));
        return json({ banks });
      }

      if (url.pathname === '/api/connect' && request.method === 'POST') {
        requireConfigured(env);
        const body = await readJson(request);
        const bankName = String(body.institution_id || '').trim();
        const installId = validateInstall(body.install_id);
        const language = String(body.language || 'ET').toLowerCase().slice(0, 2) === 'et' ? 'et' : 'en';
        if (!bankName) throw httpError(400, 'institution_id is required');

        const country = 'EE';
        const banksData = await eb(env, `/aspsps?country=${country}&psu_type=personal&service=AIS`);
        const bank = (banksData?.aspsps || []).find(x => x.name === bankName);
        if (!bank) throw httpError(404, 'Selected bank is not available for personal account access');

        const maxConsentSeconds = Math.max(3600, Number(bank.maximum_consent_validity || 30 * 24 * 3600));
        const requestedSeconds = Math.min(maxConsentSeconds, 90 * 24 * 3600);
        const validUntil = new Date(Date.now() + Math.max(3600, requestedSeconds - 60) * 1000).toISOString();
        const origin = `${url.protocol}//${url.host}`;

        const stateHandle = await signHandle(env, {
          phase: 'pending',
          install: installId,
          bank: bankName,
          country,
          exp: Math.floor(Date.now() / 1000) + 30 * 60
        });

        const auth = await eb(env, '/auth', {
          method: 'POST',
          body: {
            access: {
              balances: true,
              transactions: true,
              valid_until: validUntil
            },
            aspsp: { name: bankName, country },
            state: stateHandle,
            redirect_url: `${origin}/bank/callback`,
            psu_type: 'personal',
            language,
            psu_id: installId
          }
        });

        return json({
          authorization_url: auth.url,
          bank_handle: stateHandle,
          requisition_status: 'PENDING_AUTHORIZATION',
          expires_in_days: Math.max(1, Math.floor(requestedSeconds / 86400))
        });
      }

      if (url.pathname === '/api/sync' && request.method === 'POST') {
        requireConfigured(env);
        const body = await readJson(request);
        const installId = validateInstall(body.install_id);
        const payload = await verifyHandle(env, String(body.bank_handle || ''));
        if (payload.install !== installId) throw httpError(403, 'Connection does not belong to this installation');

        if (payload.phase !== 'session' || !payload.sid) {
          return json({ connected: false, status: 'PENDING_AUTHORIZATION', accounts: [], transactions: [] });
        }

        const session = await eb(env, `/sessions/${encodeURIComponent(payload.sid)}`);
        if (session.status !== 'AUTHORIZED') {
          return json({ connected: false, status: session.status || 'UNKNOWN', accounts: [], transactions: [] });
        }

        const accounts = [];
        const transactions = [];
        const warnings = [];
        const psuHeaders = buildPsuHeaders(request);
        for (const accountId of session.accounts || []) {
          const [details, balances] = await Promise.all([
            safeEb(env, `/accounts/${encodeURIComponent(accountId)}/details`),
            safeEb(env, `/accounts/${encodeURIComponent(accountId)}/balances`)
          ]);

          const selectedBalance = pickBalance(balances?.balances || []);
          const bankAlias = String(payload?.aliases?.[accountId] || accountAliasFromResource(details) || '').trim();
          const typeCode = String(payload?.account_types?.[accountId] || accountTypeCode(details) || '').trim();
          accounts.push({
            id: accountId,
            iban: details?.account_id?.iban || '',
            display_name: bankAlias,
            name: bankAlias || details?.details || details?.product || 'Bank account',
            account_type: typeCode,
            owner_name: details?.name || '',
            currency: selectedBalance?.currency || details?.currency || 'EUR',
            balance: numberOrNull(selectedBalance?.amount),
            institution_id: session.aspsp?.name || payload.bank || ''
          });

          const txResult = await fetchTransactions(env, accountId, psuHeaders);
          if (txResult.warning) warnings.push(`${accountId}: ${txResult.warning}`);
          for (const raw of txResult.transactions) {
            const normalized = normalizeTransaction(raw, accountId);
            if (normalized) transactions.push(normalized);
          }
        }

        transactions.sort((a, b) => String(b.date).localeCompare(String(a.date)));
        return json({
          connected: true,
          status: session.status,
          institution_id: session.aspsp?.name || payload.bank || '',
          accounts,
          transactions,
          transaction_count: transactions.length,
          warnings,
          synced_at: new Date().toISOString()
        });
      }

      if (url.pathname === '/api/disconnect' && request.method === 'POST') {
        requireConfigured(env);
        const body = await readJson(request);
        const installId = validateInstall(body.install_id);
        const payload = await verifyHandle(env, String(body.bank_handle || ''));
        if (payload.install !== installId) throw httpError(403, 'Connection does not belong to this installation');
        if (payload.phase === 'session' && payload.sid) {
          await eb(env, `/sessions/${encodeURIComponent(payload.sid)}`, { method: 'DELETE' });
        }
        return json({ ok: true });
      }

      return json({ error: 'Not found' }, 404);
    } catch (err) {
      const status = Number(err?.status || 500);
      return json({ error: err?.message || 'Unexpected error', details: err?.details || undefined }, status);
    }
  }
};

function legalPage(title, body) {
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Nexora · ${title}</title><style>
  :root{color-scheme:dark}*{box-sizing:border-box}body{margin:0;background:#090b0f;color:#f5f7fb;font:16px/1.65 system-ui,-apple-system,Segoe UI,sans-serif}.wrap{width:min(760px,calc(100% - 36px));margin:0 auto;padding:54px 0 80px}.brand{font-size:14px;font-weight:800;color:#8c82ff;letter-spacing:.08em;text-transform:uppercase}h1{font-size:38px;line-height:1.05;margin:12px 0 26px}h2{font-size:19px;margin:30px 0 8px}p{color:#b6bdc9}a{color:#8c82ff}.card{background:#11151b;border:1px solid rgba(255,255,255,.08);border-radius:24px;padding:28px}</style></head><body><main class="wrap"><div class="brand">Nexora</div><h1>${title}</h1><div class="card">${body}</div></main></body></html>`;
  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } });
}

function configured(env) {
  return Boolean(env.ENABLEBANKING_APP_ID && env.ENABLEBANKING_PRIVATE_KEY && env.NEXORA_SESSION_SECRET);
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
  const e = new Error(message);
  e.status = status;
  e.details = details;
  return e;
}

async function readJson(request) {
  try { return await request.json(); }
  catch { throw httpError(400, 'Invalid JSON'); }
}

async function eb(env, path, options = {}) {
  const jwt = await enableBankingJwt(env);
  const headers = new Headers(options.headers || {});
  headers.set('Authorization', `Bearer ${jwt}`);
  headers.set('Accept', 'application/json');
  if (options.body !== undefined) headers.set('Content-Type', 'application/json');

  const response = await fetch(`${EB_BASE}${path}`, {
    method: options.method || 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined
  });

  const text = await response.text();
  let data = {};
  try { data = text ? JSON.parse(text) : {}; }
  catch { data = { detail: text }; }

  if (!response.ok) {
    const msg = data?.detail || data?.message || data?.error?.message || data?.error || `Enable Banking error ${response.status}`;
    throw httpError(response.status, String(msg), data);
  }
  return data;
}

async function safeEb(env, path) {
  try { return await eb(env, path); }
  catch { return null; }
}

async function enableBankingJwt(env) {
  const now = Math.floor(Date.now() / 1000);
  const header = { typ: 'JWT', alg: 'RS256', kid: env.ENABLEBANKING_APP_ID };
  const body = { iss: 'enablebanking.com', aud: 'api.enablebanking.com', iat: now, exp: now + 3600 };
  const unsigned = `${base64urlJson(header)}.${base64urlJson(body)}`;
  const key = await getPrivateKey(env);
  const signature = await crypto.subtle.sign(
    { name: 'RSASSA-PKCS1-v1_5' },
    key,
    new TextEncoder().encode(unsigned)
  );
  return `${unsigned}.${base64url(new Uint8Array(signature))}`;
}

async function getPrivateKey(env) {
  if (cachedPrivateKey) return cachedPrivateKey;
  const pem = String(env.ENABLEBANKING_PRIVATE_KEY || '').replace(/\\n/g, '\n').trim();
  if (!pem.includes('BEGIN PRIVATE KEY')) {
    throw httpError(500, 'ENABLEBANKING_PRIVATE_KEY must be a PKCS#8 PEM private key generated for the Enable Banking application');
  }
  const der = pemToDer(pem, 'PRIVATE KEY');
  cachedPrivateKey = await crypto.subtle.importKey(
    'pkcs8',
    der,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );
  return cachedPrivateKey;
}

function pemToDer(pem, label) {
  const clean = pem
    .replace(`-----BEGIN ${label}-----`, '')
    .replace(`-----END ${label}-----`, '')
    .replace(/\s+/g, '');
  const binary = atob(clean);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

async function fetchTransactions(env, accountId, psuHeaders = {}) {
  const dateFrom = new Date(Date.now() - 120 * 24 * 3600 * 1000).toISOString().slice(0, 10);
  const attempts = [
    { date_from: dateFrom, strategy: 'longest' },
    { date_from: dateFrom },
    { strategy: 'longest' },
    {}
  ];
  let lastError = null;

  for (const baseParams of attempts) {
    try {
      const out = [];
      const seen = new Set();
      let continuation = '';
      for (let page = 0; page < 10; page++) {
        const qs = new URLSearchParams(baseParams);
        if (continuation) qs.set('continuation_key', continuation);
        const data = await eb(env, `/accounts/${encodeURIComponent(accountId)}/transactions?${qs.toString()}`, { headers: psuHeaders });
        for (const tx of (Array.isArray(data.transactions) ? data.transactions : [])) {
          const key = String(tx?.transaction_id || tx?.entry_reference || JSON.stringify(tx));
          if (seen.has(key)) continue;
          seen.add(key);
          out.push(tx);
        }
        continuation = String(data.continuation_key || '');
        if (!continuation) break;
      }
      return { transactions: out, warning: '' };
    } catch (err) {
      lastError = err;
    }
  }

  return { transactions: [], warning: lastError?.message || 'Transactions could not be fetched' };
}

function buildPsuHeaders(request) {
  const input = request?.headers || new Headers();
  const ip = input.get('CF-Connecting-IP') || input.get('X-Forwarded-For') || '';
  const ua = input.get('User-Agent') || 'Nexora Mobile';
  const accept = input.get('Accept') || 'application/json';
  const lang = input.get('Accept-Language') || 'et-EE,en;q=0.8';
  const encoding = input.get('Accept-Encoding') || 'gzip, br';
  const origin = new URL(request.url).origin;
  const h = {};
  if (ip) h['Psu-Ip-Address'] = ip.split(',')[0].trim();
  h['Psu-User-Agent'] = ua;
  h['Psu-Referer'] = origin;
  h['Psu-Accept'] = accept;
  h['Psu-Accept-Charset'] = 'utf-8';
  h['Psu-Accept-Encoding'] = encoding;
  h['Psu-Accept-language'] = lang;
  return h;
}

function pickBalance(list) {
  if (!Array.isArray(list) || !list.length) return null;
  const priorities = ['CLAV', 'CLBD', 'ITAV', 'ITBD', 'OPAV', 'OPBD'];
  const found = priorities.map(type => list.find(x => x.balance_type === type)).find(Boolean) || list[0];
  const amt = found?.balance_amount || {};
  return { amount: amt.amount, currency: amt.currency || 'EUR', type: found?.balance_type || '' };
}

function numberOrNull(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function normalizeTransaction(raw, accountId) {
  const amountObj = raw?.transaction_amount || raw?.transactionAmount || {};
  const amountValue = Number(amountObj.amount);
  if (!Number.isFinite(amountValue) || amountValue === 0) return null;

  const indicator = String(raw?.credit_debit_indicator || raw?.creditDebitIndicator || '').toUpperCase();
  const isCredit = ['CRDT', 'CREDIT', 'CREDITOR'].includes(indicator) || (!indicator && amountValue > 0);
  const signedAmount = isCredit ? Math.abs(amountValue) : -Math.abs(amountValue);
  const date = raw.booking_date || raw.bookingDate || raw.value_date || raw.valueDate || raw.transaction_date || raw.transactionDate || new Date().toISOString().slice(0, 10);
  const debtor = raw?.debtor?.name || raw?.debtorName || '';
  const creditor = raw?.creditor?.name || raw?.creditorName || '';
  const partyName = isCredit ? debtor : creditor;
  const remittanceRaw = raw.remittance_information ?? raw.remittanceInformation ?? '';
  const remittance = Array.isArray(remittanceRaw) ? remittanceRaw.filter(Boolean).join(' · ') : String(remittanceRaw || '');
  const btc = raw?.bank_transaction_code || raw?.bankTransactionCode || {};
  const bankCode = [btc.description, btc.code, btc.sub_code || btc.subCode].filter(Boolean).join(' ');
  const note = [remittance, raw.note, raw.reference_number || raw.referenceNumber, bankCode].filter(Boolean).join(' · ').slice(0, 300);
  const merchant = cleanMerchant(partyName || remittance || raw.note || bankCode || 'Bank transaction');
  const status = String(raw.status || '').toUpperCase();
  const pending = status && !['BOOK', 'ACCC', 'ACSC'].includes(status);
  const txId = raw.entry_reference || raw.entryReference || raw.transaction_id || raw.transactionId || `${date}:${signedAmount}:${merchant}:${raw.reference_number || raw.referenceNumber || ''}`;

  return {
    bank_key: `${accountId}:${txId}`,
    account_id: accountId,
    amount: Math.abs(signedAmount),
    signed_amount: signedAmount,
    currency: amountObj.currency || 'EUR',
    type: isCredit ? 'income' : 'expense',
    date,
    merchant,
    note,
    pending,
    category: classify(merchant, note, signedAmount)
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

function isGenericAccountDescription(value) {
  const raw = String(value || '').trim();
  if (!raw) return true;
  const normalized = raw.toUpperCase().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
  const generic = new Set([
    'CURRENT', 'CURRENT ACCOUNT', 'CHECKING', 'CHECKING ACCOUNT', 'CACC',
    'SAVINGS', 'SAVINGS ACCOUNT', 'SVGS', 'DEPOSIT', 'BANK ACCOUNT',
    'ARVELDUSKONTO', 'HOIUKONTO', 'KONTO'
  ]);
  return generic.has(normalized);
}

function accountAliasFromResource(account) {
  if (!account || typeof account !== 'object') return '';
  // Enable Banking documents `details` as the account description set by the PSU
  // or provided by the ASPSP. Prefer that for the user's own bank-side nickname.
  const details = String(account.details || '').trim();
  if (details && !isGenericAccountDescription(details)) return details;
  return '';
}

function accountTypeCode(account) {
  return String(account?.cash_account_type || account?.cashAccountType || '').trim().toUpperCase();
}

async function bankCallback(url, env) {
  requireConfigured(env);
  const code = String(url.searchParams.get('code') || '');
  const stateValue = String(url.searchParams.get('state') || '');
  if (!code || !stateValue) {
    return callbackPage('Bank connection was not completed', 'Return to Nexora and try again.', '');
  }

  try {
    const pending = await verifyHandle(env, stateValue);
    if (pending.phase !== 'pending' || !pending.install) throw httpError(401, 'Invalid bank authorization state');

    const session = await eb(env, '/sessions', { method: 'POST', body: { code } });
    const accountAliases = {};
    const accountTypes = {};
    for (const account of session?.accounts || []) {
      if (!account || typeof account !== 'object') continue;
      const id = String(account.uid || account.account_id_internal || '').trim();
      if (!id) continue;
      const alias = accountAliasFromResource(account);
      if (alias) accountAliases[id] = alias;
      const typeCode = accountTypeCode(account);
      if (typeCode) accountTypes[id] = typeCode;
    }
    const validUntilMs = Date.parse(session?.access?.valid_until || '');
    const exp = Number.isFinite(validUntilMs)
      ? Math.floor(validUntilMs / 1000)
      : Math.floor(Date.now() / 1000) + 90 * 24 * 3600;

    const finalHandle = await signHandle(env, {
      phase: 'session',
      sid: session.session_id,
      install: pending.install,
      bank: session?.aspsp?.name || pending.bank || '',
      country: session?.aspsp?.country || pending.country || 'EE',
      aliases: accountAliases,
      account_types: accountTypes,
      exp
    });

    return callbackPage(
      'Bank connected',
      'Return to Nexora. Your accounts and transactions will sync after you unlock the app.',
      finalHandle
    );
  } catch (err) {
    return callbackPage('Bank connection failed', err?.message || 'Return to Nexora and try again.', '');
  }
}

function callbackPage(title, text, handle) {
  const deepLink = handle ? `nexora://bank-connected?handle=${encodeURIComponent(handle)}` : 'nexora://bank-connected';
  const html = `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><meta charset="utf-8"><title>Nexora</title><style>html,body{height:100%;margin:0;font-family:system-ui,-apple-system,sans-serif;background:#090b0f;color:#f7f8fb}body{display:grid;place-items:center}.c{max-width:420px;padding:32px;text-align:center}.m{width:72px;height:72px;border-radius:22px;margin:0 auto 20px;background:linear-gradient(135deg,#6656ed,#4e78e8);display:grid;place-items:center;font-size:32px;font-weight:800}h1{font-size:27px;margin:0 0 10px}p{color:#9ba5b5;line-height:1.5}a{display:block;background:#6656ed;color:white;text-decoration:none;padding:15px 20px;border-radius:14px;font-weight:750;margin-top:22px}</style></head><body><div class="c"><div class="m">N</div><h1>${escapeHtml(title)}</h1><p>${escapeHtml(text)}</p><a href="${escapeHtml(deepLink)}">Return to Nexora</a></div><script>setTimeout(()=>{location.href=${JSON.stringify(deepLink)}},600)</script></body></html>`;
  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } });
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
  try { payload = JSON.parse(new TextDecoder().decode(base64urlDecode(body))); }
  catch { throw httpError(401, 'Invalid bank connection'); }
  if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) throw httpError(401, 'Bank connection has expired');
  return payload;
}

async function hmacKey(env) {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(env.NEXORA_SESSION_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

function base64urlJson(value) {
  return base64url(new TextEncoder().encode(JSON.stringify(value)));
}

function base64url(bytes) {
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function base64urlDecode(value) {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - value.length % 4) % 4);
  const binary = atob(padded);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
  return out;
}

function escapeHtml(value) {
  return String(value || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function json(value, status = 200) {
  return cors(new Response(JSON.stringify(value), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }
  }));
}

function cors(response) {
  const h = new Headers(response.headers);
  h.set('Access-Control-Allow-Origin', '*');
  h.set('Access-Control-Allow-Headers', 'Content-Type');
  h.set('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers: h });
}
