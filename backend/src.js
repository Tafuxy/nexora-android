const EB_BASE = 'https://api.enablebanking.com';
let cachedPrivateKey = null;
let cachedFirebasePrivateKey = null;
let cachedFirebaseAccessToken = null;
let cachedFirebaseAccessTokenExp = 0;

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
          mode: 'linked-accounts-compatible',
          push_configured: pushConfigured(env),
          push_polling: 'bank-safe-background-interval'
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
          <p>If you allow notifications, Nexora may alert you about incoming or outgoing money, bill due dates, spending limits, vehicle service, insurance and inspection dates. Android push delivery uses Firebase Cloud Messaging and a device-specific Firebase registration token. Notification detail level can be changed in Nexora settings.</p>
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

        let session;
        try {
          session = await eb(env, `/sessions/${encodeURIComponent(payload.sid)}`);
        } catch (err) {
          if (needsReauthorization(err)) {
            return json({
              connected: false,
              status: sessionStatusFromError(err),
              reauthorization_required: true,
              reason: 'bank_authorization_ended',
              accounts: [],
              transactions: []
            });
          }
          throw err;
        }
        if (session.status !== 'AUTHORIZED') {
          const mustReauthorize = ['CLOSED', 'EXPIRED', 'REVOKED', 'INVALID', 'CANCELLED'].includes(String(session.status || '').toUpperCase());
          return json({
            connected: false,
            status: session.status || 'UNKNOWN',
            reauthorization_required: mustReauthorize,
            reason: mustReauthorize ? 'bank_authorization_ended' : 'bank_unavailable',
            accounts: [],
            transactions: []
          });
        }

        const stableHashByUid = new Map((session.accounts_data || []).map(row => [String(row?.uid || ''), String(row?.identification_hash || '')]));
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
            identification_hash: String(details?.identification_hash || stableHashByUid.get(String(accountId)) || ''),
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
          if (txResult.reauthorization_required) {
            return json({
              connected: false,
              status: txResult.status || 'CLOSED',
              reauthorization_required: true,
              reason: 'bank_authorization_ended',
              accounts: [],
              transactions: []
            });
          }
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
          transaction_access: Boolean(session?.access?.transactions),
          transaction_range: {
            date_from: new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth() - 1, 1)).toISOString().slice(0, 10),
            date_to: new Date().toISOString().slice(0, 10)
          },
          warnings,
          synced_at: new Date().toISOString()
        });
      }

      if (url.pathname === '/api/push/register' && request.method === 'POST') {
        requireConfigured(env);
        if (!env.PUSH_REGISTRY) throw httpError(503, 'Push registry is not configured');
        const body = await readJson(request);
        const installId = validateInstall(body.install_id);
        const handle = String(body.bank_handle || '');
        const token = String(body.token || '').trim();
        if (!token || token.length < 20 || token.length > 4096) throw httpError(400, 'Invalid FCM registration token');
        const payload = await verifyHandle(env, handle);
        if (payload.install !== installId) throw httpError(403, 'Connection does not belong to this installation');
        if (payload.phase !== 'session' || !payload.sid) throw httpError(409, 'Bank connection is not authorized yet');

        const notifications = normalizePushSettings(body.notifications || {});
        const known = Array.isArray(body.known_bank_keys)
          ? body.known_bank_keys.map(String).filter(Boolean).slice(-1500)
          : [];
        await registryRequest(env, '/upsert', {
          method: 'POST',
          body: {
            installId,
            bankHandle: handle,
            token,
            platform: String(body.platform || 'android'),
            language: String(body.language || 'et').toLowerCase() === 'en' ? 'en' : 'et',
            notifications,
            knownBankKeys: known,
            updatedAt: Date.now()
          }
        });
        return json({ ok: true, push_configured: pushConfigured(env) });
      }

      if (url.pathname === '/api/push/status' && request.method === 'POST') {
        const body = await readJson(request);
        const installId = validateInstall(body.install_id);
        const row = await registryRequest(env, `/get?install=${encodeURIComponent(installId)}`);
        return json({ registered: Boolean(row?.registration), push_configured: pushConfigured(env), registered_at: row?.registration?.updatedAt || null, last_poll: row?.registration?.lastPollAt || null, next_poll: row?.registration?.nextPollAt || null, last_error: row?.registration?.lastError || '' });
      }

      if (url.pathname === '/api/push/test' && request.method === 'POST') {
        requireConfigured(env);
        if (!pushConfigured(env)) throw httpError(503, 'Push notifications are not configured');
        const body = await readJson(request);
        const installId = validateInstall(body.install_id);
        const row = await registryRequest(env, `/get?install=${encodeURIComponent(installId)}`);
        const registration = row?.registration;
        if (!registration?.token) throw httpError(409, 'This phone has not registered for push notifications yet');
        const et = registration.language !== 'en';
        await sendFcm(env, registration.token, {
          title: 'Nexora',
          body: et ? 'Testteavitus töötab.' : 'Test notification is working.',
          data: { type: 'test', bank_key: `test-${Date.now()}` }
        });
        return json({ ok: true, registered: true });
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
  },

  async scheduled(controller, env, ctx) {
    ctx.waitUntil(runPushPoll(env));
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
  // Nexora only needs recent transactions for the monthly overview. Swedbank requires
  // additional SCA for archive transactions older than 90 days, so never start with
  // `strategy=longest` or an over-90-day range. Those requests can turn a simple
  // current-month sync into an SCA/rate-limit failure while balances still work.
  const now = new Date();
  const dateTo = now.toISOString().slice(0, 10);
  const dateFrom = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1)).toISOString().slice(0, 10);
  const attempts = [
    { date_from: dateFrom, date_to: dateTo },
    { date_from: dateFrom },
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
        const suffix = qs.toString();
        const data = await eb(env, `/accounts/${encodeURIComponent(accountId)}/transactions${suffix ? `?${suffix}` : ''}`, { headers: psuHeaders });
        for (const tx of (Array.isArray(data.transactions) ? data.transactions : [])) {
          const key = String(tx?.transaction_id || tx?.entry_reference || JSON.stringify(tx));
          if (seen.has(key)) continue;
          seen.add(key);
          out.push(tx);
        }
        continuation = String(data.continuation_key || '');
        if (!continuation) break;
      }
      return { transactions: out, warning: '', range: { date_from: dateFrom, date_to: dateTo } };
    } catch (err) {
      if (needsReauthorization(err)) {
        return {
          transactions: [],
          warning: '',
          reauthorization_required: true,
          status: sessionStatusFromError(err)
        };
      }
      lastError = err;
    }
  }

  return {
    transactions: [],
    warning: lastError?.message || 'Transactions could not be fetched',
    reauthorization_required: false,
    range: { date_from: dateFrom, date_to: dateTo }
  };
}

function enableBankingErrorCode(err) {
  const details = err?.details || {};
  const candidates = [
    details?.code,
    details?.error_code,
    details?.error?.code,
    details?.detail?.code,
    details?.detail?.error_code,
    err?.code
  ];
  for (const value of candidates) {
    const code = String(value || '').trim().toUpperCase();
    if (code) return code;
  }
  return '';
}

function needsReauthorization(err) {
  const code = enableBankingErrorCode(err);
  if (['CLOSED_SESSION', 'EXPIRED_SESSION'].includes(code)) return true;
  const message = String(err?.message || '').toLowerCase();
  return message.includes('session is closed') || message.includes('session is expired');
}

function sessionStatusFromError(err) {
  const code = enableBankingErrorCode(err);
  if (code === 'EXPIRED_SESSION' || String(err?.message || '').toLowerCase().includes('expired')) return 'EXPIRED';
  if (code === 'CLOSED_SESSION' || String(err?.message || '').toLowerCase().includes('closed')) return 'CLOSED';
  return 'REAUTHORIZATION_REQUIRED';
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
  const date = raw.transaction_date || raw.transactionDate || raw.booking_date || raw.bookingDate || raw.value_date || raw.valueDate || new Date().toISOString().slice(0, 10);
  const debtor = raw?.debtor?.name || raw?.debtorName || '';
  const creditor = raw?.creditor?.name || raw?.creditorName || '';
  const debtorIban = String(raw?.debtor_account?.iban || raw?.debtorAccount?.iban || '').replace(/\s+/g, '').toUpperCase();
  const creditorIban = String(raw?.creditor_account?.iban || raw?.creditorAccount?.iban || '').replace(/\s+/g, '').toUpperCase();
  const partyName = isCredit ? debtor : creditor;
  const counterpartyIban = isCredit ? debtorIban : creditorIban;
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
    counterparty_iban: counterpartyIban,
    status: status || '',
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

function pushConfigured(env) {
  return Boolean(env.FIREBASE_SERVICE_ACCOUNT_JSON && env.PUSH_REGISTRY);
}

function normalizePushSettings(input) {
  const privacy = ['full', 'hideAmount', 'generic'].includes(String(input?.privacy || '')) ? String(input.privacy) : 'hideAmount';
  return {
    moneyReceived: input?.moneyReceived !== false,
    moneySpent: input?.moneySpent !== false,
    privacy
  };
}

async function registryRequest(env, path, options = {}) {
  if (!env.PUSH_REGISTRY) throw httpError(503, 'Push registry is not configured');
  const id = env.PUSH_REGISTRY.idFromName('nexora-global');
  const stub = env.PUSH_REGISTRY.get(id);
  const response = await stub.fetch(`https://registry${path}`, {
    method: options.method || 'GET',
    headers: { 'Content-Type': 'application/json' },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined
  });
  const text = await response.text();
  let data = {};
  try { data = text ? JSON.parse(text) : {}; } catch { data = {}; }
  if (!response.ok) throw httpError(response.status, data?.error || 'Push registry error');
  return data;
}

async function runPushPoll(env) {
  if (!configured(env) || !pushConfigured(env)) return;
  let list;
  try {
    list = await registryRequest(env, '/list');
  } catch {
    return;
  }

  const registrations = Array.isArray(list?.registrations) ? list.registrations : [];
  for (const registration of registrations.slice(0, 100)) {
    try {
      await pollOneRegistration(env, registration);
    } catch (err) {
      const status = Number(err?.status || 0);
      await registryRequest(env, '/patch', {
        method: 'POST',
        body: {
          installId: registration.installId,
          patch: {
            lastPollAt: Date.now(),
            lastError: String(err?.message || 'Background bank sync failed').slice(0, 240),
            nextPollAt: Date.now() + (status === 429 ? 6 : 6) * 60 * 60 * 1000
          }
        }
      }).catch(() => {});
    }
  }
}

async function pollOneRegistration(env, registration) {
  const now = Date.now();
  if (!registration?.installId || !registration?.bankHandle || !registration?.token) return;
  if (Number(registration.nextPollAt || 0) > now) return;

  const payload = await verifyHandle(env, String(registration.bankHandle));
  if (payload.install !== registration.installId || payload.phase !== 'session' || !payload.sid) {
    throw httpError(403, 'Stored push registration no longer matches the bank session');
  }

  let session;
  try {
    session = await eb(env, `/sessions/${encodeURIComponent(payload.sid)}`);
  } catch (err) {
    if (needsReauthorization(err)) throw httpError(409, 'Bank authorization needs renewal', { reauthorization_required: true, status: sessionStatusFromError(err) });
    throw err;
  }
  if (session.status !== 'AUTHORIZED') {
    const status = String(session.status || 'not authorized');
    if (['CLOSED', 'EXPIRED', 'REVOKED', 'INVALID', 'CANCELLED'].includes(status.toUpperCase())) {
      throw httpError(409, 'Bank authorization needs renewal', { reauthorization_required: true, status });
    }
    throw httpError(401, `Bank session is ${status}`);
  }

  const transactions = [];
  for (const accountId of session.accounts || []) {
    const recent = await fetchTransactionsBackground(env, accountId);
    for (const raw of recent) {
      const tx = normalizeTransaction(raw, accountId);
      if (tx) transactions.push(tx);
    }
  }
  transactions.sort((a, b) => String(a.date).localeCompare(String(b.date)));

  const seen = new Set(Array.isArray(registration.seenBankKeys) ? registration.seenBankKeys : []);
  for (const key of (registration.knownBankKeys || [])) if (key) seen.add(String(key));
  const seeded = Boolean(registration.seeded || seen.size);
  const newTransactions = [];

  for (const tx of transactions) {
    if (!tx.bank_key) continue;
    if (!seen.has(tx.bank_key) && seeded && isPushRecent(tx.date)) newTransactions.push(tx);
    seen.add(tx.bank_key);
  }

  if (seeded) {
    const accountNames = payload.aliases || {};
    for (const tx of newTransactions.slice(-12)) {
      await sendBankPush(env, registration, tx, String(accountNames[tx.account_id] || ''));
    }
  }

  const seenList = Array.from(seen).slice(-2000);
  await registryRequest(env, '/patch', {
    method: 'POST',
    body: {
      installId: registration.installId,
      patch: {
        seenBankKeys: seenList,
        knownBankKeys: [],
        seeded: true,
        lastPollAt: now,
        lastError: '',
        nextPollAt: now + 6 * 60 * 60 * 1000
      }
    }
  });
}

async function fetchTransactionsBackground(env, accountId) {
  const dateFrom = new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString().slice(0, 10);
  const out = [];
  const seen = new Set();
  let continuation = '';

  for (let page = 0; page < 3; page++) {
    const qs = new URLSearchParams({ date_from: dateFrom });
    if (continuation) qs.set('continuation_key', continuation);
    // Intentionally no PSU headers here: this is a genuine background fetch.
    // Many banks rate-limit these requests; the cron interval is therefore six hours.
    const data = await eb(env, `/accounts/${encodeURIComponent(accountId)}/transactions?${qs.toString()}`);
    for (const tx of (Array.isArray(data.transactions) ? data.transactions : [])) {
      const key = String(tx?.transaction_id || tx?.entry_reference || JSON.stringify(tx));
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(tx);
    }
    continuation = String(data.continuation_key || '');
    if (!continuation) break;
  }
  return out;
}

function isPushRecent(date) {
  const time = Date.parse(String(date || ''));
  if (!Number.isFinite(time)) return false;
  return time >= Date.now() - 48 * 60 * 60 * 1000;
}

async function sendBankPush(env, registration, tx, accountName) {
  const settings = normalizePushSettings(registration.notifications || {});
  const income = tx.type === 'income';
  if (income && !settings.moneyReceived) return;
  if (!income && !settings.moneySpent) return;

  const et = registration.language !== 'en';
  const amount = `${Number(tx.amount || 0).toFixed(2).replace('.', ',')} €`;
  const merchant = String(tx.merchant || tx.note || '').trim();
  let title;
  let body;

  if (settings.privacy === 'generic') {
    title = et ? 'Uus pangategevus' : 'New bank activity';
    body = et ? 'Ava Nexora üksikasjade vaatamiseks.' : 'Open Nexora to view the details.';
  } else if (settings.privacy === 'hideAmount') {
    title = income ? (et ? 'Raha laekus' : 'Money received') : (et ? 'Raha läks kontolt' : 'Money spent');
    body = accountName || (et ? 'Ava Nexora üksikasjade vaatamiseks.' : 'Open Nexora to view the details.');
  } else {
    title = income ? `+${amount} ${et ? 'laekus' : 'received'}` : `−${amount} ${et ? 'kontolt' : 'spent'}`;
    body = [accountName, merchant].filter(Boolean).join(' · ') || (et ? 'Pangatehing' : 'Bank transaction');
  }

  await sendFcm(env, registration.token, {
    title,
    body,
    data: {
      type: 'bank_activity',
      bank_key: String(tx.bank_key || ''),
      transaction_type: income ? 'income' : 'expense',
      account_name: String(accountName || ''),
      amount: String(tx.amount || 0)
    }
  });
}

async function sendFcm(env, token, payload) {
  const service = firebaseServiceAccount(env);
  const accessToken = await firebaseAccessToken(env, service);
  const message = {
    token,
    notification: { title: payload.title, body: payload.body },
    data: Object.fromEntries(Object.entries(payload.data || {}).map(([k, v]) => [k, String(v ?? '')])),
    android: {
      priority: 'HIGH',
      notification: {
        channel_id: 'nexora_bank_activity',
        visibility: 'PRIVATE',
        tag: String(payload.data?.bank_key || payload.data?.type || 'nexora-bank')
      }
    }
  };

  const response = await fetch(`https://fcm.googleapis.com/v1/projects/${encodeURIComponent(service.project_id)}/messages:send`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ message })
  });
  const text = await response.text();
  let data = {};
  try { data = text ? JSON.parse(text) : {}; } catch { data = { detail: text }; }
  if (!response.ok) {
    const msg = data?.error?.message || data?.detail || `FCM error ${response.status}`;
    throw httpError(response.status, String(msg), data);
  }
  return data;
}

function firebaseServiceAccount(env) {
  let data;
  try { data = JSON.parse(String(env.FIREBASE_SERVICE_ACCOUNT_JSON || '')); }
  catch { throw httpError(500, 'FIREBASE_SERVICE_ACCOUNT_JSON is invalid JSON'); }
  if (!data?.project_id || !data?.client_email || !data?.private_key) {
    throw httpError(500, 'Firebase service account JSON is missing required fields');
  }
  return data;
}

async function firebaseAccessToken(env, service) {
  const now = Math.floor(Date.now() / 1000);
  if (cachedFirebaseAccessToken && cachedFirebaseAccessTokenExp > now + 60) return cachedFirebaseAccessToken;

  const header = { alg: 'RS256', typ: 'JWT' };
  const claims = {
    iss: service.client_email,
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600
  };
  const unsigned = `${base64urlJson(header)}.${base64urlJson(claims)}`;
  const key = await firebasePrivateKey(service.private_key);
  const signature = await crypto.subtle.sign(
    { name: 'RSASSA-PKCS1-v1_5' },
    key,
    new TextEncoder().encode(unsigned)
  );
  const assertion = `${unsigned}.${base64url(new Uint8Array(signature))}`;
  const form = new URLSearchParams({
    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    assertion
  });
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form.toString()
  });
  const data = await response.json();
  if (!response.ok || !data.access_token) throw httpError(response.status || 500, data?.error_description || 'Could not authenticate with Firebase');
  cachedFirebaseAccessToken = data.access_token;
  cachedFirebaseAccessTokenExp = now + Number(data.expires_in || 3600);
  return cachedFirebaseAccessToken;
}

async function firebasePrivateKey(pemValue) {
  if (cachedFirebasePrivateKey) return cachedFirebasePrivateKey;
  const pem = String(pemValue || '').replace(/\\n/g, '\n').trim();
  const der = pemToDer(pem, 'PRIVATE KEY');
  cachedFirebasePrivateKey = await crypto.subtle.importKey(
    'pkcs8',
    der,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );
  return cachedFirebasePrivateKey;
}

export class PushRegistry {
  constructor(state, env) {
    this.state = state;
    this.env = env;
  }

  async fetch(request) {
    const url = new URL(request.url);
    const registrations = (await this.state.storage.get('registrations')) || {};

    if (url.pathname === '/list' && request.method === 'GET') {
      return new Response(JSON.stringify({ registrations: Object.values(registrations) }), { headers: { 'Content-Type': 'application/json' } });
    }

    if (url.pathname === '/get' && request.method === 'GET') {
      const install = String(url.searchParams.get('install') || '');
      return new Response(JSON.stringify({ registration: registrations[install] || null }), { headers: { 'Content-Type': 'application/json' } });
    }

    if (url.pathname === '/upsert' && request.method === 'POST') {
      const body = await request.json();
      const installId = String(body.installId || '');
      if (!installId) return new Response(JSON.stringify({ error: 'installId required' }), { status: 400 });
      const previous = registrations[installId] || {};
      const known = new Set([...(previous.seenBankKeys || []), ...(previous.knownBankKeys || []), ...(body.knownBankKeys || [])]);
      registrations[installId] = {
        ...previous,
        ...body,
        notifications: { ...(previous.notifications || {}), ...(body.notifications || {}) },
        knownBankKeys: Array.from(known).slice(-1500),
        seenBankKeys: Array.isArray(previous.seenBankKeys) ? previous.seenBankKeys : [],
        seeded: Boolean(previous.seeded),
        nextPollAt: Number(previous.nextPollAt || 0)
      };
      await this.state.storage.put('registrations', registrations);
      return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });
    }

    if (url.pathname === '/patch' && request.method === 'POST') {
      const body = await request.json();
      const installId = String(body.installId || '');
      if (!installId || !registrations[installId]) return new Response(JSON.stringify({ error: 'registration not found' }), { status: 404 });
      registrations[installId] = { ...registrations[installId], ...(body.patch || {}) };
      await this.state.storage.put('registrations', registrations);
      return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ error: 'not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
  }
}
