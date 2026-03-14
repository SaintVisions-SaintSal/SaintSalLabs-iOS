/* ═══════════════════════════════════════════════════
   SAINTSALLABS — GOOGLE ANALYTICS (gtag)
   Fires GA4 / Google Ads conversion events
   Tag: AW-18012118852
   Patent #10,290,222
═══════════════════════════════════════════════════ */

const GTAG_ID = 'AW-18012118852';
const ENDPOINT = `https://www.google-analytics.com/mp/collect?measurement_id=${GTAG_ID}`;

// Generate or reuse a client ID per install
let _clientId = null;
const getClientId = () => {
  if (!_clientId) {
    _clientId = `${Date.now()}.${Math.floor(Math.random() * 1e9)}`;
  }
  return _clientId;
};

/**
 * Fire a gtag event to Google Analytics Measurement Protocol
 * Works in React Native (no DOM required)
 */
export const logEvent = async (eventName, params = {}) => {
  try {
    await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: getClientId(),
        events: [{ name: eventName, params: { platform: 'ios', ...params } }],
      }),
    });
  } catch {
    // Silent fail — never block the UI for analytics
  }
};

// Convenience helpers
export const logAppOpen    = ()            => logEvent('app_open');
export const logScreenView = (screenName) => logEvent('screen_view', { screen_name: screenName });
export const logSignUp     = (method)     => logEvent('sign_up', { method });
export const logLogin      = (method)     => logEvent('login', { method });
export const logPurchase   = (tier, value) => logEvent('purchase', { currency: 'USD', value, items: [{ item_name: tier }] });
