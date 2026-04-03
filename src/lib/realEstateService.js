/* ═══════════════════════════════════════════════════
   SAINTSALLABS — REAL ESTATE SERVICE
   Shared between iOS + Web
   Perplexity · Tavily · Claude · Alpaca · Apollo · GHL
═══════════════════════════════════════════════════ */

import { API_BASE, API_KEY, MCP_KEY, SAL_BACKEND } from './api';

/* ─── Alpaca Paper Trading ───────────────────────── */
const ALPACA_BASE   = 'https://paper-api.alpaca.markets';
const ALPACA_KEY    = '';  // Set via backend proxy
const ALPACA_SECRET = '';  // Set via backend proxy
const ALPACA_HEADERS = {
  'APCA-API-KEY-ID':     ALPACA_KEY,
  'APCA-API-SECRET-KEY': ALPACA_SECRET,
  'Content-Type':        'application/json',
};

/* ─── GHL ────────────────────────────────────────── */
const GHL_BASE     = 'https://services.leadconnectorhq.com';
const GHL_TOKEN    = '';
const GHL_LOCATION = 'oRA8vL3OSiCPjpwmEC0V';

/* ─── SAL API Gateway ────────────────────────────── */
const SAL_HEADERS = {
  'Content-Type': 'application/json',
  'x-sal-key':    MCP_KEY,
};

/* ─────────────────────────────────────────────────
   searchForeclosures(query)
   Hits Perplexity + Tavily via SAL gateway
   Returns: [ { title, address, type, price, equity, yield, rent, url } ]
───────────────────────────────────────────────── */
export const searchForeclosures = async (query) => {
  try {
    // Use Platform backend distressed search endpoint
    const params = new URLSearchParams({ query, limit: '12' });
    const res = await fetch(`${SAL_BACKEND}/api/realestate/distressed-search?${params}`, {
      headers: SAL_HEADERS,
    });
    if (!res.ok) throw new Error(`Search failed: ${res.status}`);
    const data = await res.json();

    // Normalize results into property cards
    if (data.properties?.length) {
      return data.properties.map((p, i) => ({
        id: `r_${i}`,
        title:   p.address || 'Distressed Property',
        address: `${p.address || ''}, ${p.city || ''} ${p.state || ''} ${p.zip || ''}`.trim(),
        type:    p.status || (i % 3 === 0 ? 'Foreclosure' : i % 3 === 1 ? 'NOD Filing' : 'Bankruptcy'),
        price:   p.estimated_value ? `$${(p.estimated_value / 1000).toFixed(0)}k` : null,
        equity:  p.equity_estimate ? `${Math.round(p.equity_estimate / (p.estimated_value || 1) * 100)}%` : null,
        yieldPct: p.yield ? `${p.yield}%` : null,
        rent:    p.rent ? `$${p.rent}/mo` : null,
        snippet: p.notes || '',
        url:     '',
        lat:     p.lat || 25.77 + (Math.random() - 0.5) * 0.5,
        lng:     p.lng || -80.19 + (Math.random() - 0.5) * 0.5,
      }));
    }

    return DEMO_PROPERTIES; // Fallback to demo
  } catch (err) {
    console.warn('[RE Search]', err.message);
    return DEMO_PROPERTIES;
  }
};

/* ─────────────────────────────────────────────────
   analyzeProperty(address)
   Claude claude-sonnet-4-6 via SAL gateway
   Returns: { arv, equity, cashflow, strategy, memo }
───────────────────────────────────────────────── */
export const analyzeProperty = async (address) => {
  try {
    const res = await fetch(`${SAL_BACKEND}/api/sal/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode: 'realestate',
        model: 'claude-sonnet-4-6',
        message: `Perform a complete investment analysis for: ${address}. Include ARV, equity position, projected cash flow, best exit strategy (Buy&Hold / Fix&Flip / BRRRR / Wholesale), and a brief investment memo. Format as JSON with keys: arv, equity, cashflow, strategy, memo, pros, cons.`,
        stream: false,
      }),
    });
    const data = await res.json();
    const content = data.content || data.choices?.[0]?.message?.content || '';
    const match = content.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    return { memo: content, strategy: 'Buy & Hold', arv: 'N/A', equity: 'N/A', cashflow: 'N/A' };
  } catch (err) {
    console.error('[analyzeProperty]', err.message);
    return { memo: 'Analysis unavailable', strategy: 'N/A', arv: 'N/A', equity: 'N/A', cashflow: 'N/A' };
  }
};

/* ─────────────────────────────────────────────────
   getAlpacaPortfolio()
   Alpaca Paper Trading API
   Returns: { value, dayChange, dayChangePct, positions }
───────────────────────────────────────────────── */
export const getAlpacaPortfolio = async () => {
  try {
    const [acctRes, posRes] = await Promise.all([
      fetch(`${ALPACA_BASE}/v2/account`,   { headers: ALPACA_HEADERS }),
      fetch(`${ALPACA_BASE}/v2/positions`, { headers: ALPACA_HEADERS }),
    ]);

    const acct = acctRes.ok ? await acctRes.json() : {};
    const positions = posRes.ok ? await posRes.json() : [];

    const value     = parseFloat(acct.portfolio_value || acct.equity || 0);
    const lastEq    = parseFloat(acct.last_equity || value);
    const dayChange = value - lastEq;

    return {
      value,
      dayChange,
      dayChangePct: lastEq > 0 ? ((dayChange / lastEq) * 100).toFixed(2) : '0.00',
      buyingPower: parseFloat(acct.buying_power || 0),
      positions: Array.isArray(positions) ? positions.map(p => ({
        symbol:      p.symbol,
        qty:         parseFloat(p.qty),
        price:       parseFloat(p.current_price || p.avg_entry_price),
        pl:          parseFloat(p.unrealized_pl || 0),
        plPct:       parseFloat(p.unrealized_plpc || 0) * 100,
        marketValue: parseFloat(p.market_value || 0),
      })) : [],
    };
  } catch (err) {
    console.error('[getAlpacaPortfolio]', err.message);
    return DEMO_PORTFOLIO;
  }
};

/* ─────────────────────────────────────────────────
   getLeads()
   Apollo.io people search
   Returns: [{ name, title, company, email, phone }]
───────────────────────────────────────────────── */
export const getLeads = async (query = 'real estate investor') => {
  try {
    const res = await fetch(`${API_BASE}/api/intel/apollo`, {
      method: 'POST',
      headers: SAL_HEADERS,
      body: JSON.stringify({ query, limit: 10 }),
    });
    if (!res.ok) throw new Error(`Apollo failed: ${res.status}`);
    const data = await res.json();
    return data.contacts || data.people || [];
  } catch (err) {
    console.error('[getLeads]', err.message);
    return [];
  }
};

/* ─────────────────────────────────────────────────
   pushToGHL(lead)
   Pushes a contact to GoHighLevel CRM
───────────────────────────────────────────────── */
export const pushToGHL = async (lead) => {
  try {
    const res = await fetch(`${GHL_BASE}/contacts/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GHL_TOKEN}`,
        'Content-Type':  'application/json',
        'Version':       '2021-07-28',
      },
      body: JSON.stringify({
        locationId:  GHL_LOCATION,
        firstName:   lead.firstName || lead.first_name || '',
        lastName:    lead.lastName  || lead.last_name  || '',
        email:       lead.email || '',
        phone:       lead.phone || '',
        companyName: lead.company || lead.organization?.name || '',
        source:      'SaintSal Real Estate Intel',
        tags:        ['re-lead', 'saintsal-intel'],
      }),
    });
    return res.ok ? await res.json() : null;
  } catch (err) {
    console.error('[pushToGHL]', err.message);
    return null;
  }
};

/* ─── Demo / Fallback Data ───────────────────────── */
export const DEMO_PROPERTIES = [
  {
    id: 'd_0',
    title:    '882 Bellagio Way',
    address:  'Los Angeles, CA 90077',
    type:     'Foreclosure',
    price:    '$4.25M',
    equity:   '62%',
    yieldPct: '8.4%',
    rent:     '$12k/mo',
    snippet:  'NOD filed 14 days ago. LTV 62%. Cash buyer preferred.',
    url:      '',
    lat:      34.0736,
    lng:     -118.4004,
  },
  {
    id: 'd_1',
    title:    '1204 Biscayne Blvd',
    address:  'Miami, FL 33132',
    type:     'NOD Filing',
    price:    '$1.89M',
    equity:   '45%',
    yieldPct: '6.1%',
    rent:     '$9.5k/mo',
    snippet:  'Notice of Default filed. High-intent seller. 45 days to auction.',
    url:      '',
    lat:      25.7917,
    lng:     -80.1918,
  },
  {
    id: 'd_2',
    title:    '44 Highland Ave',
    address:  'Austin, TX 78701',
    type:     'Bankruptcy',
    price:    '$950k',
    equity:   '22%',
    yieldPct: '10.2%',
    rent:     '$5.8k/mo',
    snippet:  'Chapter 7 listing. Motivated seller. Below market.',
    url:      '',
    lat:      30.2672,
    lng:     -97.7431,
  },
  {
    id: 'd_3',
    title:    '992 Ocean Blvd',
    address:  'Malibu, CA 90265',
    type:     'Foreclosure',
    price:    '$6.1M',
    equity:   '71%',
    yieldPct: '5.3%',
    rent:     '$18k/mo',
    snippet:  'Auction in 48 hours. Prime oceanfront. LTV 29%.',
    url:      '',
    lat:      34.0194,
    lng:    -118.4912,
  },
];

export const DEMO_PORTFOLIO = {
  value:        2842109.42,
  dayChange:    47821.33,
  dayChangePct: '2.41',
  buyingPower:  500000,
  positions: [
    { symbol: 'AAPL', qty: 120, price: 184.21, pl: 14.20,  plPct: 8.34,  marketValue: 22105.20 },
    { symbol: 'TSLA', qty: 45,  price: 212.50, pl: -3.12,  plPct: -1.45, marketValue: 9562.50  },
    { symbol: 'NVDA', qty: 60,  price: 875.00, pl: 42.10,  plPct: 5.06,  marketValue: 52500.00 },
    { symbol: 'AMZN', qty: 80,  price: 182.30, pl: -8.45,  plPct: -4.43, marketValue: 14584.00 },
  ],
};
